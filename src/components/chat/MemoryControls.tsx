'use client';

import { SessionMemory } from '@/types/alma';
import { Brain, BrainCircuit, Shield, Trash2 } from 'lucide-react';

interface MemoryControlsProps {
  memoryStatus: SessionMemory | null;
  onMemoryAction: (action: string) => void;
  language?: string;
}

export function MemoryControls({ memoryStatus, onMemoryAction, language = 'en' }: MemoryControlsProps) {
  if (!memoryStatus) return null;

  return (
    <div className={`flex items-center ${language === 'he' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
      {/* Memory Status Indicator */}
      <div className={`flex items-center ${language === 'he' ? 'space-x-reverse space-x-2' : 'space-x-2'} text-sm`}>
        <div className={`w-2 h-2 rounded-full ${
          memoryStatus.isActive ? 'bg-green-500' : 'bg-gray-400 dark:bg-gray-500'
        }`} />
        <span className="text-gray-600 dark:text-gray-300">
          {memoryStatus.isActive ? 'Memory Active' : 'Memory Off'}
        </span>
      </div>

      {/* Memory Controls */}
      <div className={`flex items-center ${language === 'he' ? 'space-x-reverse space-x-1' : 'space-x-1'}`}>
        {/* Toggle Memory */}
        <button
          onClick={() => onMemoryAction('toggle')}
          className={`p-2 rounded-md transition-all duration-200 cursor-pointer hover:scale-110 active:scale-90 hover:shadow-md ${
            memoryStatus.isActive
              ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title={memoryStatus.isActive ? 'Turn off memory' : 'Turn on memory'}
        >
          <Brain className="w-4 h-4" />
        </button>

        {/* Toggle Private Mode */}
        <button
          onClick={() => onMemoryAction('togglePrivate')}
          className={`p-2 rounded-md transition-all duration-200 cursor-pointer hover:scale-110 active:scale-90 hover:shadow-md ${
            memoryStatus.isPrivate
              ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
          title={memoryStatus.isPrivate ? 'Exit private mode' : 'Enter private mode'}
        >
          <Shield className="w-4 h-4" />
        </button>

        {/* Clear Memory */}
        {memoryStatus.isActive && !memoryStatus.isPrivate && (
          <button
            onClick={() => onMemoryAction('clear')}
            className="p-2 rounded-md transition-all duration-200 cursor-pointer bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-110 active:scale-90 hover:shadow-md"
            title="Clear memory"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Memory Context Info */}
      {memoryStatus.isActive && !memoryStatus.isPrivate && (
        <div className="text-xs text-gray-500">
          {memoryStatus.context.length} items in memory
        </div>
      )}
    </div>
  );
}
