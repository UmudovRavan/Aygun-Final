import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, Volume2, BookOpen } from 'lucide-react';
import Button from './Button';
import { vocabularyService } from '../../services';
import type { VocabularyItem } from '../../types';

const STORAGE_KEY = 'readlingo_flashcard_index';

export default function FlashcardPopup({ onClose }: { onClose: () => void }) {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const load = async () => {
      const v = await vocabularyService.getVocabulary();
      setItems(v);
      const saved = localStorage.getItem(STORAGE_KEY);
      const startIdx = saved ? Math.min(parseInt(saved, 10), v.length - 1) : 0;
      setCurrentIndex(startIdx >= 0 ? startIdx : 0);
      setLoading(false);
    };
    load();
  }, []);

  const handleClose = useCallback(() => {
    // Advance to next word for next visit; wrap around to start
    const nextIdx = currentIndex + 1 >= items.length ? 0 : currentIndex + 1;
    localStorage.setItem(STORAGE_KEY, String(nextIdx));
    onClose();
  }, [currentIndex, items.length, onClose]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="animate-pulse text-white">Loading flashcards...</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-surface-900 rounded-2xl p-8 max-w-md w-full text-center">
          <p className="text-surface-600 dark:text-surface-300 mb-4">No vocabulary words available.</p>
          <Button variant="primary" onClick={handleClose}>Close</Button>
        </div>
      </div>
    );
  }

  const card = items[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-surface-100 dark:border-surface-800">
          <BookOpen size={18} className="text-primary-500" />
          <h2 className="font-display font-bold text-surface-900 dark:text-white">Flashcards</h2>
        </div>

        {/* Flashcard */}
        <div className="px-6 py-6" style={{ perspective: '1000px' }}>
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={() => setFlipped(!flipped)}
            className="relative w-full h-64 cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={flipped ? 'back' : 'front'}
                initial={{ rotateY: 180, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -180, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {!flipped ? (
                  /* Front - just the word */
                  <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-surface-800 dark:to-surface-700 rounded-2xl border-2 border-primary-200 dark:border-surface-600 p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); speak(card.word); }}
                        className="text-surface-400 hover:text-primary-500 transition-colors"
                      >
                        <Volume2 size={18} />
                      </button>
                      <span className="badge bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">BOOK</span>
                    </div>
                    <h2 className="font-display text-4xl font-bold text-surface-900 dark:text-white mb-2 text-center">{card.word}</h2>
                    <p className="text-xs text-surface-400 mt-4">Click to flip</p>
                  </div>
                ) : (
                  /* Back - translation, pronunciation, part of speech, example */
                  <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-surface-50 to-surface-100 dark:from-surface-800 dark:to-surface-700 rounded-2xl border-2 border-surface-200 dark:border-surface-600 p-6 overflow-y-auto">
                    <p className="font-display text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2 text-center">{card.translation}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); speak(card.word); }}
                        className="text-surface-400 hover:text-primary-500 transition-colors"
                      >
                        <Volume2 size={16} />
                      </button>
                      <span className="text-sm text-surface-500 dark:text-surface-400">{card.pronunciation}</span>
                    </div>
                    <span className="badge bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 mb-3">{card.partOfSpeech}</span>
                    <p className="text-sm text-surface-600 dark:text-surface-300 italic text-center border-l-2 border-primary-300 pl-3">"{card.example}"</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Action buttons */}
        <div className="px-6 pb-6 flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => setFlipped(!flipped)} leftIcon={<RotateCcw size={16} />}>
            Flip
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClose} leftIcon={<X size={16} />}>
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
