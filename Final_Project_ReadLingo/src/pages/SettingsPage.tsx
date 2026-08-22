import { useState } from 'react';
import { Bell, Globe, Moon, Sun, Type, Volume2, Lock, User, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LingoMascot from '../components/ui/LingoMascot';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services';

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className={`relative w-11 h-6 rounded-full transition-colors ${on ? 'bg-primary-500' : 'bg-surface-300 dark:bg-surface-700'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-5' : ''}`} />
    </button>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const [notifications, setNotifications] = useState({ dailyReminder: true, streakAlert: true, newStories: false, weeklyReport: true });
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoPronounce, setAutoPronounce] = useState(false);
  const [fontSize, setFontSize] = useState('md');

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <AppLayout>
      <div className="container-app py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">Settings</h1>
            <p className="text-surface-500 dark:text-surface-400">Customize your ReadLingo experience</p>
          </div>
          <div className="hidden sm:block"><LingoMascot variant="study" size={56} /></div>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4"><Moon size={20} className="text-primary-500" /><h2 className="font-display text-lg font-bold text-surface-900 dark:text-white">Appearance</h2></div>
          <div className="space-y-4 divide-y divide-surface-100 dark:divide-surface-800">
            <div className="flex items-center justify-between pt-3"><div className="flex items-center gap-3"><Sun size={16} className="text-surface-400" /><span className="text-sm font-medium text-surface-700 dark:text-surface-300">Dark Mode</span></div><Toggle on={theme === 'dark'} onToggle={toggle} /></div>
            <div className="flex items-center justify-between pt-3"><div className="flex items-center gap-3"><Type size={16} className="text-surface-400" /><span className="text-sm font-medium text-surface-700 dark:text-surface-300">Reading Font Size</span></div>
              <div className="flex items-center gap-1 bg-surface-50 dark:bg-surface-800 rounded-lg p-1">
                {['sm', 'md', 'lg'].map((s) => <button key={s} onClick={() => setFontSize(s)} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${fontSize === s ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-soft' : 'text-surface-400'}`}>{s === 'sm' ? 'A' : s === 'md' ? 'A+' : 'A++'}</button>)}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4"><Bell size={20} className="text-warning-500" /><h2 className="font-display text-lg font-bold text-surface-900 dark:text-white">Notifications</h2></div>
          <div className="space-y-2 divide-y divide-surface-100 dark:divide-surface-800">
            {Object.entries({ dailyReminder: 'Daily Reading Reminder', streakAlert: 'Streak Alert', newStories: 'New Story Notifications', weeklyReport: 'Weekly Progress Report' }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-3"><span className="text-sm font-medium text-surface-700 dark:text-surface-300">{label}</span><Toggle on={notifications[key as keyof typeof notifications]} onToggle={() => setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] })} /></div>
            ))}
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4"><Volume2 size={20} className="text-secondary-500" /><h2 className="font-display text-lg font-bold text-surface-900 dark:text-white">Reading Experience</h2></div>
          <div className="space-y-2 divide-y divide-surface-100 dark:divide-surface-800">
            <div className="flex items-center justify-between py-3"><span className="text-sm font-medium text-surface-700 dark:text-surface-300">Sound Effects</span><Toggle on={soundEffects} onToggle={() => setSoundEffects(!soundEffects)} /></div>
            <div className="flex items-center justify-between py-3"><span className="text-sm font-medium text-surface-700 dark:text-surface-300">Auto-pronounce on word tap</span><Toggle on={autoPronounce} onToggle={() => setAutoPronounce(!autoPronounce)} /></div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4"><User size={20} className="text-primary-500" /><h2 className="font-display text-lg font-bold text-surface-900 dark:text-white">Account</h2></div>
          <div className="space-y-3">
            <Button variant="secondary" fullWidth leftIcon={<Globe size={16} />}>Change Native Language</Button>
            <Link to="/profile" className="block"><Button variant="secondary" fullWidth leftIcon={<Lock size={16} />}>Change Password</Button></Link>
          </div>
        </Card>

        <Button variant="danger" fullWidth leftIcon={<LogOut size={16} />} onClick={handleLogout}>Sign Out</Button>
      </div>
    </AppLayout>
  );
}
