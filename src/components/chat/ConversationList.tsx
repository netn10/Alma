'use client';

import { AlmaSession } from '@/types/alma';
import { MessageSquare } from 'lucide-react';
import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
  conversations: AlmaSession[];
  currentSessionId?: string;
  onSelectConversation: (sessionId: string) => void;
  onDeleteConversation: (sessionId: string) => void;
  onNewConversation: () => void;
  onTitleUpdate?: (sessionId: string, newTitle: string) => void;
  language?: string;
}

export function ConversationList({
  conversations,
  currentSessionId,
  onSelectConversation,
  onDeleteConversation,
  onNewConversation,
  onTitleUpdate,
  language = 'en'
}: ConversationListProps) {
  // Translation helper
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'newConversation': {
        en: 'New Conversation',
        he: 'שיחה חדשה'
      },
      'noConversations': {
        en: 'No conversations yet. Start a new one!',
        he: 'אין שיחות עדיין. התחל שיחה חדשה!'
      }
    };
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <button
          onClick={onNewConversation}
          className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <MessageSquare className="w-4 h-4" />
          {t('newConversation')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {t('noConversations')}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === currentSessionId}
                onSelectConversation={onSelectConversation}
                onDeleteConversation={onDeleteConversation}
                onTitleUpdate={onTitleUpdate}
                language={language}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
