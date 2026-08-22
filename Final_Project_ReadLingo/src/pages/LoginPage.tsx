import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle, LanguageSelector } from '../components/layout/AppLayout';
import Logo from '../components/ui/Logo';
import LingoMascot from '../components/ui/LingoMascot';
import Button from '../components/ui/Button';
import { authService } from '../services';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const stateMessage = (location.state as any)?.message;
  const initialEmail = (location.state as any)?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
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
          <div className="flex justify-center mb-4"><LingoMascot variant="wave" size={56} /></div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2 text-center">{t('auth.signIn')}</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6 text-center">{t('auth.signInSub')}</p>
          <button onClick={() => { localStorage.setItem('user', 'google'); navigate('/dashboard'); }} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-200 font-medium hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors mb-4">
            <GoogleIcon /> {t('auth.google')}
          </button>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
            <span className="text-xs text-surface-400">{t('auth.or')}</span>
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {stateMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 text-xs text-success-700 dark:text-success-400 font-medium">
                <CheckCircle2 size={16} className="shrink-0" />
                {stateMessage}
              </div>
            )}
            {error && (
              <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 text-xs text-danger-700 dark:text-danger-400 font-medium">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-300 mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input pl-11" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-surface-600 dark:text-surface-300">{t('auth.password')}</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline">{t('auth.forgot')}</Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input pl-11 pr-11" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <Button type="submit" variant="gradient" size="lg" fullWidth disabled={loading}>{loading ? '...' : t('auth.signIn')}</Button>
          </form>
          <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">{t('auth.noAccount')} <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-semibold">{t('nav.signUp')}</Link></p>
        </div>
        <p className="text-center text-xs text-surface-400 mt-4"><Link to="/admin-login" className="hover:text-surface-600">Admin Login</Link></p>
      </div>
    </div>
  );
}
