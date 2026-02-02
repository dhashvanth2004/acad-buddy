import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { Conversation } from "@/hooks/useMessages";

interface ChatListProps {
  conversations: Conversation[];
  loading: boolean;
  selectedPartnerId?: string;
  onSelectConversation: (partnerId: string) => void;
}

export const ChatList = ({
  conversations,
  loading,
  selectedPartnerId,
  onSelectConversation,
}: ChatListProps) => {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <p className="text-muted-foreground">No conversations yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Start a conversation from a mentor's profile
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.partnerId}
            onClick={() => onSelectConversation(conversation.partnerId)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
              selectedPartnerId === conversation.partnerId
                ? "bg-primary/10"
                : "hover:bg-muted/50"
            }`}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={conversation.partnerAvatar || undefined} />
              <AvatarFallback>
                {conversation.partnerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">
                  {conversation.partnerName}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(conversation.lastMessageTime), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground truncate">
                  {conversation.lastMessage}
                </p>
                {conversation.unreadCount > 0 && (
                  <Badge variant="default" className="h-5 min-w-5 px-1.5">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
};
