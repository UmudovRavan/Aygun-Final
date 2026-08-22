import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';
import { ThemeToggle, LanguageSelector } from '../components/layout/AppLayout';
import LingoMascot from '../components/ui/LingoMascot';
import { authService, adminService } from '../services';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errParam = searchParams.get('error');
    if (errParam === 'unauthorized') {
      setError('Access Denied. Administrator privileges required to enter this page.');
    } else if (errParam === 'session_expired') {
      setError('Your admin session has expired. Please sign in again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.login(email, password);
      
      // 1. Verify role from login response & JWT claims
      const hasAdminRole = res.roles?.includes('Admin') || authService.isAdmin();
      
      if (!hasAdminRole) {
        await authService.logout();
        setError('Access Denied: This account does not possess Administrator rights.');
        setLoading(false);
        return;
      }

      // 2. Strict backend verification test
      try {
        await adminService.getStats();
      } catch {
        await authService.logout();
        setError('Administrator authentication failed on the server.');
        setLoading(false);
        return;
      }

      sessionStorage.setItem('adminAuth', 'true');
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-surface-100 to-surface-200 dark:from-ink-950 dark:to-ink-900 px-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors mb-6"><ArrowLeft size={16} /> Back to Home</Link>
        <div className="flex items-center justify-center gap-2 mb-8">
          <Logo textClassName="text-xl text-surface-900 dark:text-white" />
          <span className="font-display font-bold text-xl text-surface-900 dark:text-white">Admin</span>
        </div>
        <div className="card p-8">
          <div className="flex justify-center mb-4"><LingoMascot variant="study" size={56} /></div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2 text-center">Admin Login</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6 text-center">Sign in to access the admin dashboard</p>
          {error && <div className="mb-4 p-3 rounded-xl bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-300 mb-1.5">Admin Email</label>
              <div className="relative"><BookOpen size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" /><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@readlingo.com" className="input pl-11" /></div>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 dark:text-surface-300 mb-1.5">Admin Password</label>
              <div className="relative"><Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" /><input type={showPw ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="input pl-11 pr-11" /><button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
            </div>
            <Button type="submit" variant="gradient" size="lg" fullWidth disabled={loading}>{loading ? 'Authenticating...' : 'Sign In to Admin Panel'}</Button>
          </form>
        </div>
      </div>
    </div>
  );
}
