import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useMessages } from "@/hooks/useMessages";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { conversations, loading } = useMessages();
  
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    searchParams.get("with")
  );
  const [partnerInfo, setPartnerInfo] = useState<{
    name: string;
    avatar: string | null;
  } | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
    }
  }, [user, authLoading, navigate]);

  // Fetch partner info when selected
  useEffect(() => {
    const fetchPartnerInfo = async () => {
      if (!selectedPartnerId) {
        setPartnerInfo(null);
        return;
      }

      // First check if we have it in conversations
      const conv = conversations.find((c) => c.partnerId === selectedPartnerId);
      if (conv) {
        setPartnerInfo({ name: conv.partnerName, avatar: conv.partnerAvatar });
        return;
      }

      // Otherwise fetch from profiles
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", selectedPartnerId)
        .single();

      if (data) {
        setPartnerInfo({
          name: data.full_name || "Unknown User",
          avatar: data.avatar_url,
        });
      }
    };

    fetchPartnerInfo();
  }, [selectedPartnerId, conversations]);

  const handleSelectConversation = (partnerId: string) => {
    setSelectedPartnerId(partnerId);
    setSearchParams({ with: partnerId });
  };

  const handleBack = () => {
    setSelectedPartnerId(null);
    setSearchParams({});
  };

  if (authLoading) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-20 pb-4">
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden h-[calc(100vh-6rem)]">
          <div className="flex h-full">
            {/* Conversations List - Hidden on mobile when chat is open */}
            <div
              className={`w-full md:w-80 border-r flex flex-col ${
                selectedPartnerId ? "hidden md:flex" : "flex"
              }`}
            >
              <div className="p-4 border-b">
                <h2 className="font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                </h2>
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatList
                  conversations={conversations}
                  loading={loading}
                  selectedPartnerId={selectedPartnerId || undefined}
                  onSelectConversation={handleSelectConversation}
                />
              </div>
            </div>

            {/* Chat Window */}
            <div
              className={`flex-1 flex flex-col ${
                selectedPartnerId ? "flex" : "hidden md:flex"
              }`}
            >
              {selectedPartnerId && partnerInfo ? (
                <ChatWindow
                  partnerId={selectedPartnerId}
                  partnerName={partnerInfo.name}
                  partnerAvatar={partnerInfo.avatar}
                  onBack={handleBack}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">Your Messages</h3>
                  <p className="text-muted-foreground mt-1 max-w-sm">
                    Select a conversation to start chatting or send a message
                    from a mentor's profile
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;

