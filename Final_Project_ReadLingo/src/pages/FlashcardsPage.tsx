import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Shuffle, Heart, CheckCircle2, ChevronLeft, ChevronRight, Layers, Volume2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { LoadingState, EmptyState } from '../components/ui/Loading';
import { flashcardService } from '../services';
import type { Flashcard } from '../types';

export default function FlashcardsPage() {
  const { t } = useTranslation();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const data = await flashcardService.getFlashcards();
      setCards(data);
      setLearnedCount(data.filter((c) => c.isLearned).length);
      setLoading(false);
    };
    load();
  }, []);

  const handleShuffle = () => {
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setFlipped(false);
  };

  const handleNext = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const handleToggleFavorite = async (id: string) => {
    await flashcardService.toggleFavorite(id);
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, isFavorite: !c.isFavorite } : c));
  };

  const handleToggleLearned = async (id: string) => {
    await flashcardService.markLearned(id);
    setCards((prev) => {
      const updated = prev.map((c) => c.id === id ? { ...c, isLearned: !c.isLearned } : c);
      setLearnedCount(updated.filter((c) => c.isLearned).length);
      return updated;
    });
  };

  if (loading) {
    return <AppLayout><LoadingState message={t('common.loading')} /></AppLayout>;
  }

  if (cards.length === 0) {
    return (
      <AppLayout>
        <div className="container-app py-8">
          <Card className="p-8">
            <EmptyState icon={<Layers size={32} />} title="No flashcards yet" description="Save words from stories to create flashcards." />
          </Card>
        </div>
      </AppLayout>
    );
  }

  const card = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <AppLayout>
      <div className="container-app py-8 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">Flashcards</h1>
            <p className="text-surface-500 dark:text-surface-400">{cards.length} cards · {learnedCount} learned</p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleShuffle} leftIcon={<Shuffle size={16} />}>
            Shuffle
          </Button>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-surface-600 dark:text-surface-300">Card {currentIndex + 1} of {cards.length}</span>
            <span className="text-surface-400">{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} color="primary" size="md" />
        </div>

        {/* Flashcard */}
        <div className="mb-6" style={{ perspective: '1000px' }}>
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            onClick={() => setFlipped(!flipped)}
            className="relative w-full h-80 cursor-pointer"
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
                <Card className="h-full flex flex-col items-center justify-center p-8">
                  {!flipped ? (
                    /* Front */
                    <>
                      <div className="flex items-center gap-2 mb-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="text-surface-300 hover:text-primary-500 transition-colors"
                        >
                          <Volume2 size={18} />
                        </button>
                        <Badge color="surface">{card.category}</Badge>
                      </div>
                      <h2 className="font-display text-4xl font-bold text-surface-900 dark:text-white mb-2 text-center">{card.word}</h2>
                      <p className="text-sm text-surface-400">{card.pronunciation}</p>
                      <p className="text-xs text-surface-300 mt-6">Click to flip</p>
                    </>
                  ) : (
                    /* Back */
                    <>
                      <Badge color="primary" className="mb-4">{card.partOfSpeech}</Badge>
                      <p className="font-display text-2xl font-bold text-primary-600 dark:text-primary-400 mb-3 text-center">{card.translation}</p>
                      <p className="text-sm text-surface-600 dark:text-surface-300 text-center mb-4">{card.definition}</p>
                      <p className="text-sm text-surface-500 dark:text-surface-400 italic text-center border-l-2 border-primary-300 pl-3">"{card.example}"</p>
                    </>
                  )}
                </Card>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handlePrev}
            className="w-12 h-12 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 flex items-center justify-center hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft size={20} className="text-surface-500" />
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleToggleFavorite(card.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                card.isFavorite
                  ? 'bg-danger-500 text-white'
                  : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700'
              }`}
            >
              <Heart size={16} className={card.isFavorite ? 'fill-white' : ''} />
              <span className="hidden sm:inline">{card.isFavorite ? 'Favorited' : 'Favorite'}</span>
            </button>
            <button
              onClick={() => handleToggleLearned(card.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                card.isLearned
                  ? 'bg-success-500 text-white'
                  : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700'
              }`}
            >
              <CheckCircle2 size={16} />
              <span className="hidden sm:inline">{card.isLearned ? 'Learned' : 'Mark Learned'}</span>
            </button>
          </div>

          <button
            onClick={handleNext}
            className="w-12 h-12 rounded-xl bg-gradient-primary text-white flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
