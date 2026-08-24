import { useState, useEffect, useRef } from 'react';
import { Trophy, Star, Edit3, Mail, Calendar, Flame, Zap, BookOpen, Target, Lock, Eye, EyeOff, Camera, Loader2, Trash2, Clock, Globe, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { userService, authService } from '../services';
import { calculateLevelFromXP } from '../utils/levelUtils';
import type { User } from '../types';

const GOAL_OPTIONS = [5, 10, 15, 20, 30, 45, 60];
const LEVEL_OPTIONS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const LANGUAGE_OPTIONS = ['Azerbaijani', 'English', 'Turkish', 'Russian', 'Spanish', 'German'];

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editName, setEditName] = useState(false);
  const [userName, setUserName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' });
  const [pwChanged, setPwChanged] = useState(false);
  const [pwError, setPwError] = useState('');
  const [savingSetting, setSavingSetting] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProfile = async () => {
    try {
      const u = await userService.getProfile();
      setUser(u);
      setUserName(u.userName || u.name);
      setFirstName(u.firstName || '');
      setLastName(u.lastName || '');
    } catch (e) {
      console.warn('Error loading profile:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();

    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const newAvatarUrl = await userService.uploadAvatar(file);
      if (user) {
        setUser({ ...user, avatar: newAvatarUrl || user.avatar });
      }
      window.dispatchEvent(new Event('profile-updated'));
    } catch (err: any) {
      alert(err?.message || 'Failed to upload profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete your profile picture?')) return;
    setUploadingAvatar(true);
    try {
      await userService.deleteAvatar();
      if (user) {
        setUser({ ...user, avatar: '' });
      }
      window.dispatchEvent(new Event('profile-updated'));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete profile picture.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveName = async () => {
    if (!user) return;
    try {
      const updated = await userService.updateProfile({
        userName,
        firstName,
        lastName,
        name: userName || `${firstName} ${lastName}`.trim(),
      });
      setUser(updated);
      window.dispatchEvent(new Event('profile-updated'));
      setEditName(false);
    } catch {
      setEditName(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: any) => {
    if (!user) return;
    setSavingSetting(key);
    try {
      const payload: any = {};
      payload[key] = value;
      const updated = await userService.updateProfile(payload);
      setUser(updated);
      window.dispatchEvent(new Event('profile-updated'));
    } catch (e) {
      console.error('Failed to update profile setting:', e);
    } finally {
      setSavingSetting(null);
    }
  };

  const handlePwSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    setPwChanged(false);

    if (pwForm.new !== pwForm.confirm) {
      setPwError('New passwords do not match');
      return;
    }

    try {
      await authService.changePassword?.(pwForm.current, pwForm.new) || Promise.resolve();
      setPwChanged(true);
      setPwForm({ current: '', new: '', confirm: '' });
      setTimeout(() => setPwChanged(false), 3000);
    } catch (err: any) {
      setPwError(err?.message || 'Failed to change password');
    }
  };

  if (loading || !user) {
    return (
      <AppLayout>
        <div className="container-app py-16 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary-600" size={32} />
        </div>
      </AppLayout>
    );
  }

  const levelInfo = calculateLevelFromXP(user.totalXP);

  return (
    <AppLayout>
      <div className="container-app py-8 max-w-4xl">
        {/* Hidden File Input for Avatar Upload */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleAvatarChange}
          accept="image/*"
          className="hidden"
        />

        {/* Profile Header */}
        <Card className="overflow-hidden mb-6">
          <div className="px-6 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
              <div className="relative group w-24 h-24 rounded-2xl border-4 border-white dark:border-surface-900 bg-surface-100 dark:bg-surface-800 overflow-hidden shadow-lg shrink-0 cursor-pointer" onClick={handleAvatarClick}>
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-surface-400 font-bold text-2xl">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity text-white">
                  {uploadingAvatar ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <>
                      <Camera size={20} />
                      {user.avatar && (
                        <button
                          type="button"
                          onClick={handleDeleteAvatar}
                          title="Remove Photo"
                          className="p-1 rounded-lg bg-danger-600/80 hover:bg-danger-600 text-white transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1">
                {editName ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Username" className="input py-1.5 text-base font-semibold" autoFocus />
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="input py-1.5 text-base" />
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="input py-1.5 text-base" />
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={handleSaveName}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditName(false)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white">
                      {user.userName || user.name}
                    </h1>
                    <button onClick={() => setEditName(true)} className="text-surface-400 hover:text-primary-500" title="Edit Username"><Edit3 size={16} /></button>
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge color="primary">Level {levelInfo.level}</Badge>
                  <Badge color="warning">{levelInfo.rank}</Badge>
                  <Badge color="success">{user.plan.toUpperCase()} Plan</Badge>
                  <span className="text-xs text-surface-400 ml-1">CEFR: <strong className="text-surface-600 dark:text-surface-300">{user.learningLevel || 'A1'}</strong></span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Streak', value: user.currentStreak, suffix: 'days', icon: Flame, color: 'text-warning-500' },
                { label: 'Total XP', value: user.totalXP.toLocaleString(), suffix: 'XP', icon: Zap, color: 'text-primary-500' },
                { label: 'Stories Read', value: user.stats.storiesRead, suffix: '', icon: BookOpen, color: 'text-secondary-500' },
                { label: 'Accuracy', value: `${user.stats.averageAccuracy}%`, suffix: '', icon: Target, color: 'text-success-500' },
              ].map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700/50">
                    <Icon size={18} className={`${stat.color} mx-auto mb-1`} />
                    <p className="font-display font-bold text-lg text-surface-900 dark:text-white">{stat.value}<span className="text-xs text-surface-400 ml-1">{stat.suffix}</span></p>
                    <p className="text-xs text-surface-400">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Level Progress */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={20} className="text-primary-500" />
              <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">Level Progress</h2>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
              Level {levelInfo.level}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-surface-600 dark:text-surface-300 font-medium">Level {levelInfo.level} ({levelInfo.rank})</span>
                <span className="text-surface-900 dark:text-white font-bold">{levelInfo.progressPercent}%</span>
              </div>
              <div className="w-full h-3.5 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelInfo.progressPercent}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-surface-500 dark:text-surface-400 pt-1">
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-primary-500" />
                <span>{user.totalXP.toLocaleString()} XP earned</span>
              </div>
              <div className="flex items-center gap-1">
                <Star size={14} className="text-warning-500 fill-warning-500" />
                <span className="font-semibold text-surface-700 dark:text-surface-300">{levelInfo.xpToNextLevel.toLocaleString()} XP</span> to Level {levelInfo.level + 1}
              </div>
            </div>
          </div>
        </Card>

        {/* Account Info & Preferences */}
        <Card className="p-6 mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">Account Settings & Preferences</h2>
            {savingSetting && <span className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-1"><Loader2 size={13} className="animate-spin" /> Saving changes...</span>}
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Email */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-800">
              <Mail size={18} className="text-primary-500 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-surface-400 font-medium">Email Address</p>
                <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{user.email}</p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-800">
              <Calendar size={18} className="text-secondary-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-surface-400 font-medium">Member Since</p>
                <p className="text-sm font-semibold text-surface-900 dark:text-white">{new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>

            {/* Daily Goal Preference */}
            <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-warning-500" />
                  <p className="text-xs text-surface-400 font-medium">Daily Goal (min/day)</p>
                </div>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{user.dailyGoalMinutes} min</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {GOAL_OPTIONS.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleUpdateSetting('dailyGoalMinutes', mins)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      user.dailyGoalMinutes === mins
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-white dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-600 border border-surface-200 dark:border-surface-600'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Learning Level Preference */}
            <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-danger-500" />
                  <p className="text-xs text-surface-400 font-medium">CEFR Learning Level</p>
                </div>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{user.learningLevel || 'A1'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {LEVEL_OPTIONS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleUpdateSetting('learningLevel', lvl)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      (user.learningLevel || 'A1') === lvl
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-white dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-600 border border-surface-200 dark:border-surface-600'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Native Language Preference */}
            <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-800 sm:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-primary-500" />
                  <p className="text-xs text-surface-400 font-medium">Native Language (Ana Dili)</p>
                </div>
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400">{user.nativeLanguage}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {LANGUAGE_OPTIONS.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleUpdateSetting('nativeLanguage', lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      user.nativeLanguage === lang
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-white dark:bg-surface-700 text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-600 border border-surface-200 dark:border-surface-600'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Change Password */}
        <Card className="p-6 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock size={20} className="text-danger-500" />
            <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">Change Password</h2>
          </div>
          {pwChanged && <div className="mb-4 p-3 rounded-xl bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 text-sm font-medium flex items-center gap-1.5"><CheckCircle2 size={16} /> Password changed successfully!</div>}
          {pwError && <div className="mb-4 p-3 rounded-xl bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400 text-sm">{pwError}</div>}
          <form onSubmit={handlePwSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-300 mb-1.5">Current Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type={showPw ? 'text' : 'password'} required value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} placeholder="••••••••" className="input pl-11 pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-300 mb-1.5">New Password</label>
                <div className="relative"><Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" /><input type={showPw ? 'text' : 'password'} required value={pwForm.new} onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })} placeholder="••••••••" className="input pl-11" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-300 mb-1.5">Confirm New Password</label>
                <div className="relative"><Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" /><input type={showPw ? 'text' : 'password'} required value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} placeholder="••••••••" className="input pl-11" /></div>
              </div>
            </div>
            <Button type="submit" variant="primary" size="md">Change Password</Button>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
