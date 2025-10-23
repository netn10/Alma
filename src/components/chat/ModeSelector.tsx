'use client';

import { ConversationMode } from '@/types/alma';
import { Brain, Eye, Moon } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: ConversationMode;
  onModeChange: (mode: ConversationMode) => void;
}

export function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  const modes: { mode: ConversationMode; label: string; icon: React.ReactNode; description: string }[] = [
    {
      mode: 'ask',
      label: 'Ask',
      icon: <Brain className="w-4 h-4" />,
      description: 'Bring a question or dilemma'
    },
    {
      mode: 'reflect',
      label: 'Reflect',
      icon: <Eye className="w-4 h-4" />,
      description: 'Explore feelings or context'
    },
    {
      mode: 'quiet',
      label: 'Quiet',
      icon: <Moon className="w-4 h-4" />,
      description: 'Reading or thinking'
    }
  ];

  return (
    <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
      {modes.map(({ mode, label, icon, description }) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
            currentMode === mode
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
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
