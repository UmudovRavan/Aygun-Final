import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Heart, Zap, BookOpen, ArrowRight, Target, Clock, TrendingUp, Edit3, Check, CheckCircle2 } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import StoryCard from '../components/ui/StoryCard';
import LingoMascot from '../components/ui/LingoMascot';
import { LoadingState } from '../components/ui/Loading';
import { userService, storyService } from '../services';
import type { User, Story } from '../types';

const GOAL_OPTIONS = [5, 10, 15, 20, 30, 45, 60];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [savingGoal, setSavingGoal] = useState(false);
  const [todayMinutes, setTodayMinutes] = useState<number>(0);

  const calculateTodayMinutes = useCallback((currentUser: User | null) => {
    if (!currentUser) return 0;
    const todayStr = new Date().toISOString().split('T')[0];
    const localSeconds = Number(localStorage.getItem(`readlingo_reading_seconds_${todayStr}`) || 0);
    const localMinutes = Math.floor(localSeconds / 60);
    const backendMinutes = currentUser.stats.todayReadingTime || 0;
    return Math.max(backendMinutes, localMinutes);
  }, []);

  const loadData = async () => {
    const [u, s] = await Promise.all([userService.getProfile(), storyService.getStories()]);
    setUser(u);
    setStories(s);
    setTodayMinutes(calculateTodayMinutes(u));
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const handleTimeTick = () => {
      if (user) {
        setTodayMinutes(calculateTodayMinutes(user));
      }
    };

    const handleProfileUpdate = () => {
      loadData();
    };

    window.addEventListener('reading-time-tick', handleTimeTick);
    window.addEventListener('profile-updated', handleProfileUpdate);

    return () => {
      window.removeEventListener('reading-time-tick', handleTimeTick);
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, [calculateTodayMinutes]);

  const handleSelectGoal = async (minutes: number) => {
    if (!user || savingGoal) return;
    setSavingGoal(true);
    try {
      const updated = await userService.updateProfile({ dailyGoalMinutes: minutes });
      setUser(updated);
      setIsEditingGoal(false);
      window.dispatchEvent(new Event('profile-updated'));
    } catch (e) {
      console.error('Failed to update daily goal:', e);
    } finally {
      setSavingGoal(false);
    }
  };

  if (loading || !user) return <AppLayout><LoadingState message="Loading dashboard..." /></AppLayout>;

  const goalMinutes = user.dailyGoalMinutes > 0 ? user.dailyGoalMinutes : 15;
  const isGoalCompleted = todayMinutes >= goalMinutes;
  const progressPercent = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));

  return (
    <AppLayout>
      <div className="container-app py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-1">{user.name.split(' ')[0]}, welcome back!</h1>
            <p className="text-surface-500 dark:text-surface-400">Ready for today's reading adventure?</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-warning-50 dark:bg-warning-500/10">
              <Flame size={18} className="text-warning-500" />
              <span className="font-bold text-warning-600 dark:text-warning-400">{user.currentStreak}</span>
              <span className="text-xs text-warning-600 dark:text-warning-400">days</span>
            </div>
            <div className="flex items-center gap-1">
              {user.plan && user.plan !== 'free' ? (
                <span className="inline-flex items-center gap-1 text-sm font-bold text-danger-500 bg-danger-50 dark:bg-danger-500/10 px-2.5 py-1 rounded-full border border-danger-200 dark:border-danger-800">
                  <Heart size={16} className="fill-danger-500 text-danger-500" />
                  <span>♾️ Limitsiz</span>
                </span>
              ) : (
                Array.from({ length: user.maxHearts }).map((_, i) => (
                  <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.05, type: 'spring' }}>
                    <Heart size={20} className={i < user.hearts ? 'text-danger-500 fill-danger-500' : 'text-surface-200 dark:text-surface-700'} />
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total XP', value: user.totalXP.toLocaleString(), icon: Zap, color: 'primary' },
            { label: 'Stories Read', value: user.stats.storiesRead, icon: BookOpen, color: 'secondary' },
            { label: 'Words Learned', value: user.stats.wordsLearned, icon: TrendingUp, color: 'success' },
            { label: 'Accuracy', value: `${user.stats.averageAccuracy}%`, icon: Target, color: 'warning' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-5">
                  <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-500/10 flex items-center justify-center mb-3`}><Icon size={18} className={`text-${stat.color}-500`} /></div>
                  <p className="font-display font-bold text-xl text-surface-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-surface-400 mt-1">{stat.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>
        <Card className="p-6 bg-gradient-hero text-white relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/70 mb-1">Current Level</p>
              <h2 className="font-display text-3xl font-bold mb-2">Level {user.level} — {user.rank}</h2>
              <div className="flex items-center gap-3 text-sm"><span className="text-white/80">{user.totalXP.toLocaleString()} XP</span><span className="text-white/60">{user.stats.nextLevelXP - user.totalXP} XP to Level {user.level + 1}</span></div>
            </div>
            <div className="w-full sm:w-64">
              <div className="flex items-center justify-between text-sm mb-2"><span className="text-white/80">Progress</span><span className="text-white">{user.stats.progressToNextLevel}%</span></div>
              <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${user.stats.progressToNextLevel}%` }} /></div>
            </div>
          </div>
        </Card>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">Continue Reading</h2>
            <Link to="/library" className="text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:gap-2 transition-all">Browse all <ArrowRight size={16} /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{stories.slice(0, 4).map((s) => <StoryCard key={s.id} story={s} />)}</div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-2 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock size={20} className="text-primary-500" />
                <h2 className="font-display text-lg font-bold text-surface-900 dark:text-white">Daily Goal</h2>
              </div>
              <div className="flex items-center gap-2">
                {isGoalCompleted && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 border border-success-200 dark:border-success-800">
                    <CheckCircle2 size={13} />
                    Goal Completed!
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setIsEditingGoal(!isEditingGoal)}
                  className="text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                >
                  <Edit3 size={13} />
                  {isEditingGoal ? 'Cancel' : 'Change Goal'}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isEditingGoal && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60 overflow-hidden"
                >
                  <p className="text-xs font-medium text-surface-600 dark:text-surface-400 mb-2">Select your daily reading goal:</p>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_OPTIONS.map((mins) => {
                      const isSelected = goalMinutes === mins;
                      return (
                        <button
                          key={mins}
                          type="button"
                          disabled={savingGoal}
                          onClick={() => handleSelectGoal(mins)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-primary-600 text-white shadow-sm ring-2 ring-primary-500/30'
                              : 'bg-white dark:bg-surface-700 text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-600 border border-surface-200 dark:border-surface-600'
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                          {mins} min/day
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-surface-600 dark:text-surface-300 font-medium">
                {goalMinutes} minutes / day
              </span>
              <span className="text-surface-500 dark:text-surface-400">
                <span className="font-bold text-surface-900 dark:text-white">{todayMinutes}</span> / {goalMinutes} min today
              </span>
            </div>

            <ProgressBar
              value={todayMinutes}
              max={goalMinutes}
              color={isGoalCompleted ? "success" : "primary"}
              size="lg"
              showLabel
              label={isGoalCompleted ? "🎉 100% of today's goal completed!" : `${progressPercent}% of today's goal`}
            />

            <div className="mt-3 flex items-center justify-between text-xs text-surface-400">
              <span>{isGoalCompleted ? "Target achieved for today!" : `${Math.max(0, goalMinutes - todayMinutes)} min remaining today`}</span>
              <span>Reset in midnight</span>
            </div>
          </Card>
          <Card className="p-6 flex flex-col items-center justify-center text-center">
            <LingoMascot variant={isGoalCompleted ? "happy" : "happy"} size={64} />
            <p className="text-sm text-surface-600 dark:text-surface-300 mt-3 font-medium">
              {isGoalCompleted ? (
                <span>🎉 Lingo says: "Awesome! You reached your daily goal of <strong>{goalMinutes} min</strong>! Keep it up!"</span>
              ) : todayMinutes > 0 ? (
                <span>Lingo says: "Great progress! Read for <strong>{goalMinutes - todayMinutes} more min</strong> to complete today's goal!"</span>
              ) : (
                <span>Lingo says: "Read a story today to hit your <strong>{goalMinutes} min</strong> goal and keep your streak alive!"</span>
              )}
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
