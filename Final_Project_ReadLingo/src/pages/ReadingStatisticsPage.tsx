import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Zap,
  TrendingUp,
  Award,
  Calendar,
  BarChart3,
  Search,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { LoadingState } from '../components/ui/Loading';
import { statisticsService } from '../services';
import type { ReadingStatistics } from '../types';

export default function ReadingStatisticsPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<ReadingStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await statisticsService.getStatistics();
      setStats(data);
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !stats) {
    return <AppLayout><LoadingState message={t('common.loading')} /></AppLayout>;
  }

  const overviewCards = [
    { label: t('statistics.storiesRead'), value: stats.storiesRead, icon: BookOpen, color: 'primary', bg: 'bg-primary-50 dark:bg-primary-500/10' },
    { label: t('statistics.wordsRead'), value: stats.wordsRead.toLocaleString(), icon: BarChart3, color: 'secondary', bg: 'bg-secondary-50 dark:bg-secondary-500/10' },
    { label: t('statistics.readingTime'), value: `${Math.floor(stats.totalReadingMinutes / 60)}${t('statistics.hours')} ${stats.totalReadingMinutes % 60}${t('statistics.minutes')}`, icon: Clock, color: 'success', bg: 'bg-success-50 dark:bg-success-500/10' },
    { label: t('statistics.averageWPM'), value: stats.averageWPM, icon: TrendingUp, color: 'warning', bg: 'bg-warning-50 dark:bg-warning-500/10' },
  ];

  const maxWeeklyMinutes = Math.max(...stats.weeklyData.map((d) => d.minutes), 1);
  const maxMonthlyXP = Math.max(...stats.monthlyData.map((d) => d.xp), 1);

  return (
    <AppLayout>
      <div className="container-app py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">{t('statistics.title')}</h1>
          <p className="text-surface-500 dark:text-surface-400">{t('statistics.subtitle')}</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {overviewCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="card p-5"
              >
                <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                  <Icon size={18} className={`text-${card.color}-500`} />
                </div>
                <div className="text-2xl font-display font-bold text-surface-900 dark:text-white">{card.value}</div>
                <div className="text-xs text-surface-400 mt-1">{card.label}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Progress Chart */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar size={18} className="text-primary-500" />
              <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white">{t('statistics.weeklyProgress')}</h3>
            </div>
            <div className="flex items-end justify-between gap-3 h-40">
              {stats.weeklyData.map((day, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex-1 flex flex-col justify-end relative group">
                    <div
                      className="w-full rounded-t-lg bg-gradient-primary transition-all duration-500 hover:opacity-80"
                      style={{ height: `${(day.minutes / maxWeeklyMinutes) * 100}%`, minHeight: '4px' }}
                    />
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold text-surface-700 dark:text-surface-200 whitespace-nowrap">
                      {day.minutes} min
                    </div>
                  </div>
                  <span className="text-xs text-surface-400 font-medium">{day.day}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Monthly Progress Chart */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 size={18} className="text-secondary-500" />
              <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white">{t('statistics.monthlyProgress')}</h3>
            </div>
            <div className="space-y-4">
              {stats.monthlyData.map((week, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-surface-600 dark:text-surface-300">{week.week}</span>
                    <span className="font-semibold text-surface-900 dark:text-white">{week.stories} {t('statistics.storiesRead')} · {week.xp} XP</span>
                  </div>
                  <ProgressBar value={(week.xp / maxMonthlyXP) * 100} color="secondary" size="md" />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Favorite Category */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Award size={18} className="text-warning-500" />
              <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white">{t('statistics.favoriteCategory')}</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-warning-50 dark:bg-warning-500/10 flex items-center justify-center">
                {stats.favoriteCategory === 'Mystery' ? <Search className="w-7 h-7 text-warning-500" /> : <BookOpen className="w-7 h-7 text-warning-500" />}
              </div>
              <div>
                <p className="font-display text-xl font-bold text-surface-900 dark:text-white">{stats.favoriteCategory}</p>
                <p className="text-sm text-surface-400">Most read category</p>
              </div>
            </div>
          </Card>

          {/* Most Learned Words */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-primary-500" />
              <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white">{t('statistics.mostLearnedWords')}</h3>
            </div>
            <div className="space-y-2">
              {stats.mostLearnedWords.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-sm font-bold text-surface-400">{i + 1}</span>
                    <span className="text-sm font-medium text-surface-700 dark:text-surface-300 capitalize">{item.word}</span>
                  </div>
                  <Badge color="primary">{item.count}x</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
