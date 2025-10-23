'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Brain, Eye, Moon, Mic, MicOff, Menu } from 'lucide-react';
import { AlmaMessage, ConversationMode, SessionMemory } from '@/types/alma';
import { MessageBubble } from './MessageBubble';
import { ModeSelector } from './ModeSelector';
import { MemoryControls } from './MemoryControls';
import { VoiceRecorder } from './VoiceRecorder';
import { VoicePlayer } from './VoicePlayer';
import { ConversationSidebar } from './ConversationSidebar';

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
  const [memoryStatus, setMemoryStatus] = useState<SessionMemory | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [voiceError, setVoiceError] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

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
        const conversation = data.conversation;
        setSessionId(conversation.id);
        setMessages(conversation.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
        setMode(conversation.mode);
        setMemoryStatus(conversation.memory);
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
    setMemoryStatus(null);
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
          mode
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
      setMemoryStatus(data.memoryStatus);
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

  const handleMemoryAction = async (action: string) => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, action })
      });

      const data = await response.json();
      if (response.ok) {
        setMemoryStatus(data.memoryStatus);
      }
    } catch (error) {
      console.error('Error updating memory:', error);
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setInput(text);
    setVoiceError('');
  };

  const handleVoiceError = (error: string) => {
    setVoiceError(error);
  };

  const startVoiceRecording = async () => {
    // Check for Web Speech API support (for real-time transcription)
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      // Use Web Speech API for real-time transcription
      startWebSpeechRecognition();
    } else if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      // Fallback to MediaRecorder + Whisper API
      startMediaRecorderRecording();
    } else {
      setVoiceError('Voice recording is not supported in this browser');
    }
  };

  const startWebSpeechRecognition = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let finalTranscript = '';

      recognition.onstart = () => {
        setIsRecording(true);
        setVoiceError('');
        finalTranscript = '';
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interimText = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimText += transcript;
          }
        }

        // Update input field in real-time
        setInput(finalTranscript + interimText);
        setInterimTranscript(interimText);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'no-speech') {
          setVoiceError('No speech detected. Please try again.');
        } else if (event.error === 'not-allowed') {
          setVoiceError('Microphone access denied. Please enable microphone permissions.');
        } else {
          setVoiceError('Speech recognition error. Please try again.');
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setVoiceError('Failed to start voice recognition. Please try again.');
      // Fallback to MediaRecorder
      startMediaRecorderRecording();
    }
  };

  const startMediaRecorderRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setVoiceError('Voice recording is not supported in this browser');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Set up audio context for voice activity detection
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start voice activity detection
      startVoiceActivityDetection();
    } catch (error) {
      console.error('Error starting recording:', error);
      setVoiceError('Failed to start recording. Please check microphone permissions.');
    }
  };

  const startVoiceActivityDetection = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    let isSpeaking = false;
    let silenceStartTime = 0;
    const SILENCE_THRESHOLD = 1000; // 1 second of silence
    const VOLUME_THRESHOLD = 30; // Adjust this value based on testing

    const checkVoiceActivity = () => {
      if (!analyserRef.current || !isRecording) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

      if (average > VOLUME_THRESHOLD) {
        // User is speaking
        isSpeaking = true;
        silenceStartTime = 0;
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
      } else if (isSpeaking) {
        // User stopped speaking, start silence timer
        if (silenceStartTime === 0) {
          silenceStartTime = Date.now();
        }
        
        if (Date.now() - silenceStartTime > SILENCE_THRESHOLD) {
          // User has been silent for the threshold time, stop recording
          stopVoiceRecording();
          return;
        }
      }

      requestAnimationFrame(checkVoiceActivity);
    };

    checkVoiceActivity();
  };

  const stopVoiceRecording = () => {
    // Stop Web Speech API if it's active
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      }
      recognitionRef.current = null;
    }

    // Stop MediaRecorder if it's active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    setInterimTranscript('');
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    setInput('Transcribing...');
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      const transcribedText = data.transcription;
      setInput(transcribedText);
      setVoiceError('');
    } catch (error) {
      console.error('Transcription error:', error);
      setVoiceError('Failed to transcribe audio. Please try again.');
      setInput('');
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleVoiceMode = () => {
    if (!isVoiceMode) {
      // Starting voice mode - begin recording
      setIsVoiceMode(true);
      setVoiceError('');
      startVoiceRecording();
    } else {
      // Stopping voice mode - stop recording and transcribe
      setIsVoiceMode(false);
      stopVoiceRecording();
    }
  };

  const getModeIcon = (currentMode: ConversationMode) => {
    switch (currentMode) {
      case 'ask': return <Brain className="w-4 h-4" />;
      case 'reflect': return <Eye className="w-4 h-4" />;
      case 'quiet': return <Moon className="w-4 h-4" />;
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
        {/* Controls Header */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Toggle conversations sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              <ModeSelector
                currentMode={mode}
                onModeChange={handleModeChange}
              />
              {sessionId && (
                <MemoryControls
                  memoryStatus={memoryStatus}
                  onMemoryAction={handleMemoryAction}
                />
              )}
            </div>
          </div>
        </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Welcome to Alma
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              I'm here to help you think, decide, and communicate better.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 dark:text-gray-500">
              {getModeIcon(mode)}
              <span>Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <span className="ml-2">Alma is thinking...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && !isLoading && (
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Suggestions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice Error Display */}
      {voiceError && (
        <div className="bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 p-4">
          <p className="text-sm text-red-600 dark:text-red-400">{voiceError}</p>
        </div>
      )}

      {/* Input */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
        {/* Recording Status Banner */}
        {isRecording && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                <div className="w-1 h-8 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></div>
                <div className="w-1 h-10 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                <div className="w-1 h-7 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                <div className="w-1 h-9 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
              </div>
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">🎙️ Listening...</p>
                <p className="text-xs text-red-500 dark:text-red-500">
                  {input ? 'Your words are appearing below ↓' : 'Speak now - words will appear in real-time'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-red-600 dark:text-red-400">LIVE</span>
            </div>
          </div>
        )}

        {/* Transcribing Status Banner */}
        {isTranscribing && (
          <div className="mb-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg flex items-center space-x-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">✨ Converting speech to text...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? "Listening... speak now" : isTranscribing ? "Transcribing..." : "What would you like to explore?"}
            className={`flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${
              isRecording ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-600' :
              isTranscribing ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-600' : ''
            }`}
            disabled={isLoading || isTranscribing}
          />

          {/* Voice Mode Toggle */}
          <button
            type="button"
            onClick={toggleVoiceMode}
            className={`relative px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/50 animate-pulse'
                : isVoiceMode && !isRecording
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
            }`}
            title={isVoiceMode ? (isRecording ? 'Stop recording and transcribe' : 'Voice mode active') : 'Click to start voice recording'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>
              {isRecording ? 'Stop' : isVoiceMode ? 'Recording...' : 'Voice'}
            </span>
            {isRecording && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </button>

          <button
            type="submit"
            disabled={!input.trim() || isLoading || isTranscribing}
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{isTranscribing ? 'Transcribing...' : 'Send'}</span>
          </button>
        </form>
      </div>
      </div>
    </div>
  );
}
