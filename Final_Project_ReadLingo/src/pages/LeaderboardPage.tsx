import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, BookOpen, Brain, Target, Eye, EyeOff, Sparkles, User } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { LoadingState } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import { leaderboardService, userService } from '../services';
import type { LeaderboardEntry } from '../types';

type CategoryKey = 'xp' | 'stories' | 'words' | 'quiz';

const categoryTabs: { key: CategoryKey; label: string; icon: any; color: string }[] = [
  { key: 'xp', label: 'Total XP', icon: Sparkles, color: 'text-warning-500' },
  { key: 'stories', label: 'Stories Read', icon: BookOpen, color: 'text-primary-500' },
  { key: 'words', label: 'Words Learned', icon: Brain, color: 'text-secondary-500' },
  { key: 'quiz', label: 'Quiz Accuracy', icon: Target, color: 'text-success-500' },
];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('xp');
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [togglingPrivacy, setTogglingPrivacy] = useState(false);

  const loadData = async (cat: CategoryKey = activeCategory) => {
    setLoading(true);
    try {
      const [list, profile] = await Promise.all([
        leaderboardService.getLeaderboard(cat),
        userService.getProfile(),
      ]);
      setEntries(list);
      setIsAnonymous(profile.isAnonymousInLeaderboard || false);
    } catch (e) {
      console.error('Failed to load leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(activeCategory);
  }, [activeCategory]);

  const handleTogglePrivacy = async () => {
    const nextState = !isAnonymous;
    setTogglingPrivacy(true);
    try {
      await leaderboardService.togglePrivacy(nextState);
      setIsAnonymous(nextState);
      loadData(activeCategory);
    } catch (e: any) {
      alert(e?.message || 'Failed to update privacy setting.');
    } finally {
      setTogglingPrivacy(false);
    }
  };

  const top3 = entries.slice(0, 3);
  const currentUserEntry = entries.find((e) => e.isCurrentUser);

  const getMetricValue = (entry: LeaderboardEntry, cat: CategoryKey) => {
    switch (cat) {
      case 'stories':
        return `${entry.storiesReadCount} stories`;
      case 'words':
        return `${entry.wordsLearnedCount} words`;
      case 'quiz':
        return `${entry.accuracyPercentage}% (${entry.quizzesCompletedCount} quizzes)`;
      case 'xp':
      default:
        return `${entry.totalXp.toLocaleString()} XP`;
    }
  };

  return (
    <AppLayout>
      <div className="container-app py-8 max-w-6xl">
        {/* Top Banner Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 rounded-3xl p-6 lg:p-8 text-white shadow-soft relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="space-y-2 max-w-xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold text-white mb-1">
              <Trophy size={14} className="text-warning-300" /> ReadLingo Hall of Fame
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">Leaderboard & Rankings</h1>
            <p className="text-primary-100 text-sm sm:text-base">
              Compete with readers worldwide, learn words, complete quizzes, and climb to the top!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 z-10">
            {/* Privacy Toggle Switch */}
            <Card className="p-3.5 bg-white/10 backdrop-blur-md border-white/20 text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20">
                {isAnonymous ? <EyeOff size={18} className="text-warning-300" /> : <Eye size={18} className="text-success-300" />}
              </div>
              <div>
                <p className="text-xs font-semibold leading-tight">Incognito Mode</p>
                <p className="text-[11px] text-primary-100">{isAnonymous ? 'Appearing as Anonymous' : 'Name Visible'}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleTogglePrivacy}
                disabled={togglingPrivacy}
                className="ml-2 text-xs bg-white/20 hover:bg-white/30 text-white border-0"
              >
                {isAnonymous ? 'Make Public' : 'Go Anonymous'}
              </Button>
            </Card>
          </div>
        </div>

        {/* User Current Position Bar */}
        {currentUserEntry && (
          <Card className="mb-8 p-4 border-2 border-primary-500/30 bg-primary-50/50 dark:bg-primary-500/10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center font-bold text-white text-lg shadow-md">
                  #{currentUserEntry.rank}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-surface-900 dark:text-white text-base">Your Current Rank</h3>
                    <Badge color="primary">{currentUserEntry.level}</Badge>
                    {isAnonymous && <Badge color="warning">Anonymous Mode</Badge>}
                  </div>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    You have <span className="font-bold text-primary-600 dark:text-primary-400">{currentUserEntry.totalXp} XP</span> · {currentUserEntry.storiesReadCount} Stories Read
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="text-right">
                  <p className="text-xs text-surface-400">Score ({activeCategory.toUpperCase()})</p>
                  <p className="font-bold text-surface-900 dark:text-white text-base">{getMetricValue(currentUserEntry, activeCategory)}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-8 pb-2">
          {categoryTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeCategory === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25 scale-[1.02]'
                    : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : tab.color} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <LoadingState message="Loading leaderboard rankings..." />
        ) : entries.length === 0 ? (
          <Card className="p-8">
            <EmptyState icon={<Trophy size={40} />} title="No rankings found" description="Be the first to read stories and earn XP to claim the #1 spot!" />
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Top 3 Podium Display */}
            {top3.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
                {/* 2nd Place */}
                {top3[1] && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="order-2 md:order-1">
                    <Card className="p-6 text-center border-2 border-surface-300 dark:border-surface-600 relative overflow-hidden bg-gradient-to-b from-surface-100 to-white dark:from-surface-800 dark:to-surface-900">
                      <div className="absolute top-0 right-0 px-3 py-1 bg-surface-300 text-surface-900 font-bold text-xs rounded-bl-xl">2ND PLACE</div>
                      <div className="w-16 h-16 rounded-full mx-auto mb-3 relative flex items-center justify-center ring-4 ring-surface-300 dark:ring-surface-600 overflow-hidden bg-surface-200">
                        {top3[1].profilePictureUrl ? (
                          <img src={top3[1].profilePictureUrl} alt={top3[1].userName} className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-surface-400" />
                        )}
                        <span className="absolute -bottom-1 text-lg">🥈</span>
                      </div>
                      <h3 className="font-bold text-surface-900 dark:text-white line-clamp-1">{top3[1].userName}</h3>
                      <Badge color="surface" className="mt-1">{top3[1].level}</Badge>
                      <p className="font-display font-extrabold text-lg text-primary-600 dark:text-primary-400 mt-3">
                        {getMetricValue(top3[1], activeCategory)}
                      </p>
                    </Card>
                  </motion.div>
                )}

                {/* 1st Place (Center / Taller) */}
                {top3[0] && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="order-1 md:order-2">
                    <Card className="p-7 text-center border-2 border-warning-400 relative overflow-hidden bg-gradient-to-b from-warning-500/10 via-white to-white dark:from-warning-500/20 dark:via-surface-800 dark:to-surface-900 shadow-xl scale-105">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-warning-500 to-amber-600 text-white font-black text-xs rounded-b-xl shadow-md flex items-center gap-1">
                        <Sparkles size={12} /> CHAMPION <Sparkles size={12} />
                      </div>
                      <div className="w-20 h-20 rounded-full mx-auto mt-4 mb-3 relative flex items-center justify-center ring-4 ring-warning-400 overflow-hidden bg-warning-100 shadow-lg">
                        {top3[0].profilePictureUrl ? (
                          <img src={top3[0].profilePictureUrl} alt={top3[0].userName} className="w-full h-full object-cover" />
                        ) : (
                          <User size={40} className="text-warning-600" />
                        )}
                        <span className="absolute -bottom-1 text-2xl">🥇</span>
                      </div>
                      <h3 className="font-black text-lg text-surface-900 dark:text-white line-clamp-1">{top3[0].userName}</h3>
                      <Badge color="warning" className="mt-1 font-bold">{top3[0].level}</Badge>
                      <p className="font-display font-black text-2xl text-warning-600 dark:text-warning-400 mt-3">
                        {getMetricValue(top3[0], activeCategory)}
                      </p>
                    </Card>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="order-3 md:order-3">
                    <Card className="p-6 text-center border-2 border-amber-700/40 relative overflow-hidden bg-gradient-to-b from-amber-700/10 to-white dark:from-amber-700/20 dark:to-surface-900">
                      <div className="absolute top-0 right-0 px-3 py-1 bg-amber-700 text-white font-bold text-xs rounded-bl-xl">3RD PLACE</div>
                      <div className="w-16 h-16 rounded-full mx-auto mb-3 relative flex items-center justify-center ring-4 ring-amber-700/40 overflow-hidden bg-amber-100">
                        {top3[2].profilePictureUrl ? (
                          <img src={top3[2].profilePictureUrl} alt={top3[2].userName} className="w-full h-full object-cover" />
                        ) : (
                          <User size={32} className="text-amber-800" />
                        )}
                        <span className="absolute -bottom-1 text-lg">🥉</span>
                      </div>
                      <h3 className="font-bold text-surface-900 dark:text-white line-clamp-1">{top3[2].userName}</h3>
                      <Badge color="surface" className="mt-1">{top3[2].level}</Badge>
                      <p className="font-display font-extrabold text-lg text-primary-600 dark:text-primary-400 mt-3">
                        {getMetricValue(top3[2], activeCategory)}
                      </p>
                    </Card>
                  </motion.div>
                )}
              </div>
            )}

            {/* Leaderboard Table List */}
            <Card className="p-0 overflow-hidden border border-surface-200 dark:border-surface-700">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-surface-500 dark:text-surface-400 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/60">
                      <th className="px-6 py-4 font-bold">Rank</th>
                      <th className="px-6 py-4 font-bold">Reader</th>
                      <th className="px-6 py-4 font-bold text-center">Level</th>
                      <th className="px-6 py-4 font-bold text-center">Stories</th>
                      <th className="px-6 py-4 font-bold text-center">Words</th>
                      <th className="px-6 py-4 font-bold text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((entry) => {
                      const medalEmoji = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : null;

                      return (
                        <tr
                          key={entry.userId}
                          className={`border-b border-surface-100 dark:border-surface-800 transition-colors ${
                            entry.isCurrentUser
                              ? 'bg-primary-50/80 dark:bg-primary-500/15 font-semibold'
                              : 'hover:bg-surface-50 dark:hover:bg-surface-800/40'
                          }`}
                        >
                          {/* Rank */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {medalEmoji ? (
                                <span className="text-xl">{medalEmoji}</span>
                              ) : (
                                <span className="w-7 h-7 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center font-bold text-surface-700 dark:text-surface-300 text-xs">
                                  #{entry.rank}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Reader Avatar & Name */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center overflow-hidden shrink-0 border border-surface-200 dark:border-surface-600">
                                {entry.profilePictureUrl ? (
                                  <img src={entry.profilePictureUrl} alt={entry.userName} className="w-full h-full object-cover" />
                                ) : (
                                  <User size={20} className="text-surface-400" />
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-surface-900 dark:text-white text-sm">
                                    {entry.userName}
                                  </span>
                                  {entry.isCurrentUser && <Badge color="primary" className="text-[10px]">YOU</Badge>}
                                  {entry.isAnonymous && <span className="text-[10px] text-surface-400">(Incognito)</span>}
                                </div>
                                <span className="text-xs text-surface-400">{entry.totalXp} XP total</span>
                              </div>
                            </div>
                          </td>

                          {/* Level */}
                          <td className="px-6 py-4 text-center">
                            <Badge color="surface">{entry.level}</Badge>
                          </td>

                          {/* Stories Read */}
                          <td className="px-6 py-4 text-center font-medium text-surface-700 dark:text-surface-300">
                            {entry.storiesReadCount}
                          </td>

                          {/* Words Learned */}
                          <td className="px-6 py-4 text-center font-medium text-surface-700 dark:text-surface-300">
                            {entry.wordsLearnedCount}
                          </td>

                          {/* Score / Metric */}
                          <td className="px-6 py-4 text-right">
                            <span className="font-bold text-primary-600 dark:text-primary-400 text-base">
                              {getMetricValue(entry, activeCategory)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
