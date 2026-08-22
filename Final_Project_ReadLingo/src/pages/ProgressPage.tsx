import { useState, useEffect } from 'react';
import { TrendingUp, Flame, Trophy, Target, BookOpen, BookMarked, Clock, Zap, Award, Star, Calendar } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import LingoMascot from '../components/ui/LingoMascot';
import { LoadingState } from '../components/ui/Loading';
import { userService, achievementService, sessionService } from '../services';
import type { User, Achievement, LearningSession, Badge as BadgeType } from '../types';

const iconMap: Record<string, typeof BookOpen> = { BookOpen, BookMarked, Flame, Zap, Target, Trophy, Award, Star, Calendar };
const badgeColors: Record<string, string> = {
  primary: 'bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400',
  secondary: 'bg-secondary-100 dark:bg-secondary-500/20 text-secondary-600 dark:text-secondary-400',
  success: 'bg-success-100 dark:bg-success-500/20 text-success-600 dark:text-success-400',
  warning: 'bg-warning-100 dark:bg-warning-500/20 text-warning-600 dark:text-warning-400',
  surface: 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300',
};

export default function ProgressPage() {
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [u, ach, ses, bdg] = await Promise.all([userService.getProfile(), achievementService.getAchievements(), sessionService.getSessions(), userService.getBadges()]);
      setUser(u); setAchievements(ach); setSessions(ses); setBadges(bdg); setLoading(false);
    };
    load();
  }, []);

  if (loading || !user) return <AppLayout><LoadingState message="Loading progress..." /></AppLayout>;

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const totalXP = sessions.reduce((sum, s) => sum + s.xp, 0);
  const totalWords = sessions.reduce((sum, s) => sum + s.wordsLearned, 0);
  const totalStories = sessions.reduce((sum, s) => sum + s.storiesRead, 0);

  return (
    <AppLayout>
      <div className="container-app py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">Your Progress</h1>
            <p className="text-surface-500 dark:text-surface-400">Track your learning journey and celebrate your achievements</p>
          </div>
          <div className="hidden sm:block"><LingoMascot variant="celebrate" size={56} /></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[{ label: 'Current Streak', value: user.currentStreak, suffix: 'days', icon: Flame, color: 'warning', bg: 'bg-warning-50 dark:bg-warning-500/10' }, { label: 'Longest Streak', value: user.longestStreak, suffix: 'days', icon: TrendingUp, color: 'primary', bg: 'bg-primary-50 dark:bg-primary-500/10' }, { label: 'Total XP', value: user.totalXP.toLocaleString(), suffix: '', icon: Zap, color: 'secondary', bg: 'bg-secondary-50 dark:bg-secondary-500/10' }, { label: 'Accuracy', value: user.stats.averageAccuracy, suffix: '%', icon: Target, color: 'success', bg: 'bg-success-50 dark:bg-success-500/10' }].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="p-5">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}><Icon size={18} className={`text-${stat.color}-500`} /></div>
                <div className="text-2xl font-display font-bold text-surface-900 dark:text-white">{stat.value}<span className="text-sm text-surface-400 ml-1">{stat.suffix}</span></div>
                <div className="text-xs text-surface-400 mt-1">{stat.label}</div>
              </Card>
            );
          })}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6 bg-gradient-hero text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div><p className="text-sm text-white/70 mb-1">Current Level</p><h2 className="font-display text-3xl font-bold">{user.stats.currentLevel}</h2></div>
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center"><Trophy size={28} /></div>
                </div>
                <div className="mb-2 flex items-center justify-between text-sm"><span className="text-white/80">{user.totalXP.toLocaleString()} XP</span><span className="text-white/60">{user.stats.nextLevelXP} XP to Level {user.level + 1}</span></div>
                <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden"><div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${user.stats.progressToNextLevel}%` }} /></div>
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white mb-4">Achievements</h3>
              <div className="space-y-4">
                {achievements.map((ach) => {
                  const Icon = iconMap[ach.icon] || Target;
                  return (
                    <div key={ach.id} className={`p-4 rounded-xl ${ach.isCompleted ? 'bg-success-50 dark:bg-success-500/10' : 'bg-surface-50 dark:bg-surface-800/50'}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ach.isCompleted ? 'bg-success-100 dark:bg-success-500/20 text-success-600 dark:text-success-400' : 'bg-white dark:bg-surface-800 text-surface-400 border border-surface-200 dark:border-surface-700'}`}><Icon size={18} /></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2"><p className="text-sm font-semibold text-surface-700 dark:text-surface-200">{ach.title}</p>{ach.isCompleted && <span className="badge bg-success-100 dark:bg-success-500/20 text-success-700 dark:text-success-300">Completed</span>}</div>
                          <p className="text-xs text-surface-400">{ach.description}</p>
                        </div>
                        <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">+{ach.xpReward} XP</p>
                      </div>
                      <ProgressBar value={ach.progress} max={ach.target} color={ach.isCompleted ? 'success' : 'primary'} size="sm" showLabel label={`${ach.progress}/${ach.target}`} />
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white mb-4">Learning History</h3>
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${session.storiesRead > 0 ? 'bg-primary-50 dark:bg-primary-500/10' : 'bg-secondary-50 dark:bg-secondary-500/10'}`}>{session.storiesRead > 0 ? <BookOpen size={16} className="text-primary-500" /> : <BookMarked size={16} className="text-secondary-500" />}</div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-surface-700 dark:text-surface-200 truncate">{session.activity}</p><p className="text-xs text-surface-400">{new Date(session.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} · {session.duration} min</p></div>
                    <div className="text-right shrink-0"><div className="text-sm font-semibold text-primary-600 dark:text-primary-400">+{session.xp} XP</div>{session.wordsLearned > 0 && <div className="text-xs text-surface-400">{session.wordsLearned} words</div>}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white mb-4">Session Summary</h3>
              <div className="space-y-3">
                {[{ label: 'Total Time', value: `${totalMinutes} min`, icon: Clock, color: 'primary' }, { label: 'Total XP Earned', value: `${totalXP} XP`, icon: Zap, color: 'warning' }, { label: 'Words Learned', value: totalWords, icon: BookMarked, color: 'success' }, { label: 'Stories Read', value: totalStories, icon: BookOpen, color: 'secondary' }].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-${item.color}-50 dark:bg-${item.color}-500/10 flex items-center justify-center`}><Icon size={14} className={`text-${item.color}-500`} /></div>
                      <span className="text-sm text-surface-600 dark:text-surface-300 flex-1">{item.label}</span>
                      <span className="text-sm font-semibold text-surface-900 dark:text-white">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white mb-4">Earned Badges</h3>
              <div className="grid grid-cols-3 gap-3">
                {badges.map((badge) => {
                  const Icon = iconMap[badge.icon] || Award;
                  return (
                    <div key={badge.id} className="flex flex-col items-center text-center group cursor-default">
                      <div className={`w-12 h-12 rounded-xl ${badgeColors[badge.color]} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform`}><Icon size={20} /></div>
                      <span className="text-xs font-medium text-surface-600 dark:text-surface-300 leading-tight">{badge.name}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
            <Card className="p-6 text-center">
              <div className="flex justify-center mb-3"><LingoMascot variant="happy" size={56} /></div>
              <h3 className="font-display text-lg font-bold text-surface-900 dark:text-white">{user.rank}</h3>
              <p className="text-sm text-surface-400 mt-1">Keep learning to reach new ranks!</p>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
