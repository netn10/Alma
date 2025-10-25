'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Play, Pause } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  language?: string;
}

export function VoiceRecorder({ onTranscription, onError, disabled = false, language = 'en' }: VoiceRecorderProps) {
  // Translation helper
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'stopRecording': {
        en: 'Stop recording',
        he: 'עצור הקלטה'
      }
    };
    return translations[key]?.[language] || translations[key]?.['en'] || key;
  };
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcription, setTranscription] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check for browser support
  const isSupported = typeof window !== 'undefined' && 
    (navigator.mediaDevices?.getUserMedia || (navigator as any).getUserMedia);

  const startRecording = async () => {
    if (!isSupported) {
      onError('Voice recording is not supported in this browser');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      onError('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('language', language);

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      const transcribedText = data.transcription;
      setTranscription(transcribedText);
      onTranscription(transcribedText);
    } catch (error) {
      console.error('Transcription error:', error);
      onError('Failed to transcribe audio. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const playRecording = () => {
    if (audioBlob && audioRef.current) {
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseRecording = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = () => setIsPlaying(false);
    }
  }, []);

  if (!isSupported) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Voice recording not supported in this browser
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      {/* Recording Controls */}
      <div className="flex items-center space-x-2">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="p-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-lg"
            title="Start recording"
          >
            <Mic className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-lg animate-pulse"
            title={t('stopRecording')}
          >
            <Square className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Playback Controls */}
      {audioBlob && (
        <div className="flex items-center space-x-2">
          {!isPlaying ? (
            <button
              onClick={playRecording}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-lg"
              title="Play recording"
            >
              <Play className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={pauseRecording}
              className="p-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-lg"
              title="Pause recording"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={transcribeAudio}
            disabled={isTranscribing}
            className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg"
          >
            {isTranscribing ? 'Transcribing...' : 'Transcribe'}
          </button>
        </div>
      )}

      {/* Transcription Result */}
      {transcription && (
        <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs">
          "{transcription}"
        </div>
      )}

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} />
    </div>
  );
}
