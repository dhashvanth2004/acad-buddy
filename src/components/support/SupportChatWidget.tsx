import { useState, useEffect, useRef } from "react";
import { MessageCircleQuestion, X, Send, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
}

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  created_at: string;
}

export const SupportChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch tickets
  useEffect(() => {
    if (!user || !isOpen) return;

    const fetchTickets = async () => {
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (data) setTickets(data as SupportTicket[]);
    };
    fetchTickets();
  }, [user, isOpen]);

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

    // Realtime subscription
    const channel = supabase
      .channel(`support-${activeTicket.id}`)
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

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCreateTicket = async () => {
    if (!newSubject.trim() || !user) return;
    setSending(true);

    const { data, error } = await supabase
      .from("support_tickets")
      .insert({ user_id: user.id, subject: newSubject.trim() })
      .select()
      .single();

    if (data && !error) {
      const ticket = data as SupportTicket;
      setTickets((prev) => [ticket, ...prev]);
      setActiveTicket(ticket);
      setNewSubject("");
      setShowNewTicket(false);
    }
    setSending(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicket || !user || sending) return;

    setSending(true);
    await supabase.from("support_messages").insert({
      ticket_id: activeTicket.id,
      sender_id: user.id,
      content: newMessage.trim(),
      is_admin: false,
    });
    setNewMessage("");
    setSending(false);
  };

  const renderTicketList = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm">Support</h3>
        <Button size="sm" variant="ghost" onClick={() => setShowNewTicket(true)}>
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </div>

      {showNewTicket && (
        <div className="p-3 border-b space-y-2">
          <Input
            placeholder="What do you need help with?"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreateTicket()}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreateTicket} disabled={sending || !newSubject.trim()}>
              Create
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowNewTicket(false); setNewSubject(""); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        {tickets.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <p>No support tickets yet.</p>
            <p className="mt-1">Click "New" to start a conversation.</p>
          </div>
        ) : (
          <div className="divide-y">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setActiveTicket(ticket)}
                className="w-full text-left p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-sm truncate">{ticket.subject}</span>
                  <Badge variant={ticket.status === "open" ? "default" : "secondary"} className="text-xs shrink-0">
                    {ticket.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(ticket.created_at), "MMM d, h:mm a")}
                </p>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );

  const renderChat = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center gap-2">
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setActiveTicket(null); setMessages([]); }}>
          <X className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm truncate">{activeTicket?.subject}</h3>
          <Badge variant={activeTicket?.status === "open" ? "default" : "secondary"} className="text-xs">
            {activeTicket?.status}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 p-3">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center mt-4">
            Send a message to start the conversation. Our team will respond shortly.
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.is_admin ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    msg.is_admin
                      ? "bg-muted rounded-bl-md"
                      : "bg-primary text-primary-foreground rounded-br-md"
                  }`}
                >
                  {msg.is_admin && (
                    <p className="text-xs font-medium text-primary mb-1">Support Team</p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.is_admin ? "text-muted-foreground" : "text-primary-foreground/70"}`}>
                    {format(new Date(msg.created_at), "h:mm a")}
                  </p>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        )}
      </ScrollArea>

      {activeTicket?.status === "open" && (
        <form onSubmit={handleSendMessage} className="border-t p-3">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1 h-9 text-sm"
            />
            <Button type="submit" size="sm" disabled={!newMessage.trim() || sending}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all flex items-center justify-center hover:scale-105"
          aria-label="Open support chat"
        >
          <MessageCircleQuestion className="h-6 w-6" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] h-[500px] bg-card border rounded-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-sm">💬 Live Support</span>
            <Button size="icon" variant="ghost" className="h-7 w-7 text-primary-foreground hover:text-primary-foreground/80 hover:bg-primary-foreground/10" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            {activeTicket ? renderChat() : renderTicketList()}
          </div>
        </div>
      )}
    </>
  );
};
