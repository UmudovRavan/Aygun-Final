import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/ui/Button';

const CODE_LENGTH = 6;

export default function EmailVerificationPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleChange = (idx: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    setError('');

    if (digit && idx < CODE_LENGTH - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH);
    if (pasted) {
      const next = Array(CODE_LENGTH).fill('');
      pasted.split('').forEach((d, i) => { next[i] = d; });
      setCode(next);
      inputsRef.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < CODE_LENGTH) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);

    if (fullCode === '000000') {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      setError('Invalid verification code. Try 000000 for demo.');
      setCode(Array(CODE_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    }
  };

  const handleResend = () => {
    if (resendTimer > 0) return;
    setResendTimer(30);
    setCode(Array(CODE_LENGTH).fill(''));
    setError('');
    inputsRef.current[0]?.focus();
  };

  if (success) {
    return (
      <AuthLayout
        mascotVariant="excited"
        welcomeMessage="Email verified!"
        subtitle="Welcome to Lingo — let's start learning"
      >
        <div className="text-center py-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success-50 dark:bg-success-500/10 mb-4 animate-scale-in">
            <CheckCircle2 size={32} className="text-success-500" />
          </div>
          <p className="text-surface-600 dark:text-surface-300 mb-2">
            Your email has been verified successfully!
          </p>
          <p className="text-sm text-surface-400 dark:text-surface-500 mb-6">
            Redirecting you to your dashboard...
          </p>
          <div className="flex justify-center">
            <Loader2 size={24} className="animate-spin text-primary-500" />
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      mascotVariant="happy"
      welcomeMessage="Almost there! Verify your email to begin learning."
      subtitle="We've sent a 6-digit code to your email address"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 text-sm text-danger-700 dark:text-danger-400 animate-fade-in">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        {/* Code inputs */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
            Verification Code
          </label>
          <div className="flex gap-2 sm:gap-3 justify-between" onPaste={handlePaste}>
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { inputsRef.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            ))}
          </div>
          <p className="text-xs text-surface-400 dark:text-surface-500 mt-2 text-center">
            Demo code: <span className="font-mono font-semibold text-primary-500">000000</span>
          </p>
        </div>

        <Button type="submit" variant="gradient" fullWidth size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              Verify Email
              <ArrowRight size={18} />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <p className="text-sm text-surface-500 dark:text-surface-400">
          Didn't receive the code?{' '}
          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors disabled:text-surface-400 disabled:cursor-not-allowed"
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend code'}
          </button>
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}
