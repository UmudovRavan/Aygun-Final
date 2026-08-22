import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Search, Star, BookOpen, CheckCircle2, Brain, TrendingUp, Volume2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LingoMascot from '../components/ui/LingoMascot';
import { LoadingState } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import FlashcardPopup from '../components/ui/FlashcardPopup';
import { vocabularyService } from '../services';
import type { VocabularyItem } from '../types';

const masteryColors: Record<string, string> = {
  New: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
  Learning: 'bg-warning-100 dark:bg-warning-500/20 text-warning-700 dark:text-warning-300 border border-warning-200 dark:border-warning-800',
  Mastered: 'bg-success-100 dark:bg-success-500/20 text-success-700 dark:text-success-300 border border-success-200 dark:border-success-800',
};

function speakEnglish(word: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = 0.85;
  window.speechSynthesis.speak(utterance);
}

export default function VocabularyPage() {
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [showFlashcardPopup, setShowFlashcardPopup] = useState(true);

  useEffect(() => {
    const load = async () => {
      const v = await vocabularyService.getVocabulary();
      const masteredIds: string[] = JSON.parse(localStorage.getItem('readlingo_mastered_word_ids') || '[]');
      const favoriteIds: string[] = JSON.parse(localStorage.getItem('readlingo_favorite_word_ids') || '[]');
      const learningIds: string[] = JSON.parse(localStorage.getItem('readlingo_learning_word_ids') || '[]');
      const newIds: string[] = JSON.parse(localStorage.getItem('readlingo_new_word_ids') || '[]');

      const merged = v.map((item, index) => {
        const isMastered = masteredIds.includes(item.id) || (!learningIds.includes(item.id) && !newIds.includes(item.id) && item.isMastered);
        const isFavorite = item.isFavorite || favoriteIds.includes(item.id);
        
        let level: 'New' | 'Learning' | 'Mastered' = 'New';
        if (isMastered) {
          level = 'Mastered';
        } else if (learningIds.includes(item.id)) {
          level = 'Learning';
        } else if (newIds.includes(item.id)) {
          level = 'New';
        } else if (item.masteryLevel) {
          level = item.masteryLevel;
        } else {
          // If unreviewed, alternate or set New
          level = index % 3 === 0 ? 'New' : 'Learning';
        }

        return {
          ...item,
          isMastered: level === 'Mastered',
          isFavorite,
          masteryLevel: level,
        };
      });

      setItems(merged);
      setLoading(false);
    };
    load();
  }, []);

  const handleToggleFavorite = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextFav = !item.isFavorite;
          const favoriteIds: string[] = JSON.parse(localStorage.getItem('readlingo_favorite_word_ids') || '[]');
          const updated = nextFav ? Array.from(new Set([...favoriteIds, id])) : favoriteIds.filter((fId) => fId !== id);
          localStorage.setItem('readlingo_favorite_word_ids', JSON.stringify(updated));
          return { ...item, isFavorite: nextFav };
        }
        return item;
      })
    );
  };

  const handleSetMastery = (id: string, newLevel: 'New' | 'Learning' | 'Mastered') => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const masteredIds: string[] = JSON.parse(localStorage.getItem('readlingo_mastered_word_ids') || '[]');
          const learningIds: string[] = JSON.parse(localStorage.getItem('readlingo_learning_word_ids') || '[]');
          const newIds: string[] = JSON.parse(localStorage.getItem('readlingo_new_word_ids') || '[]');

          const cleanMastered = masteredIds.filter((mId) => mId !== id);
          const cleanLearning = learningIds.filter((lId) => lId !== id);
          const cleanNew = newIds.filter((nId) => nId !== id);

          if (newLevel === 'Mastered') cleanMastered.push(id);
          if (newLevel === 'Learning') cleanLearning.push(id);
          if (newLevel === 'New') cleanNew.push(id);

          localStorage.setItem('readlingo_mastered_word_ids', JSON.stringify(cleanMastered));
          localStorage.setItem('readlingo_learning_word_ids', JSON.stringify(cleanLearning));
          localStorage.setItem('readlingo_new_word_ids', JSON.stringify(cleanNew));

          return {
            ...item,
            masteryLevel: newLevel,
            isMastered: newLevel === 'Mastered',
          };
        }
        return item;
      })
    );
  };

  const filtered = items.filter((i) => {
    const matchesSearch =
      search === '' ||
      i.word.toLowerCase().includes(search.toLowerCase()) ||
      i.translation.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filter === 'All') return true;
    if (filter === 'Mastered') return i.masteryLevel === 'Mastered';
    if (filter === 'Learning') return i.masteryLevel === 'Learning';
    if (filter === 'New') return i.masteryLevel === 'New';
    if (filter === 'Favorites') return i.isFavorite;

    return true;
  });

  const stats = {
    total: items.length,
    mastered: items.filter((i) => i.masteryLevel === 'Mastered').length,
    learning: items.filter((i) => i.masteryLevel === 'Learning').length,
    new: items.filter((i) => i.masteryLevel === 'New').length,
    favorites: items.filter((i) => i.isFavorite).length,
  };

  const filterTabs = [
    { key: 'All', label: 'All', count: stats.total },
    { key: 'Mastered', label: 'Mastered', count: stats.mastered },
    { key: 'Learning', label: 'Learning', count: stats.learning },
    { key: 'New', label: 'New', count: stats.new },
    { key: 'Favorites', label: 'Favorites', count: stats.favorites },
  ];

  if (loading) return <AppLayout><LoadingState message="Loading vocabulary..." /></AppLayout>;

  return (
    <AppLayout>
      <AnimatePresence>
        {showFlashcardPopup && <FlashcardPopup onClose={() => setShowFlashcardPopup(false)} />}
      </AnimatePresence>
      <div className="container-app py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">My Vocabulary</h1>
            <p className="text-surface-500 dark:text-surface-400">Review and master words you've learned from stories</p>
          </div>
          <div className="hidden sm:block"><LingoMascot variant="study" size={56} /></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-8">
          {[
            { label: 'Total Words', value: stats.total, icon: BookOpen, color: 'primary', bg: 'bg-primary-50 dark:bg-primary-500/10' },
            { label: 'Mastered', value: stats.mastered, icon: CheckCircle2, color: 'success', bg: 'bg-success-50 dark:bg-success-500/10' },
            { label: 'Learning', value: stats.learning, icon: Brain, color: 'warning', bg: 'bg-warning-50 dark:bg-warning-500/10' },
            { label: 'New', value: stats.new, icon: TrendingUp, color: 'indigo', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
            { label: 'Favorites', value: stats.favorites, icon: Star, color: 'amber', bg: 'bg-amber-50 dark:bg-amber-500/10' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="p-4 cursor-pointer hover:border-primary-300 dark:hover:border-primary-700 transition-all" onClick={() => setFilter(stat.label === 'Total Words' ? 'All' : stat.label)}>
                <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}><Icon size={18} className={`text-${stat.color}-500`} /></div>
                <div className="text-2xl font-display font-bold text-surface-900 dark:text-white">{stat.value}</div>
                <div className="text-xs text-surface-400 mt-0.5">{stat.label}</div>
              </Card>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search words or translations..." className="input pl-12" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  filter === tab.key
                    ? 'bg-primary-600 text-white shadow-soft font-semibold'
                    : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'
                }`}
              >
                {tab.key === 'Favorites' && <Star size={14} className={filter === 'Favorites' ? 'fill-white text-white' : 'text-amber-500 fill-amber-500'} />}
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${filter === tab.key ? 'bg-white/25 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Vocabulary Items Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
            {filtered.map((item) => (
              <Card key={item.id} className="p-5 hover:shadow-card-hover transition-all duration-300 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-display text-xl font-bold text-surface-900 dark:text-white">{item.word}</h3>
                        <button
                          onClick={() => handleToggleFavorite(item.id)}
                          className="p-1 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
                          title={item.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        >
                          <Star size={18} className={item.isFavorite ? 'text-amber-400 fill-amber-400' : 'text-surface-300 hover:text-amber-400'} />
                        </button>
                      </div>
                      <p className="text-xs text-surface-400 font-mono">{item.pronunciation} · {item.partOfSpeech}</p>
                    </div>
                    
                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5">
                      <span className={`badge text-xs font-semibold px-2.5 py-1 rounded-lg ${masteryColors[item.masteryLevel]}`}>
                        {item.masteryLevel}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-surface-700 dark:text-surface-200 mb-2">
                    <span className="font-semibold text-primary-600 dark:text-primary-400">Tərcümə:</span> {item.translation}
                  </p>
                  
                  {item.example && (
                    <p className="text-xs text-surface-500 dark:text-surface-400 italic mb-3 bg-surface-50 dark:bg-surface-800/60 p-2.5 rounded-xl border border-surface-100 dark:border-surface-800">
                      "{item.example}"
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-surface-400 mb-4">
                    {item.storyTitle && (
                      <>
                        <span className="flex items-center gap-1"><BookOpen size={12} /> {item.storyTitle}</span>
                        <span>·</span>
                      </>
                    )}
                    <span>Təkrar: {item.reviewCount} dəfə</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-surface-100 dark:border-surface-700">
                  <div className="flex items-center gap-1.5">
                    <Button variant="ghost" size="sm" leftIcon={<Volume2 size={14} />} onClick={() => speakEnglish(item.word)} className="text-xs">
                      EN
                    </Button>
                  </div>

                  <div className="flex items-center gap-1">
                    {item.masteryLevel !== 'New' && (
                      <button
                        onClick={() => handleSetMastery(item.id, 'New')}
                        className="px-2 py-1 rounded-lg text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                        title="Yeni kimi işarələ"
                      >
                        New
                      </button>
                    )}
                    {item.masteryLevel !== 'Learning' && (
                      <button
                        onClick={() => handleSetMastery(item.id, 'Learning')}
                        className="px-2 py-1 rounded-lg text-xs font-medium text-warning-600 dark:text-warning-400 hover:bg-warning-50 dark:hover:bg-warning-500/10 transition-colors"
                        title="Öyrənilir kimi işarələ"
                      >
                        Learning
                      </button>
                    )}
                    {item.masteryLevel !== 'Mastered' && (
                      <button
                        onClick={() => handleSetMastery(item.id, 'Mastered')}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-500/10 hover:bg-success-100 dark:hover:bg-success-500/20 transition-colors flex items-center gap-1"
                        title="Mənimsənildi kimi işarələ"
                      >
                        <CheckCircle2 size={12} /> Mastered
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8">
            <EmptyState
              icon={<BookOpen size={32} />}
              title={`${filter} kateqoriyasında söz tapılmadı`}
              description="Axtarış sorğusunu və ya seçilmiş filtri dəyişməyə cəhd edin."
            />
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
