/**
 * Text-to-Speech (TTS) Service for ReadLingo
 * Plays Azerbaijani (or English) audio pronunciation.
 */

export const speakAzerbaijani = (text: string, rate: number = 0.85): Promise<void> => {
  return new Promise((resolve) => {
    if (!text || !text.trim()) {
      resolve();
      return;
    }

    const cleanText = text.trim();

    // Primary: Google Translate TTS API for native Azerbaijani (az-AZ) speech
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=az&client=tw-ob`;
    const audio = new Audio(googleTtsUrl);
    audio.playbackRate = rate;

    audio.onended = () => resolve();
    audio.onerror = () => {
      // Fallback: Web Speech API synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'az-AZ';
        utterance.rate = rate;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    };

    audio.play().catch(() => {
      // Fallback if autoplay policy restricts Audio play without gesture
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'az-AZ';
        utterance.rate = rate;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  });
};

export const speakEnglish = (text: string, rate: number = 0.8): Promise<void> => {
  return new Promise((resolve) => {
    if (!text || !text.trim()) {
      resolve();
      return;
    }

    const cleanText = text.trim();

    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=en&client=tw-ob`;
    const audio = new Audio(googleTtsUrl);
    audio.playbackRate = rate;

    audio.onended = () => resolve();
    audio.onerror = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = rate;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    };

    audio.play().catch(() => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = rate;
        utterance.onend = () => resolve();
        utterance.onerror = () => resolve();
        window.speechSynthesis.speak(utterance);
      } else {
        resolve();
      }
    });
  });
};
