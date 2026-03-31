import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircleQuestion } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
}

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
}

export const AdminSupportPanel = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch all tickets
  useEffect(() => {
    const fetchTickets = async () => {
      const { data: ticketsData } = await supabase
        .from("support_tickets")
        .select("*")
        .order("updated_at", { ascending: false });

      if (ticketsData) {
        // Fetch user names
        const userIds = [...new Set(ticketsData.map((t: any) => t.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p.full_name]) || []);

        setTickets(
          ticketsData.map((t: any) => ({
            ...t,
            user_name: profileMap.get(t.user_id) || "Unknown User",
          }))
        );
      }
      setLoading(false);
    };
    fetchTickets();
  }, []);

  // Fetch messages for active ticket
  useEffect(() => {
    if (!activeTicket) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("support_messages")
        .select("*")
        .eq("ticket_id", activeTicket.id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as SupportMessage[]);
    };
    fetchMessages();

    const channel = supabase
      .channel(`admin-support-${activeTicket.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `ticket_id=eq.${activeTicket.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as SupportMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeTicket]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicket || !user || sending) return;

    setSending(true);
    await supabase.from("support_messages").insert({
      ticket_id: activeTicket.id,
      sender_id: user.id,
      content: newMessage.trim(),
      is_admin: true,
    });
    setNewMessage("");
    setSending(false);
  };

  const handleCloseTicket = async () => {
    if (!activeTicket) return;
    await supabase
      .from("support_tickets")
      .update({ status: "closed" })
      .eq("id", activeTicket.id);

    setActiveTicket({ ...activeTicket, status: "closed" });
    setTickets((prev) =>
      prev.map((t) => (t.id === activeTicket.id ? { ...t, status: "closed" } : t))
    );
  };

  const handleReopenTicket = async () => {
    if (!activeTicket) return;
    await supabase
      .from("support_tickets")
      .update({ status: "open" })
      .eq("id", activeTicket.id);

    setActiveTicket({ ...activeTicket, status: "open" });
    setTickets((prev) =>
      prev.map((t) => (t.id === activeTicket.id ? { ...t, status: "open" } : t))
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Tickets list */}
      <Card className="md:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircleQuestion className="h-5 w-5" />
            Support Tickets ({tickets.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center p-4">No tickets yet.</p>
            ) : (
              <div className="divide-y">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => { setActiveTicket(ticket); setMessages([]); }}
                    className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                      activeTicket?.id === ticket.id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-sm truncate">{ticket.subject}</span>
                      <Badge variant={ticket.status === "open" ? "default" : "secondary"} className="text-xs shrink-0">
                        {ticket.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{ticket.user_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(ticket.created_at), "MMM d, h:mm a")}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat */}
      <Card className="md:col-span-2">
        {activeTicket ? (
          <div className="flex flex-col h-[560px]">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{activeTicket.subject}</h3>
                <p className="text-sm text-muted-foreground">From: {activeTicket.user_name}</p>
              </div>
              {activeTicket.status === "open" ? (
                <Button size="sm" variant="outline" onClick={handleCloseTicket}>
                  Close Ticket
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={handleReopenTicket}>
                  Reopen
                </Button>
              )}
            </div>

            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center mt-4">No messages yet.</p>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.is_admin ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          msg.is_admin
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted rounded-bl-md"
                        }`}
                      >
                        <p className="text-xs font-medium mb-1 opacity-70">
                          {msg.is_admin ? "You (Admin)" : activeTicket.user_name}
                        </p>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.is_admin ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {format(new Date(msg.created_at), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>
              )}
            </ScrollArea>

            {activeTicket.status === "open" && (
              <form onSubmit={handleSend} className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Reply to user..."
                    disabled={sending}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim() || sending}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <CardContent className="h-[560px] flex items-center justify-center text-center">
            <div>
              <MessageCircleQuestion className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Select a ticket to view the conversation</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
