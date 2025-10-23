'use client';

import { AlmaSession } from '@/types/alma';
import { MessageSquare, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  conversations: AlmaSession[];
  currentSessionId?: string;
  onSelectConversation: (sessionId: string) => void;
  onDeleteConversation: (sessionId: string) => void;
  onNewConversation: () => void;
}

export function ConversationList({
  conversations,
  currentSessionId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation
}: ConversationListProps) {
  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    if (confirm('Delete this conversation? This cannot be undone.')) {
      onDeleteConversation(sessionId);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <button
          onClick={onNewConversation}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          New Conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No conversations yet. Start a new one!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conversation) => {
              const isActive = conversation.id === currentSessionId;
              const messageCount = conversation.messages.length;
              const lastMessage = conversation.messages[messageCount - 1];

              return (
                <div
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:bg-accent/50 hover:translate-x-1 active:scale-98 ${
                    isActive ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate mb-1">
                        {conversation.title || 'New Conversation'}
                      </h3>
                      {lastMessage && (
                        <p className="text-xs text-muted-foreground truncate">
                          {lastMessage.content}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{messageCount} messages</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(conversation.updatedAt), {
                            addSuffix: true
                          })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, conversation.id)}
                      className="p-1 hover:bg-destructive/20 rounded transition-all duration-200 hover:scale-110 active:scale-90"
                      aria-label="Delete conversation"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
