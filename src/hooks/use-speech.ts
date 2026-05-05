"use client"

import { useState, useCallback, useEffect, useRef } from 'react';

export type LanguageCode = 'en' | 'ar' | 'fr' | 'es' | 'de';

const langMap: Record<LanguageCode, string> = {
  en: 'en-US',
  ar: 'ar-SA',
  fr: 'fr-FR',
  es: 'es-ES',
  de: 'de-DE',
};

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const initRecognition = useCallback(() => {
    if (typeof window !== 'undefined' && !recognitionRef.current) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setError('المتصفح لا يدعم التعرف على الصوت');
        return null;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const currentTranscript = event.results[0][0].transcript;
        setTranscript(currentTranscript);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setError('يرجى السماح بالوصول للميكروفون');
        } else {
          setError('حدث خطأ في التعرف على الصوت');
        }
      };

      recognitionRef.current = recognition;
      return recognition;
    }
    return recognitionRef.current;
  }, []);

  const startListening = useCallback((lang: LanguageCode = 'en') => {
    const recognition = initRecognition();
    if (recognition) {
      recognition.lang = langMap[lang];
      try {
        recognition.start();
      } catch (e) {
        console.error("Recognition already started or error", e);
      }
    }
  }, [initRecognition]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const speak = useCallback((text: string, lang: LanguageCode = 'en') => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speaking
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langMap[lang];
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    speak,
    setTranscript
  };
}
