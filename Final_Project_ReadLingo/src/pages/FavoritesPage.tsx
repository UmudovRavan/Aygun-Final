import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Heart, BookOpen, Folder, Search, Sparkles, Compass } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import StoryCard from '../components/stories/StoryCard';
import Card from '../components/ui/Card';
import { LoadingState, EmptyState } from '../components/ui/Loading';
import { storyService, vocabularyService } from '../services';
import type { Story, VocabularyItem } from '../types';

type Tab = 'stories' | 'words' | 'categories';

export default function FavoritesPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('stories');
  const [stories, setStories] = useState<Story[]>([]);
  const [words, setWords] = useState<VocabularyItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [allStories, allWords] = await Promise.all([
        storyService.getStories(),
        vocabularyService.getVocabulary(),
      ]);
      setStories(allStories.filter((s: Story) => s.isFavorite));
      setWords(allWords.filter((w: VocabularyItem) => w.isFavorite));
      setLoading(false);
    };
    load();
  }, []);

  const tabs: { key: Tab; label: string; icon: typeof Heart; count: number }[] = [
    { key: 'stories', label: t('favorites.favoriteStories'), icon: BookOpen, count: stories.length },
    { key: 'words', label: t('favorites.favoriteWords'), icon: Heart, count: words.length },
    { key: 'categories', label: t('favorites.favoriteCategories'), icon: Folder, count: 3 },
  ];

  const favoriteCategories = [
    { name: 'Mystery', count: 5, icon: Search },
    { name: 'Fantasy', count: 3, icon: Sparkles },
    { name: 'Adventure', count: 2, icon: Compass },
  ];

  if (loading) {
    return <AppLayout><LoadingState message={t('common.loading')} /></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="container-app py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">{t('favorites.title')}</h1>
          <p className="text-surface-500 dark:text-surface-400">{t('favorites.subtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tabItem) => {
            const Icon = tabItem.icon;
            return (
              <button
                key={tabItem.key}
                onClick={() => setTab(tabItem.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  tab === tabItem.key
                    ? 'bg-primary-600 text-white shadow-soft'
                    : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'
                }`}
              >
                <Icon size={16} />
                {tabItem.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === tabItem.key ? 'bg-white/20' : 'bg-surface-100 dark:bg-surface-700'}`}>
                  {tabItem.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {tab === 'stories' && (
            stories.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {stories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>
            ) : (
              <Card className="p-8">
                <EmptyState icon={<Heart size={32} />} title={t('favorites.noFavorites')} description={t('favorites.noFavoritesDesc')} />
              </Card>
            )
          )}

          {tab === 'words' && (
            words.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {words.map((word) => (
                  <Card key={word.id} className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white capitalize">{word.word}</h3>
                        <p className="text-xs text-surface-400">{word.pronunciation} · {word.partOfSpeech}</p>
                      </div>
                      <Heart size={18} className="text-danger-500 fill-danger-500 shrink-0" />
                    </div>
                    <p className="text-sm text-primary-600 dark:text-primary-400 font-medium mb-2">{word.translation}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2">{word.example}</p>
                    <div className="mt-3 pt-3 border-t border-surface-100 dark:border-surface-800">
                      <p className="text-xs text-surface-400">From: {word.storyTitle}</p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8">
                <EmptyState icon={<Heart size={32} />} title={t('favorites.noFavorites')} description={t('favorites.noFavoritesDesc')} />
              </Card>
            )
          )}

          {tab === 'categories' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteCategories.map((cat) => (
                <Card key={cat.name} className="p-6 hover:shadow-card-hover transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center text-3xl">
                      <cat.icon className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">{cat.name}</h3>
                      <p className="text-sm text-surface-400">{t('favorites.storyCount', { count: cat.count })}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AppLayout>
  );
}
