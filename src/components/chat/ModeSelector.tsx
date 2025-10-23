'use client';

import { ConversationMode } from '@/types/alma';
import { MessageCircle, Brain, VolumeX } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: ConversationMode;
  onModeChange: (mode: ConversationMode) => void;
}

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  const modes: { mode: ConversationMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      mode: 'ask',
      label: 'Ask',
      icon: <MessageCircle className="w-4 h-4" />,
      description: 'Bring a question or dilemma'
    },
    {
      mode: 'reflect',
      label: 'Reflect',
      icon: <Brain className="w-4 h-4" />,
      description: 'Explore feelings or context'
    },
    {
      mode: 'quiet',
      label: 'Quiet',
      icon: <VolumeX className="w-4 h-4" />,
      description: 'Alma remains silent unless prompted'
    }
  ];

  return (
    <div className="flex items-center space-x-1">
      {modes.map(({ mode, label, icon, description }) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md ${
            currentMode === mode
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-500 border border-blue-200 dark:border-blue-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title={description}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
