import { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle, LanguageSelector } from '../components/layout/AppLayout';
import Logo from '../components/ui/Logo';
import LingoMascot from '../components/ui/LingoMascot';
import Button from '../components/ui/Button';
import { authService } from '../services';

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
