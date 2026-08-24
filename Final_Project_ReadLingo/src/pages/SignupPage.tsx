import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle, LanguageSelector } from '../components/layout/AppLayout';
import Logo from '../components/ui/Logo';
import LingoMascot from '../components/ui/LingoMascot';
import Button from '../components/ui/Button';

import { authService } from '../services';

export default function SignupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.register(form.name, form.email, form.password);
      // Redirect to Login page so user logs in cleanly
      navigate('/login', {
        state: {
          registered: true,
          email: form.email,
          message: 'Account created successfully! Please sign in with your credentials.',
        },
      });
    } catch (err: any) {
      setError(err?.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50/60 to-white dark:from-ink-950 dark:to-ink-900 px-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors mb-6">
          <ArrowLeft size={16} /> {t('auth.back')}
        </Link>
        <div className="flex justify-center mb-8">
          <Logo textClassName="text-xl text-surface-900 dark:text-white" />
        </div>
        <div className="card p-8">
          <div className="flex justify-center mb-4"><LingoMascot variant="happy" size={56} /></div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2 text-center">{t('auth.signUp')}</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6 text-center">{t('auth.signUpSub')}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 text-xs text-danger-700 dark:text-danger-400 font-medium">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-300 mb-1.5">{t('auth.fullName')}</label>
              <div className="relative">
                <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="input pl-11" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-300 mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="input pl-11" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-300 mb-1.5">{t('auth.password')}</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="input pl-11" />
              </div>
            </div>
            <Button type="submit" variant="gradient" size="lg" fullWidth disabled={loading}>{loading ? '...' : t('auth.signUp')}</Button>
          </form>
          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">{t('auth.haveAccount')} <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold">{t('nav.signIn')}</Link></p>
        </div>
      </div>
    </div>
  );
}
