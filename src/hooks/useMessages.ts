import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const useMessages = (partnerId?: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data: messagesData, error } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    // Group by conversation partner
    const conversationMap = new Map<string, Message[]>();
    messagesData?.forEach((msg) => {
      const partnerId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, []);
      }
      conversationMap.get(partnerId)!.push(msg);
    });

    // Get partner profiles
    const partnerIds = Array.from(conversationMap.keys());
    if (partnerIds.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .in("user_id", partnerIds);

    const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

    const convos: Conversation[] = partnerIds.map((partnerId) => {
      const msgs = conversationMap.get(partnerId)!;
      const lastMsg = msgs[0];
      const profile = profileMap.get(partnerId);
      const unreadCount = msgs.filter(
        (m) => m.receiver_id === user.id && !m.read_at
      ).length;

      return {
        partnerId,
        partnerName: profile?.full_name || "Unknown User",
        partnerAvatar: profile?.avatar_url,
        lastMessage: lastMsg.content,
        lastMessageTime: lastMsg.created_at,
        unreadCount,
      };
    });

    convos.sort(
      (a, b) =>
        new Date(b.lastMessageTime).getTime() -
        new Date(a.lastMessageTime).getTime()
    );

    setConversations(convos);
    setLoading(false);
  }, [user]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async () => {
    if (!user || !partnerId) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
      return;
    }

    setMessages(data || []);
    setLoading(false);

    // Mark unread messages as read
    const unreadIds = data
      ?.filter((m) => m.receiver_id === user.id && !m.read_at)
      .map((m) => m.id);

    if (unreadIds && unreadIds.length > 0) {
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .in("id", unreadIds);
    }
  }, [user, partnerId]);

  // Send a message
  const sendMessage = async (content: string, receiverId: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      receiver_id: receiverId,
      content,
    });

    return { error };
  };

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Only add if this message is part of current conversation
          if (partnerId) {
            if (
              (newMessage.sender_id === user.id && newMessage.receiver_id === partnerId) ||
              (newMessage.sender_id === partnerId && newMessage.receiver_id === user.id)
            ) {
              setMessages((prev) => [...prev, newMessage]);
              
              // Mark as read if we're the receiver
              if (newMessage.receiver_id === user.id) {
                supabase
                  .from("messages")
                  .update({ read_at: new Date().toISOString() })
                  .eq("id", newMessage.id);
              }
            }
          }
          
          // Refresh conversations list
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, partnerId, fetchConversations]);

  // Initial fetch
  useEffect(() => {
    if (partnerId) {
      fetchMessages();
    } else {
      fetchConversations();
    }
  }, [fetchMessages, fetchConversations, partnerId]);

  return {
    messages,
    conversations,
    loading,
    sendMessage,
    refetch: partnerId ? fetchMessages : fetchConversations,
  };
};
