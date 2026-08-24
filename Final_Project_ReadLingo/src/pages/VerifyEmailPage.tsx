import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, ArrowRight, RefreshCw, CheckCircle2, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import { authService } from '../services';

export default function VerifyEmailPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const emailFromState = (location.state as any)?.email;
  const emailFromQuery = searchParams.get('email');
  const email = emailFromState || emailFromQuery || 'your email';

  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [cooldown, setCooldown] = useState(60);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || resending || !email || email === 'your email') return;
    setResending(true);
    setResendStatus('idle');
    try {
      await authService.resendConfirmationEmail(email);
      setResendStatus('success');
      setStatusMessage('Yeni təsdiqləmə linki emailinizə göndərildi!');
      setCooldown(60);
    } catch (err: any) {
      setResendStatus('error');
      setStatusMessage(err?.message || 'Təsdiqləmə linki göndərilərkən xəta baş verdi. Zəhmət olmasa bir az sonra yenidən cəhd edin.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      mascotVariant="happy"
      welcomeMessage="Emailinizi Təsdiqləyin! ✉️"
      subtitle="Qeydiyyatı tamamlamaq üçün son bir addım qaldı"
    >
      <div className="text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-primary-50 dark:bg-primary-500/10 border-2 border-primary-100 dark:border-primary-500/20 flex items-center justify-center mx-auto shadow-inner">
          <Mail size={32} className="text-primary-600 dark:text-primary-400 animate-bounce" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">
            Təsdiqləmə linki göndərildi
          </h2>
          <p className="text-sm text-surface-600 dark:text-surface-300 max-w-sm mx-auto leading-relaxed">
            Biz <span className="font-bold text-primary-600 dark:text-primary-400">{email}</span> ünvanına hesabınızı aktivləşdirmək üçün təsdiqləmə linki göndərdik.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 text-xs text-surface-500 dark:text-surface-400 text-left space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-success-500 shrink-0 mt-0.5" />
            <span>Email qutunuzu (və Spam/Junk qovluğunu) yoxlayın.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 size={16} className="text-success-500 shrink-0 mt-0.5" />
            <span>Gələn məktubdakı təsdiq linkinə klikləyərək hesabınızı aktivləşdirin.</span>
          </div>
        </div>

        {resendStatus === 'success' && (
          <div className="p-3 rounded-xl bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 text-xs text-success-700 dark:text-success-400 font-medium">
            {statusMessage}
          </div>
        )}

        {resendStatus === 'error' && (
          <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 text-xs text-danger-700 dark:text-danger-400 font-medium">
            {statusMessage}
          </div>
        )}

        <div className="pt-2 space-y-3">
          <Link to="/login" className="block w-full">
            <Button variant="gradient" fullWidth size="lg">
              Daxil Olmağa Keç
              <ArrowRight size={18} />
            </Button>
          </Link>

          <button
            type="button"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-surface-500 hover:text-primary-600 dark:text-surface-400 dark:hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-2"
          >
            <RefreshCw size={14} className={resending ? 'animate-spin' : ''} />
            {cooldown > 0 ? `Yenidən göndər (${cooldown}s)` : 'Təsdiqləmə linkini yenidən göndər'}
          </button>
        </div>

        <div className="pt-4 border-t border-surface-200 dark:border-surface-800">
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
          >
            <ArrowLeft size={14} /> Fərqli email ilə qeydiyyatdan keç
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
