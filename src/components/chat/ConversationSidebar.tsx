'use client';

import { useState, useEffect } from 'react';
import { AlmaSession } from '@/types/alma';
import { ConversationList } from './ConversationList';
import { X, History, MessageCircle } from 'lucide-react';

interface ConversationSidebarProps {
  userId: string;
  currentSessionId?: string;
  onSelectConversation: (sessionId: string) => void;
  onNewConversation: () => void;
  onClose?: () => void;
  onTitleUpdate?: (sessionId: string, newTitle: string) => void;
  language?: string;
}

export function ConversationSidebar({
  userId,
  currentSessionId,
  onSelectConversation,
  onNewConversation,
  onClose,
  onTitleUpdate,
  language = 'en'
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<AlmaSession[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [loading, setLoading] = useState(true);

  // Translation helper
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'conversations': {
        en: 'Conversations',
        he: 'שיחות'
      },
      'current': {
        en: 'Current',
        he: 'נוכחית'
      },
      'history': {
        en: 'History',
        he: 'היסטוריה'
      },
      'loading': {
        en: 'Loading conversations...',
        he: 'טוען שיחות...'
      },
      'closeSidebar': {
        en: 'Close sidebar',
        he: 'סגור סרגל צד'
      }
    };
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  useEffect(() => {
    loadConversations();
  }, [userId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/conversations?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (sessionId: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (response.ok) {
        setConversations(prev => prev.filter(c => c.id !== sessionId));

        // If deleting current conversation, start a new one
        if (sessionId === currentSessionId) {
          onNewConversation();
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleTitleUpdate = (sessionId: string, newTitle: string) => {
    setConversations(prev => 
      prev.map(c => c.id === sessionId ? { ...c, title: newTitle } : c)
    );
    onTitleUpdate?.(sessionId, newTitle);
  };

  const currentConversation = conversations.filter(c => c.id === currentSessionId);
  const historyConversations = conversations.filter(c => c.id !== currentSessionId);

  return (
    <div className="w-80 h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('conversations')}</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-all duration-200 hover:scale-110 active:scale-90"
            aria-label={t('closeSidebar')}
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 ${
            activeTab === 'current'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            {t('current')}
          </div>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95 ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <History className="w-4 h-4" />
            <span>{language === 'he' ? `(${historyConversations.length}) ${t('history')}` : `${t('history')} (${historyConversations.length})`}</span>
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            {t('loading')}
          </div>
        ) : (
          <>
            {activeTab === 'current' ? (
              <ConversationList
                conversations={currentConversation}
                currentSessionId={currentSessionId}
                onSelectConversation={onSelectConversation}
                onDeleteConversation={handleDeleteConversation}
                onNewConversation={onNewConversation}
                onTitleUpdate={handleTitleUpdate}
                language={language}
              />
            ) : (
              <ConversationList
                conversations={historyConversations}
                currentSessionId={currentSessionId}
                onSelectConversation={onSelectConversation}
                onDeleteConversation={handleDeleteConversation}
                onNewConversation={onNewConversation}
                onTitleUpdate={handleTitleUpdate}
                language={language}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
