import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Search, BookOpen, Heart, CheckCircle2, Volume2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import { LoadingState, EmptyState } from '../components/ui/Loading';
import { vocabularyService } from '../services';
import type { VocabularyItem } from '../types';

type Filter = 'all' | 'learned' | 'not_learned' | 'favorites';

export default function UnknownWordsPage() {
  const { t } = useTranslation();
  const [words, setWords] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const load = async () => {
      const data = await vocabularyService.getVocabulary();
      setWords(data);
      setLoading(false);
    };
    load();
  }, []);

  const categories = ['All', ...new Set(words.map((w) => w.storyTitle))];

  const filtered = words.filter((w) => {
    if (filter === 'learned' && !w.isMastered) return false;
    if (filter === 'not_learned' && w.isMastered) return false;
    if (filter === 'favorites' && !w.isFavorite) return false;
    if (category !== 'All' && w.storyTitle !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return w.word.toLowerCase().includes(q) || w.translation.toLowerCase().includes(q);
    }
    return true;
  });

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All Words', count: words.length },
    { key: 'not_learned', label: 'Not Learned', count: words.filter((w) => !w.isMastered).length },
    { key: 'learned', label: 'Learned', count: words.filter((w) => w.isMastered).length },
    { key: 'favorites', label: 'Favorites', count: words.filter((w) => w.isFavorite).length },
  ];

  if (loading) {
    return <AppLayout><LoadingState message={t('common.loading')} /></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="container-app py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">Unknown Words</h1>
          <p className="text-surface-500 dark:text-surface-400">Every word you've clicked while reading</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search words..."
            className="input pl-12"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                filter === f.key
                  ? 'bg-primary-600 text-white shadow-soft'
                  : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700'
              }`}
            >
              {f.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f.key ? 'bg-white/20' : 'bg-surface-100 dark:bg-surface-700'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                category === cat
                  ? 'bg-surface-900 dark:bg-white text-white dark:text-surface-900'
                  : 'bg-white dark:bg-surface-800 text-surface-500 dark:text-surface-400 border border-surface-200 dark:border-surface-700'
              }`}
            >
              {cat === 'All' ? 'All Stories' : cat}
            </button>
          ))}
        </div>

        {/* Words Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((word, i) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
              >
                <Card className="p-5 hover:shadow-card-hover transition-all duration-300">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white capitalize">{word.word}</h3>
                      <p className="text-xs text-surface-400">{word.pronunciation} · {word.partOfSpeech}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {word.isMastered && (
                        <span className="w-6 h-6 rounded-full bg-success-50 dark:bg-success-500/10 flex items-center justify-center">
                          <CheckCircle2 size={14} className="text-success-500" />
                        </span>
                      )}
                      {word.isFavorite && (
                        <span className="w-6 h-6 rounded-full bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center">
                          <Heart size={14} className="text-danger-500 fill-danger-500" />
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">{word.translation}</p>
                  <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2 mb-3">{word.example}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-surface-100 dark:border-surface-800">
                    <span className="text-xs text-surface-400 truncate">From: {word.storyTitle}</span>
                    <button className="text-surface-300 hover:text-primary-500 transition-colors">
                      <Volume2 size={14} />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-8">
            <EmptyState icon={<BookOpen size={32} />} title="No words found" description="Try adjusting your filters or search query." />
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
