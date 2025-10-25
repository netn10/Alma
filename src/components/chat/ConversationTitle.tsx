'use client';

import { useState, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface ConversationTitleProps {
  sessionId: string;
  title?: string | null;
  onTitleUpdate?: (newTitle: string) => void;
  language?: string;
}

export function ConversationTitle({ 
  sessionId, 
  title, 
  onTitleUpdate,
  language = 'en'
}: ConversationTitleProps) {
  // Translation helper
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
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
      }
    };
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title || '');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setEditTitle(title || '');
  }, [title]);

  const handleSave = async () => {
    if (!sessionId || editTitle.trim() === (title || '')) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const response = await fetch('/api/conversations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          title: editTitle.trim()
        })
      });

      if (response.ok) {
        onTitleUpdate?.(editTitle.trim());
        setIsEditing(false);
      } else {
        console.error('Failed to update title');
        // Reset to original title on error
        setEditTitle(title || '');
      }
    } catch (error) {
      console.error('Error updating title:', error);
      setEditTitle(title || '');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(title || '');
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

  const displayTitle = title || 'New Conversation';
  const isRTL = language === 'he';

  if (!sessionId) {
    return (
      <div className="text-lg font-medium text-gray-900 dark:text-white">
        {displayTitle}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="px-3 py-1 text-lg font-medium bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:outline-none text-gray-900 dark:text-white text-center min-w-0"
            dir={isRTL ? 'rtl' : 'ltr'}
            autoFocus
            disabled={isUpdating}
          />
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="p-1 hover:bg-green-100 dark:hover:bg-green-900/20 rounded transition-all duration-200 hover:scale-110 active:scale-90 disabled:opacity-50"
            aria-label={t('saveTitle')}
          >
            <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
          </button>
          <button
            onClick={handleCancel}
            disabled={isUpdating}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-all duration-200 hover:scale-110 active:scale-90 disabled:opacity-50"
            aria-label={t('cancelEditing')}
          >
            <X className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-medium text-gray-900 dark:text-white text-center">
            {displayTitle}
          </h1>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-all duration-200 hover:scale-110 active:scale-90 opacity-70 hover:opacity-100"
            aria-label={t('editTitle')}
          >
            <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
}
