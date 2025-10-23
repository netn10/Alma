'use client';

import { AlmaMessage } from '@/types/alma';
import { Brain, User } from 'lucide-react';
import { VoicePlayer } from './VoicePlayer';

interface MessageBubbleProps {
  message: AlmaMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  // Ensure timestamp is a Date object
  const timestamp = message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp);
  const timeString = timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser 
            ? 'bg-blue-600' 
            : 'bg-gray-100 dark:bg-gray-700'
        }`}>
          {isUser ? (
            <User className="w-4 h-4 text-white" />
          ) : (
            <Brain className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-3 rounded-2xl ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
          }`}>
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </div>
          
          {/* Voice Player for AI responses */}
          {!isUser && (
            <div className="mt-2">
              <VoicePlayer text={message.content} />
            </div>
          )}
          
          {/* Timestamp */}
          <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {timeString}
          </div>
        </div>
      </div>
    </div>
  );
}
