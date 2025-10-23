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
}

export function ConversationSidebar({
  userId,
  currentSessionId,
  onSelectConversation,
  onNewConversation,
  onClose
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<AlmaSession[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [loading, setLoading] = useState(true);

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

  const currentConversation = conversations.filter(c => c.id === currentSessionId);
  const historyConversations = conversations.filter(c => c.id !== currentSessionId);

  return (
    <div className="w-80 h-full bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold">Conversations</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('current')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'current'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Current
          </div>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <History className="w-4 h-4" />
            History ({historyConversations.length})
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading conversations...
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
              />
            ) : (
              <ConversationList
                conversations={historyConversations}
                currentSessionId={currentSessionId}
                onSelectConversation={onSelectConversation}
                onDeleteConversation={handleDeleteConversation}
                onNewConversation={onNewConversation}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
