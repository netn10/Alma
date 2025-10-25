'use client';

import { ConversationMode } from '@/types/alma';
import { MessageCircle, Brain, VolumeX } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: ConversationMode;
  onModeChange: (mode: ConversationMode) => void;
  language?: string;
}

export function ModeSelector({ currentMode, onModeChange, language = 'en' }: ModeSelectorProps) {
  // Translation helper
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'askLabel': { en: 'Ask', he: 'שאל' },
      'reflectLabel': { en: 'Reflect', he: 'הרהר' },
      'quietLabel': { en: 'Quiet', he: 'שקטה' },
      'askDesc': { en: 'Bring a question or dilemma', he: 'הבא שאלה או דילמה' },
      'reflectDesc': { en: 'Explore feelings or context', he: 'חקור רגשות או הקשר' },
      'quietDesc': { en: 'Alma listens silently and only responds when something important needs attention', he: 'אלמה מקשיבה בשקט ומגיבה רק כשמשהו חשוב דורש תשומת לב' }
    };
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };

  const modes: { mode: ConversationMode; labelKey: string; descKey: string; icon: React.ReactNode }[] = [
    {
      mode: 'ask',
      labelKey: 'askLabel',
      descKey: 'askDesc',
      icon: <MessageCircle className="w-4 h-4" />
    },
    {
      mode: 'reflect',
      labelKey: 'reflectLabel',
      descKey: 'reflectDesc',
      icon: <Brain className="w-4 h-4" />
    },
    {
      mode: 'quiet',
      labelKey: 'quietLabel',
      descKey: 'quietDesc',
      icon: <VolumeX className="w-4 h-4" />
    }
  ];

  return (
    <div className="flex items-center space-x-1">
      {modes.map(({ mode, labelKey, descKey, icon }) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md ${
            currentMode === mode
              ? 'bg-primary/10 dark:bg-primary/30 text-primary dark:text-primary border border-primary/20 dark:border-primary/70'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title={t(descKey)}
          dir={language === 'he' ? 'rtl' : 'ltr'}
        >
          {icon}
          <span>{t(labelKey)}</span>
        </button>
      ))}
    </div>
  );
}
