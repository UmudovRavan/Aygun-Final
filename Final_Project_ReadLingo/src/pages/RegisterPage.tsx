import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import FormInput from '../components/auth/FormInput';
import PasswordInput from '../components/auth/PasswordInput';
import SocialButtons from '../components/auth/SocialButtons';
import AuthDivider from '../components/auth/AuthDivider';
import Button from '../components/ui/Button';
import { authService } from '../services';

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
}

const benefits = ['Free forever plan included', 'No credit card required', 'Access 500+ stories instantly'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!name) e.name = 'Name is required';
    else if (name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Please enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!validate()) return;

    setError('');
    setLoading(true);
    try {
      await authService.register(name, email, password);
      navigate('/login', {
        state: {
          registered: true,
          email,
          message: 'Account created successfully! Please sign in with your credentials.',
        },
      });
    } catch (err: any) {
      setError(err?.message || 'Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      mascotVariant="excited"
      welcomeMessage="Let's start your English journey!"
      subtitle="Create a free account and start reading today"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-danger-50 dark:bg-danger-500/10 border border-danger-200 dark:border-danger-500/20 text-sm text-danger-700 dark:text-danger-400 animate-fade-in">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <FormInput
          label="Full Name"
          type="text"
          icon={User}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, name: true }))}
          touched={touched.name}
          error={errors.name}
          placeholder="Your name"
          autoComplete="name"
        />

        <FormInput
          label="Email"
          type="email"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          touched={touched.email}
          error={errors.email}
          placeholder="you@example.com"
          autoComplete="email"
        />

        <PasswordInput
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          touched={touched.password}
          error={errors.password}
          hint="Must be at least 6 characters"
          placeholder="Create a password"
          autoComplete="new-password"
        />

        <label className="flex items-start gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            required
            className="mt-1 w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500 dark:border-surface-600 dark:bg-surface-800"
          />
          <span className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed">
            I agree to Lingo's{' '}
            <a href="#" className="font-medium text-primary-600 dark:text-primary-400">Terms of Service</a> and{' '}
            <a href="#" className="font-medium text-primary-600 dark:text-primary-400">Privacy Policy</a>
          </span>
        </label>

        <Button type="submit" variant="gradient" fullWidth size="lg" disabled={loading || !agreed}>
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Free Account
              <ArrowRight size={18} />
            </>
          )}
        </Button>
      </form>

      <div className="mt-5 space-y-2">
        {benefits.map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
            <CheckCircle2 size={16} className="text-success-500" />
            {item}
          </div>
        ))}
      </div>

      <AuthDivider />

      <SocialButtons />

      <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
