import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, BookMarked, Award, Heart, Moon, Sun, LogOut, Menu, X, Globe, Trophy, Crown, Sparkles, Bot } from 'lucide-react';
import Logo from '../ui/Logo';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { userService, authService } from '../../services';
import type { User as UserType } from '../../types';

const navItems = [
  { to: '/dashboard', labelKey: 'nav.dashboard', icon: LayoutDashboard },
  { to: '/library', labelKey: 'nav.library', icon: BookOpen },
  { to: '/lingo-ai', labelKey: 'LingoAI', icon: Bot },
  { to: '/vocabulary', labelKey: 'nav.vocabulary', icon: BookMarked },
  { to: '/leaderboard', labelKey: 'Leaderboard', icon: Trophy },
  { to: '/pricing', labelKey: 'Pricing', icon: Sparkles },
  { to: '/progress', labelKey: 'nav.progress', icon: Award },
];

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle} className="p-2 rounded-lg text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" aria-label="Toggle theme">
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

export function LanguageSelector() {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = languages.find((l) => l.code === lang) || languages[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
        <Globe size={18} />
        <span className="text-sm font-medium hidden sm:block">{current.flag}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-card py-1 z-50">
          {languages.map((l) => (
            <button key={l.code} onClick={() => { setLang(l.code as 'en' | 'az' | 'ru'); setOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${lang === l.code ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium' : 'text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700'}`}>
              <span className="text-lg">{l.flag}</span>{l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface Props { children: React.ReactNode; }

export default function AppLayout({ children }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserType | null>(null);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await userService.getProfile();
        setUserProfile(u);
      } catch (e) {
        console.warn('AppLayout profile fetch error:', e);
      }
    };
    fetchUser();

    const handleProfileUpdate = () => fetchUser();
    window.addEventListener('profile-updated', handleProfileUpdate);
    return () => window.removeEventListener('profile-updated', handleProfileUpdate);
  }, []);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-ink-950">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md border-b border-surface-100 dark:border-surface-800">
        <div className="container-app flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Logo to="/" textClassName="text-surface-900 dark:text-white hidden sm:block" />
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold'
                        : item.to === '/lingo-ai'
                        ? 'text-primary-600 dark:text-primary-400 font-semibold hover:bg-primary-50/60 dark:hover:bg-primary-500/10'
                        : 'text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white hover:bg-surface-100 dark:hover:bg-surface-800'
                    }`}
                  >
                    <Icon size={16} />
                    {item.labelKey === 'LingoAI' ? 'LingoAI' : t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            {userProfile?.plan && userProfile.plan !== 'free' ? (
              <div
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold shadow-sm"
                title={`Cari Plan: ${userProfile.plan.toUpperCase()}`}
              >
                <Crown size={13} className="fill-amber-200 text-amber-200" />
                <span>{userProfile.plan.toUpperCase()}</span>
              </div>
            ) : (
              <Link
                to="/pricing"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow-amber-500/20 active:scale-95"
                title="Planı Yüksəlt"
              >
                <Crown size={13} className="fill-amber-200 text-amber-200" />
                <span>PRO-YA KEÇ</span>
              </Link>
            )}

            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-danger-50 dark:bg-danger-500/10 border border-danger-100 dark:border-danger-500/20">
              <Heart size={15} className="text-danger-500 fill-danger-500" />
              <span className="text-xs font-bold text-danger-600 dark:text-danger-400">
                {userProfile?.plan && userProfile.plan !== 'free' ? '♾️' : (userProfile?.hearts ?? 5)}
              </span>
            </div>

            <LanguageSelector />
            <ThemeToggle />

            <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary-500/30 hover:border-primary-500 transition-colors shrink-0" title="Profile">
              {userProfile?.avatar ? (
                <img src={userProfile.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs">
                  {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </Link>
            <button onClick={handleLogout} className="p-2 rounded-lg text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors" aria-label="Sign out" title="Sign out">
              <LogOut size={18} />
            </button>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg text-surface-500 dark:text-surface-400">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="md:hidden border-t border-surface-100 dark:border-surface-800 px-4 py-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.to);
              return (
                <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${active ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold' : item.to === '/lingo-ai' ? 'text-primary-600 dark:text-primary-400 font-semibold' : 'text-surface-600 dark:text-surface-300'}`}>
                  <Icon size={18} /> {item.labelKey === 'LingoAI' ? 'LingoAI' : t(item.labelKey)}
                </Link>
              );
            })}
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
            >
              <LogOut size={18} /> Sign Out
            </button>
          </nav>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
}
