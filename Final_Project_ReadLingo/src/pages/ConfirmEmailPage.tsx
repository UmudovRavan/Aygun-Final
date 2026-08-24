import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';
import { authService } from '../services';

export default function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId') || '';
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let mounted = true;
    const confirm = async () => {
      if (!userId || !token) {
        if (mounted) {
          setLoading(false);
          setSuccess(false);
          setErrorMessage('Təsdiqləmə parametri (userId və ya token) tapılmadı.');
        }
        return;
      }

      try {
        await authService.confirmEmail(userId, token);
        if (mounted) {
          setSuccess(true);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setSuccess(false);
          setErrorMessage(err?.message || 'Təsdiqləmə linkinin vaxtı bitib və ya artıq istifadə olunub.');
          setLoading(false);
        }
      }
    };

    confirm();

    return () => {
      mounted = false;
    };
  }, [userId, token]);

  return (
    <AuthLayout
      mascotVariant={success ? 'excited' : 'thinking'}
      welcomeMessage={success ? 'Təbriklər! 🎉' : 'Email Təsdiqlənməsi'}
      subtitle={success ? 'Hesabınız uğurla aktivləşdirildi' : 'Məlumatlar yoxlanılır...'}
    >
      <div className="text-center space-y-6">
        {loading ? (
          <div className="py-8 space-y-4">
            <Loader2 size={40} className="text-primary-600 animate-spin mx-auto" />
            <p className="text-sm font-medium text-surface-600 dark:text-surface-300">
              Emailiniz təsdiqlənir, zəhmət olmasa gözləyin...
            </p>
          </div>
        ) : success ? (
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-success-50 dark:bg-success-500/10 border-2 border-success-200 dark:border-success-500/20 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 size={36} className="text-success-500" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-surface-900 dark:text-white">
                Email Uğurla Təsdiqləndi! ✨
              </h2>
              <p className="text-sm text-surface-600 dark:text-surface-300 max-w-sm mx-auto leading-relaxed">
                Hesabınız hazırdır. İndi daxil olaraq hekayələri oxumağa və ingilis dilini fərdiləşdirilmiş şəkildə öyrənməyə başlaya bilərsiniz!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-950/40 dark:to-indigo-950/40 border border-primary-100 dark:border-primary-900/40 text-xs text-primary-700 dark:text-primary-300 flex items-center gap-2 justify-center">
              <Sparkles size={16} />
              <span>500+ hekayə və AI köməkçiniz sizi gözləyir</span>
            </div>

            <Link to="/login" className="block w-full">
              <Button variant="gradient" fullWidth size="lg">
                Daxil Ol və Başla
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-danger-50 dark:bg-danger-500/10 border-2 border-danger-200 dark:border-danger-500/20 flex items-center justify-center mx-auto">
              <XCircle size={36} className="text-danger-500" />
            </div>

            <div className="space-y-2">
              <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">
                Təsdiqləmə Uğursuz Oldu
              </h2>
              <p className="text-sm text-surface-500 dark:text-surface-400 max-w-sm mx-auto leading-relaxed">
                {errorMessage}
              </p>
            </div>

            <div className="space-y-3">
              <Link to="/verify-email" className="block w-full">
                <Button variant="gradient" fullWidth size="lg">
                  Yeni Link Göndər
                </Button>
              </Link>
              <Link to="/login" className="block w-full">
                <Button variant="secondary" fullWidth size="lg">
                  Daxil Olma Səhifəsinə Qayıt
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}
