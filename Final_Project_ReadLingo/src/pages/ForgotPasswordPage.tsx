import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle, LanguageSelector } from '../components/layout/AppLayout';
import Logo from '../components/ui/Logo';
import LingoMascot from '../components/ui/LingoMascot';
import Button from '../components/ui/Button';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50/60 to-white dark:from-ink-950 dark:to-ink-900 px-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors mb-6">
          <ArrowLeft size={16} /> {t('forgot.back')}
        </Link>
        <div className="flex justify-center mb-8">
          <Logo textClassName="text-xl text-surface-900 dark:text-white" />
        </div>
        <div className="card p-8">
          <div className="flex justify-center mb-4"><LingoMascot variant={sent ? 'celebrate' : 'thinking'} size={56} /></div>
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-success-50 dark:bg-success-500/10 flex items-center justify-center mx-auto mb-4"><CheckCircle2 size={32} className="text-success-500" /></div>
              <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">{t('forgot.sent')}</h1>
              <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">{t('forgot.subtitle')}</p>
              <Link to="/login"><Button variant="gradient" size="lg" fullWidth>{t('forgot.back')}</Button></Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2 text-center">{t('forgot.title')}</h1>
              <p className="text-sm text-surface-500 dark:text-surface-400 mb-6 text-center">{t('forgot.subtitle')}</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-600 dark:text-surface-300 mb-1.5">{t('auth.email')}</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="input pl-11" />
                  </div>
                </div>
                <Button type="submit" variant="gradient" size="lg" fullWidth disabled={loading}>{loading ? '...' : t('forgot.send')}</Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
