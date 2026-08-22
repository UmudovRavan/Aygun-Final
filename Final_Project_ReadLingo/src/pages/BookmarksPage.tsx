import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import StoryCard from '../components/ui/StoryCard';
import Card from '../components/ui/Card';
import { LoadingState } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import { storyService } from '../services';
import type { Story } from '../types';

export default function BookmarksPage() {
  const { t } = useTranslation();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const all = await storyService.getStories();
      setStories(all.filter((s: Story) => s.isBookmarked));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <AppLayout><LoadingState message={t('common.loading')} /></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="container-app py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">{t('bookmarks.title')}</h1>
          <p className="text-surface-500 dark:text-surface-400">{t('bookmarks.subtitle')}</p>
        </div>

        {stories.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
              />
            ))}
          </motion.div>
        ) : (
          <Card className="p-8">
            <EmptyState icon={<Bookmark size={32} />} title={t('bookmarks.noBookmarks')} description={t('bookmarks.noBookmarksDesc')} />
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
