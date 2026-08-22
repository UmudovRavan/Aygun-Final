import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { History, Clock, Zap, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { LoadingState, EmptyState } from '../components/ui/Loading';
import { historyService } from '../services';
import type { ReadingHistoryItem } from '../types';

export default function ReadingHistoryPage() {
  const { t } = useTranslation();
  const [history, setHistory] = useState<ReadingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await historyService.getReadingHistory();
      setHistory(data);
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
          <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">{t('history.title')}</h1>
          <p className="text-surface-500 dark:text-surface-400">{t('history.subtitle')}</p>
        </div>

        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link to={`/story/${item.storyId}`}>
                  <Card className="p-5 hover:shadow-card-hover transition-all duration-300 group">
                    <div className="flex items-center gap-4">
                      <img src={item.storyCover} alt={item.storyTitle} className="w-14 h-20 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-bold text-surface-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {item.storyTitle}
                        </h3>
                        <p className="text-xs text-surface-400 mt-1">
                          {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="flex items-center gap-1 text-xs text-surface-400">
                            <Clock size={12} /> {item.readingTimeMinutes} {t('statistics.minutes')}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-surface-400">
                            <BookOpen size={12} /> {item.wordsLearned} {t('dashboard.wordsLearned')}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-primary-500 font-medium">
                            <Zap size={12} /> +{item.xpEarned} XP
                          </span>
                        </div>
                        <div className="mt-2">
                          <ProgressBar value={item.progress} size="sm" color={item.progress === 100 ? 'success' : 'primary'} />
                        </div>
                      </div>
                      <Badge color={item.progress === 100 ? 'success' : 'primary'} className="shrink-0">
                        {item.progress}%
                      </Badge>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="p-8">
            <EmptyState icon={<History size={32} />} title={t('history.noHistory')} description={t('history.noHistoryDesc')} />
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
