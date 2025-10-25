'use client';

import { useState } from 'react';
import { AlmaSession } from '@/types/alma';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface ConversationItemProps {
  conversation: AlmaSession;
  isActive: boolean;
  onSelectConversation: (sessionId: string) => void;
  onDeleteConversation: (sessionId: string) => void;
  onTitleUpdate?: (sessionId: string, newTitle: string) => void;
  language?: string;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelectConversation,
  onDeleteConversation,
  onTitleUpdate,
  language = 'en'
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(conversation.title || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Helper function to detect Hebrew text
  const containsHebrew = (text: string): boolean => {
    return /[\u0590-\u05FF]/.test(text);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(t('deleteConfirm'))) {
      onDeleteConversation(conversation.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editTitle.trim() === (conversation.title || '')) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/conversations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: conversation.id,
          title: editTitle.trim()
        })
      });

      if (response.ok) {
        onTitleUpdate?.(conversation.id, editTitle.trim());
        setIsEditing(false);
      } else {
        console.error('Failed to update title');
        setEditTitle(conversation.title || '');
      }
    } catch (error) {
      console.error('Error updating title:', error);
      setEditTitle(conversation.title || '');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(conversation.title || '');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  // Translation helper
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'messages': {
        en: 'messages',
        he: 'הודעות'
      },
      'newConversation': {
        en: 'New Conversation',
        he: 'שיחה חדשה'
      },
      'deleteConfirm': {
        en: 'Delete this conversation? This cannot be undone.',
        he: 'למחוק את השיחה הזו? לא ניתן לבטל פעולה זו.'
      },
      'saveTitle': {
        en: 'Save title',
        he: 'שמור כותרת'
      },
      'cancelEditing': {
        en: 'Cancel editing',
        he: 'בטל עריכה'
      },
      'editTitle': {
        en: 'Edit title',
        he: 'ערוך כותרת'
      },
      'deleteConversation': {
        en: 'Delete conversation',
        he: 'מחק שיחה'
      }
    };
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  const messageCount = conversation.messages.length;
  const lastMessage = conversation.messages[messageCount - 1];
  const displayTitle = conversation.title || t('newConversation');

  return (
    <div
      onClick={() => !isEditing && onSelectConversation(conversation.id)}
      className={`p-4 cursor-pointer transition-all duration-200 hover:bg-accent/50 hover:translate-x-1 active:scale-98 ${
        isActive ? 'bg-accent' : ''
      } ${isEditing ? 'cursor-default' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="mb-1">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-2 py-1 text-sm font-medium bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white"
                dir={containsHebrew(editTitle) ? 'rtl' : 'ltr'}
                autoFocus
                disabled={isUpdating}
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex items-center gap-1 mt-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                  }}
                  disabled={isUpdating}
                  className="p-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-all duration-200 hover:scale-110 active:scale-90 disabled:opacity-50"
                  aria-label={t('saveTitle')}
                >
                  <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancel();
                  }}
                  disabled={isUpdating}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all duration-200 hover:scale-110 active:scale-90 disabled:opacity-50"
                  aria-label={t('cancelEditing')}
                >
                  <X className="w-3 h-3 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>
          ) : (
            <div className="group">
              <h3 
                className="font-medium text-sm truncate mb-1 group-hover:pr-6"
                dir={containsHebrew(displayTitle) ? 'rtl' : 'ltr'}
              >
                {displayTitle}
              </h3>
              <button
                onClick={handleEdit}
                className="absolute top-4 right-12 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all duration-200 hover:scale-110 active:scale-90 opacity-0 group-hover:opacity-100"
                aria-label={t('editTitle')}
              >
                <Edit2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          )}
          
          {!isEditing && lastMessage && (
            <p 
              className="text-xs text-muted-foreground truncate"
              dir={containsHebrew(lastMessage.content) ? 'rtl' : 'ltr'}
            >
              {lastMessage.content}
            </p>
          )}
          
          {!isEditing && (
            <div className={`flex items-center gap-2 mt-2 text-xs text-muted-foreground ${language === 'he' ? 'flex-row-reverse' : ''}`}>
              <span>
                {language === 'he' ? `${t('messages')} ${messageCount}` : `${messageCount} ${t('messages')}`}
              </span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(conversation.updatedAt), {
                  addSuffix: true,
                  locale: language === 'he' ? he : undefined
                })}
              </span>
            </div>
          )}
        </div>
        
        {!isEditing && (
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-destructive/20 rounded transition-all duration-200 hover:scale-110 active:scale-90"
            aria-label={t('deleteConversation')}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        )}
      </div>
    </div>
  );
}
