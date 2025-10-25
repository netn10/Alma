'use client';

import { AlmaMessage } from '@/types/alma';
import { Volume2, VolumeX } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MessageBubbleProps {
  message: AlmaMessage;
  language?: string;
}

export function MessageBubble({ message, language = 'en' }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Ensure timestamp is a Date object
  const timestamp = message.timestamp instanceof Date ? message.timestamp : new Date(message.timestamp);
  const timeString = timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Helper function to detect Hebrew text
  const containsHebrew = (text: string): boolean => {
    return /[\u0590-\u05FF]/.test(text);
  };

  // Determine if we should use RTL
  const isRTL = containsHebrew(message.content) || language === 'he';

  // Translation helper
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'stop': {
        en: 'Stop',
        he: 'עצור'
      },
      'speak': {
        en: 'Speak',
        he: 'דבר'
      },
      'stopSpeaking': {
        en: 'Stop speaking',
        he: 'עצור דיבור'
      },
      'speakMessage': {
        en: 'Speak message',
        he: 'דבר הודעה'
      }
    };
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };
  
  // Load voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      speechSynthesis.getVoices();
    };
    
    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, []);

  const speakMessage = async (language = 'en') => {
    if (isSpeaking || isPlaying) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPlaying(false);
      return;
    }

    setIsSpeaking(true);
    setIsPlaying(true);

    try {
      // Try using the TTS API first for better quality voice
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: message.content, language }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsSpeaking(false);
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };
        
        await audio.play();
        return;
      }
    } catch (error) {
      console.error('TTS API error:', error);
    }

    // Fallback to browser speech synthesis with language-appropriate voice selection
    const utterance = new SpeechSynthesisUtterance(message.content);
    
    // Configure for natural voice
    utterance.rate = 0.85; // Slightly slower for more natural speech
    utterance.pitch = 1.0; // Natural pitch
    utterance.volume = 0.9;

    // Enhanced voice selection based on language
    const voices = speechSynthesis.getVoices();
    let selectedVoice = null;

    if (language === 'he') {
      // Look for Hebrew voices first
      selectedVoice = voices.find(voice => 
        voice.lang.startsWith('he') || 
        voice.lang.startsWith('iw') // Hebrew language code
      ) || voices.find(voice => 
        voice.name.toLowerCase().includes('hebrew') ||
        voice.name.toLowerCase().includes('israeli')
      );
    } else {
      // Look for English female voices
      selectedVoice = voices.find(voice => 
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('susan') ||
        voice.name.toLowerCase().includes('victoria') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('hazel') ||
        voice.name.toLowerCase().includes('serena') ||
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('natural') ||
        voice.name.toLowerCase().includes('premium') ||
        voice.name.toLowerCase().includes('enhanced')
      ) || voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('woman'))
      );
    }

    // Fallback to any voice in the target language
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.startsWith(language));
    }

    // Final fallback to any available voice
    if (!selectedVoice) {
      selectedVoice = voices.find(voice => voice.lang.startsWith('en')) || voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPlaying(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPlaying(false);
    };

    speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex justify-center px-1`}>
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full max-w-4xl`}>
        <div className={`flex space-x-2 sm:space-x-3 max-w-[90%] sm:max-w-md lg:max-w-xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>

          {/* Message Content */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} min-w-0 flex-1`}>
          <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
          }`}>
            <p 
              className="text-sm sm:text-sm whitespace-pre-wrap break-words"
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {message.content}
            </p>
          </div>
          
          {/* Speech button for assistant messages only */}
          {!isUser && (
            <div className="flex items-center space-x-2 mt-1">
              <button
                onClick={() => speakMessage(language)}
                className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md ${
                  isSpeaking || isPlaying
                    ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                title={isSpeaking || isPlaying ? t('stopSpeaking') : t('speakMessage')}
              >
                {isSpeaking || isPlaying ? (
                  <VolumeX className="w-3 h-3" />
                ) : (
                  <Volume2 className="w-3 h-3" />
                )}
                <span>{isSpeaking || isPlaying ? t('stop') : t('speak')}</span>
              </button>
            </div>
          )}
          
          {/* Timestamp */}
          <div className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {timeString}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
