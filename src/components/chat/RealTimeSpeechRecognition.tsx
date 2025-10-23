'use client';

import { useState, useEffect, useRef } from 'react';

interface UseSpeechRecognitionProps {
  onTranscriptionUpdate: (text: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function useSpeechRecognition({
  onTranscriptionUpdate,
  onError,
  disabled = false
}: UseSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const interimTranscriptRef = useRef('');
  const finalTranscriptRef = useRef('');
  const shouldBeListeningRef = useRef(false); // Track intended listening state
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Store callbacks in refs to avoid recreating the recognition object
  const onTranscriptionUpdateRef = useRef(onTranscriptionUpdate);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onTranscriptionUpdateRef.current = onTranscriptionUpdate;
    onErrorRef.current = onError;
  }, [onTranscriptionUpdate, onError]);

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setIsSupported(false);
        onErrorRef.current?.('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log('Speech recognition started, shouldBeListening:', shouldBeListeningRef.current);
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = finalTranscriptRef.current;

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        finalTranscriptRef.current = finalTranscript;
        interimTranscriptRef.current = interimTranscript;

        // Update the input field in real-time with both final and interim results
        const fullTranscript = (finalTranscript + interimTranscript).trim();
        onTranscriptionUpdateRef.current(fullTranscript);
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // No speech detected - keep listening if user wants to
          console.log('No speech detected, will auto-restart if still listening');
          // Don't show error, just let it restart
        } else if (event.error === 'aborted') {
          // Aborted - user stopped intentionally or browser stopped
          console.log('Recognition aborted');
          shouldBeListeningRef.current = false;
          setIsListening(false);
        } else if (event.error === 'not-allowed') {
          console.error('Speech recognition error:', event.error);
          onErrorRef.current?.('Microphone permission denied. Please allow microphone access.');
          shouldBeListeningRef.current = false;
          setIsListening(false);
        } else if (event.error === 'network') {
          console.error('Speech recognition error:', event.error);
          onErrorRef.current?.('Network error. Please check your internet connection.');
          shouldBeListeningRef.current = false;
          setIsListening(false);
        } else if (event.error === 'audio-capture') {
          console.error('Speech recognition error:', event.error);
          onErrorRef.current?.('Microphone not found. Please check your microphone connection.');
          shouldBeListeningRef.current = false;
          setIsListening(false);
        } else {
          console.error('Speech recognition error:', event.error);
          onErrorRef.current?.(`Speech recognition error: ${event.error}`);
          shouldBeListeningRef.current = false;
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        console.log('Speech recognition ended, shouldBeListening:', shouldBeListeningRef.current);

        // If we should still be listening, restart recognition
        if (shouldBeListeningRef.current) {
          console.log('Auto-restarting recognition...');
          // Small delay before restarting to avoid rapid restarts
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldBeListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (error) {
                console.error('Error restarting recognition:', error);
                shouldBeListeningRef.current = false;
                setIsListening(false);
              }
            }
          }, 100);
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      console.log('Cleaning up speech recognition');
      shouldBeListeningRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, []); // Empty dependency array - only run once on mount

  const startListening = async () => {
    if (!recognitionRef.current || disabled || !isSupported) {
      console.log('Cannot start:', { hasRecognition: !!recognitionRef.current, disabled, isSupported });
      return;
    }

    // If already listening, don't start again
    if (shouldBeListeningRef.current) {
      console.log('Already listening, ignoring start request');
      return;
    }

    try {
      // Request microphone permission first
      console.log('Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Microphone permission granted');

      // Stop the stream immediately - we just needed the permission
      stream.getTracks().forEach(track => track.stop());

      // Set flag to indicate we want to be listening - MUST BE FIRST
      shouldBeListeningRef.current = true;
      console.log('Set shouldBeListening to true');

      // Reset transcripts
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';

      // Clear the input first
      onTranscriptionUpdate('');

      console.log('Starting speech recognition...');
      recognitionRef.current.start();
      // Don't set isListening here - let onstart handle it
    } catch (error: any) {
      console.error('Error starting recognition:', error);

      // Check if it's a permission error
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        onError?.('Microphone permission denied. Please allow microphone access in your browser settings.');
        shouldBeListeningRef.current = false;
        setIsListening(false);
        return;
      }

      // If already started, this is not really an error
      if (error.message && error.message.includes('already started')) {
        setIsListening(true);
        shouldBeListeningRef.current = true;
      } else {
        shouldBeListeningRef.current = false;
        setIsListening(false);
        onError?.('Failed to start speech recognition. Please try again.');
      }
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current || !shouldBeListeningRef.current) {
      console.log('No active recognition to stop');
      return;
    }

    try {
      // Clear the flag first so onend doesn't restart
      shouldBeListeningRef.current = false;

      // Clear any pending restart timeouts
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      console.log('Stopping speech recognition...');
      recognitionRef.current.stop();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping recognition:', error);
      shouldBeListeningRef.current = false;
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    console.log('Toggle listening. Current state:', isListening);
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return { isListening, toggleListening, isSupported };
}
