'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Brain, Clock, MessageCircle, VolumeX, Mic, X, Check, Pause } from 'lucide-react';
import { AlmaMessage, ConversationMode, SessionMemory } from '@/types/alma';
import { MessageBubble } from './MessageBubble';
import { ModeSelector } from './ModeSelector';
import { ConversationSidebar } from './ConversationSidebar';
import { LanguageSelector } from './LanguageSelector';
import { useSpeechRecognition } from './RealTimeSpeechRecognition';

interface ChatInterfaceProps {
  userId: string;
  initialSessionId?: string;
}

export function ChatInterface({ userId, initialSessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<AlmaMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(initialSessionId || '');
  const [mode, setMode] = useState<ConversationMode>('ask');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [voiceError, setVoiceError] = useState<string>('');
  const [isRecordingConfirmation, setIsRecordingConfirmation] = useState(false);
  const [userInitiatedRecording, setUserInitiatedRecording] = useState(false);
  const [voiceLanguage, setVoiceLanguage] = useState<string>('en');

  // Translation helper
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'placeholder': {
        en: 'What would you like to explore?',
        he: 'מה תרצה לחקור?'
      },
      'listening': {
        en: 'Listening... speak now',
        he: 'מקשיב... דבר עכשיו'
      },
      'welcome': {
        en: 'Welcome to Alma',
        he: 'ברוכים הבאים לאלמה'
      },
      'welcomeMessage': {
        en: "I'm here to help you think, decide, and communicate better.",
        he: 'אני כאן כדי לעזור לך לחשוב, להחליט ולתקשר טוב יותר.'
      },
      'thinking': {
        en: 'Alma is thinking...',
        he: 'אלמה חושבת...'
      },
      'suggestions': {
        en: 'Suggestions:',
        he: 'הצעות:'
      },
      'accept': {
        en: 'Accept',
        he: 'אישור'
      },
      'cancel': {
        en: 'Cancel',
        he: 'ביטול'
      },
      'ask': {
        en: 'Bring a question or dilemma',
        he: 'הבא שאלה או דילמה'
      },
      'reflect': {
        en: 'Explore feelings or context',
        he: 'חקור רגשות או הקשר'
      },
      'quiet': {
        en: 'Alma remains silent unless prompted',
        he: 'אלמה נשארת שקטה אלא אם כן מבקשים'
      },
      'stopRecording': {
        en: 'Stop recording',
        he: 'עצור הקלטה'
      },
      'startVoice': {
        en: 'Start voice input',
        he: 'התחל קלט קול'
      },
      'clickStop': {
        en: 'Click to stop',
        he: 'לחץ לעצור'
      },
      'clickSpeak': {
        en: 'Click to speak',
        he: 'לחץ לדבר'
      },
      'sendMessage': {
        en: 'Send message',
        he: 'שלח הודעה'
      }
    };
    return translations[key]?.[voiceLanguage] || translations[key]?.['en'] || key;
  };

  // Load voice language preference from settings
  useEffect(() => {
    const loadVoiceLanguage = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.preferences?.alma?.voiceLanguage) {
            setVoiceLanguage(data.preferences.alma.voiceLanguage);
          }
        }
      } catch (error) {
        console.error('Error loading voice language preference:', error);
      }
    };
    loadVoiceLanguage();
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation on mount or when sessionId changes from props
  useEffect(() => {
    if (initialSessionId) {
      loadConversation(initialSessionId);
    } else {
      // Try to load last active conversation from localStorage
      const lastSessionId = localStorage.getItem('lastSessionId');
      if (lastSessionId) {
        loadConversation(lastSessionId);
      }
    }
  }, [initialSessionId]);

  // Save current session to localStorage whenever it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('lastSessionId', sessionId);
    }
  }, [sessionId]);

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations?sessionId=${conversationId}`);
      const data = await response.json();

      if (response.ok && data.conversation) {
        const { conversation } = data;
        setSessionId(conversation.id);
        setMessages(conversation.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        setMode(conversation.mode);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    loadConversation(conversationId);
    setShowSidebar(false);
  };

  const handleNewConversation = () => {
    setSessionId('');
    setMessages([]);
    setMode('ask');
    setSuggestions([]);
    localStorage.removeItem('lastSessionId');
    setShowSidebar(false);
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: AlmaMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
      mode
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          sessionId: sessionId || undefined,
          userId,
          mode,
          language: voiceLanguage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Convert timestamp string back to Date object
      const messageWithDate = {
        ...data.message,
        timestamp: new Date(data.message.timestamp)
      };
      
      setMessages(prev => [...prev, messageWithDate]);
      setSessionId(data.sessionId);
      setMode(data.mode);
      console.log('Received suggestions:', data.suggestions);
      setSuggestions(data.suggestions || []);

    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message to chat
      const errorMessage: AlmaMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Something went wrong, want to try again?',
        timestamp: new Date(),
        mode
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleModeChange = (newMode: ConversationMode) => {
    setMode(newMode);
  };

  const handleVoiceTranscription = (transcription: string) => {
    setInput(transcription);
  };

  const handleVoiceError = (error: string) => {
    setVoiceError(error);
  };

  const handleCancelRecording = () => {
    setIsRecordingConfirmation(false);
    setUserInitiatedRecording(false);
    setInput('');
    if (isListening) {
      toggleListening();
    }
  };

  const handleAcceptRecording = () => {
    setIsRecordingConfirmation(false);
    setUserInitiatedRecording(false);
    if (isListening) {
      toggleListening();
    }
    // Send the message if there's content
    if (input.trim()) {
      sendMessage(input);
    }
  };

  const handleMicrophoneToggle = () => {
    if (isRecordingConfirmation) {
      // If in confirmation state, cancel the recording
      handleCancelRecording();
    } else {
      // Normal toggle behavior - mark that user initiated recording
      setUserInitiatedRecording(true);
      toggleListening();
    }
  };

  // Real-time speech recognition
  const { isListening, toggleListening } = useSpeechRecognition({
    onTranscriptionUpdate: handleVoiceTranscription,
    onError: handleVoiceError,
    disabled: isLoading,
    language: voiceLanguage
  });

  // Handle transition to confirmation state when listening stops and there's transcription
  // Only show confirmation if user clicked microphone (not automatic)
  useEffect(() => {
    if (!isListening && input.trim() && !isRecordingConfirmation && !isLoading && userInitiatedRecording) {
      // Only show confirmation if the user was actively recording (clicked microphone)
      const timer = setTimeout(() => {
        setIsRecordingConfirmation(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isListening, input, isRecordingConfirmation, isLoading, userInitiatedRecording]);



  const getModeIcon = (currentMode: ConversationMode) => {
    switch (currentMode) {
      case 'ask': return <MessageCircle className="w-4 h-4" />;
      case 'reflect': return <Brain className="w-4 h-4" />;
      case 'quiet': return <VolumeX className="w-4 h-4" />;
    }
  };

  const getModeDescription = (currentMode: ConversationMode) => {
    switch (currentMode) {
      case 'ask': return t('ask');
      case 'reflect': return t('reflect');
      case 'quiet': return t('quiet');
    }
  };

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-800">
      {/* Conversation Sidebar */}
      {showSidebar && (
        <ConversationSidebar
          userId={userId}
          currentSessionId={sessionId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onClose={() => setShowSidebar(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Controls Header - Mobile responsive */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                aria-label="Toggle conversations sidebar"
              >
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <ModeSelector
                currentMode={mode}
                onModeChange={handleModeChange}
                language={voiceLanguage}
              />
            </div>
            <div className="flex items-center space-x-2">
              <LanguageSelector
                selectedLanguage={voiceLanguage}
                onLanguageChange={setVoiceLanguage}
              />
            </div>
          </div>
        </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-6 sm:py-8">
            <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-2">
              {t('welcome')}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-3 sm:mb-4 px-4">
              {t('welcomeMessage')}
            </p>
            <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-400 dark:text-gray-500">
              {getModeIcon(mode)}
              <span>{getModeDescription(mode)}</span>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} language={voiceLanguage} />
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="ml-2">{t('thinking')}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions - only show after bot has responded */}
      {(() => {
        console.log('Suggestions render check:', {
          suggestionsLength: suggestions.length,
          isLoading,
          messagesLength: messages.length,
          lastMessageRole: messages.length > 0 ? messages[messages.length - 1].role : 'none'
        });
        return suggestions.length > 0 && !isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant';
      })() && (
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">{t('suggestions')}</p>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {suggestions.map((suggestion, index) => {
              const isRTL = /[\u0590-\u05FF]/.test(suggestion) || voiceLanguage === 'he';
              return (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-500 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  {suggestion}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
        {/* Voice Error Display */}
        {voiceError && (
          <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{voiceError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex space-x-2 sm:space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? t('listening') : t('placeholder')}
            className={`flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 ${
              isListening
                ? 'border-red-500 dark:border-red-600 focus:ring-red-500 bg-red-50 dark:bg-red-900/10'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 bg-white dark:bg-gray-800'
            } text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400`}
            dir={voiceLanguage === 'he' ? 'rtl' : 'ltr'}
            disabled={isLoading}
          />

          {/* Microphone Button */}
          {isRecordingConfirmation ? (
            <div className="flex space-x-2">
              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleCancelRecording}
                disabled={isLoading}
                className="px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 shadow-lg shadow-red-500/50 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('cancel')}
                title={t('cancel')}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              {/* Accept Button */}
              <button
                type="button"
                onClick={handleAcceptRecording}
                disabled={isLoading}
                className="px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-800 shadow-lg shadow-green-500/50 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('accept')}
                title={t('accept')}
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleMicrophoneToggle}
              disabled={isLoading}
              className={`px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center transition-all duration-200 active:scale-95 ${
                isListening
                  ? 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-800 shadow-lg shadow-red-500/50'
                  : 'bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 hover:shadow-lg'
              } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
              aria-label={isListening ? t('stopRecording') : t('startVoice')}
              title={isListening ? t('clickStop') : t('clickSpeak')}
            >
              {isListening ? (
                <Pause className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              ) : (
                <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
            </button>
          )}

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-3 sm:px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 hover:shadow-lg active:scale-95"
            aria-label={t('sendMessage')}
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
