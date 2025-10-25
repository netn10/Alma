'use client';

import { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Loader } from 'lucide-react';

interface VoicePlayerProps {
  text: string;
  onError?: (error: string) => void;
  autoPlay?: boolean;
  language?: string;
}

export function VoicePlayer({ text, onError, autoPlay = false, language = 'en' }: VoicePlayerProps) {
  // Translation helper
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'generating': {
        en: 'Generating...',
        he: 'מייצר...'
      },
      'speak': {
        en: 'Speak',
        he: 'דבר'
      },
      'stop': {
        en: 'Stop',
        he: 'עצור'
      }
    };
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check for browser support
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const generateSpeech = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      // Try using the TTS API first for better quality
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        if (audioRef.current) {
          audioRef.current.src = url;
          if (autoPlay) {
            audioRef.current.play();
            setIsPlaying(true);
          }
        }
      } else {
        // Fallback to browser speech synthesis
        useBrowserTTS();
      }
    } catch (error) {
      console.error('TTS API error:', error);
      // Fallback to browser speech synthesis
      useBrowserTTS();
    } finally {
      setIsLoading(false);
    }
  };

  const useBrowserTTS = () => {
    if (!isSupported) {
      onError?.('Text-to-speech is not supported in this browser');
      return;
    }

    // Cancel any existing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesisRef.current = utterance;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      onError?.('Failed to generate speech');
      setIsPlaying(false);
    };

    // Set voice properties for natural female voice
    utterance.rate = 0.85; // Slightly slower for more natural speech
    utterance.pitch = 1.0; // Natural pitch
    utterance.volume = isMuted ? 0 : 0.9;

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

    speechSynthesis.speak(utterance);
  };

  const playPause = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    } else if (isSupported) {
      if (isPlaying) {
        speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        if (speechSynthesis.paused) {
          speechSynthesis.resume();
        } else {
          useBrowserTTS();
        }
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 1 : 0;
    }
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.volume = isMuted ? 1 : 0;
    }
  };

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (isSupported) {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    if (autoPlay && text) {
      generateSpeech();
    }
  }, [text, autoPlay]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onpause = () => setIsPlaying(false);
      audioRef.current.onplay = () => setIsPlaying(true);
    }
  }, [audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (isSupported) {
        speechSynthesis.cancel();
      }
    };
  }, [audioUrl]);

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Text-to-speech not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Play/Pause Button */}
      <button
        onClick={playPause}
        disabled={isLoading || !text.trim()}
        className="p-2 bg-primary hover:brightness-90 disabled:bg-gray-400 text-primary-foreground rounded-full transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-lg"
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isLoading ? (
          <Loader className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
      </button>

      {/* Stop Button */}
      {isPlaying && (
        <button
          onClick={stop}
          className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-lg"
          title={t('stop')}
        >
          <VolumeX className="w-4 h-4" />
        </button>
      )}

      {/* Mute/Unmute Button */}
      <button
        onClick={toggleMute}
        className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-lg"
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
      </button>

      {/* Generate Speech Button (if not auto-play) */}
      {!autoPlay && (
        <button
          onClick={generateSpeech}
          disabled={isLoading || !text.trim()}
          className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
        >
          {isLoading ? t('generating') : t('speak')}
        </button>
      )}

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} />
    </div>
  );
}
