import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle, LanguageSelector } from '../layout/AppLayout';
import Logo from '../ui/Logo';
import { authService, userService } from '../../services';
import type { User as UserType } from '../../types';

const links = [
  { to: '/', labelKey: 'nav.home' },
  { to: '/library', labelKey: 'nav.library' },
  { to: '/pricing', labelKey: 'nav.pricing' },
  { to: '/blog', labelKey: 'nav.blog' },
  { to: '/faq', labelKey: 'nav.faq' },
  { to: '/contact', labelKey: 'nav.contact' },
];

export function LandingNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const isLoggedIn = authService.isAuthenticated();
  const [userProfile, setUserProfile] = useState<UserType | null>(null);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  useEffect(() => {
    if (isLoggedIn) {
      userService.getProfile().then(setUserProfile).catch(() => {});
    }
  }, [isLoggedIn]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-ink-950/80 backdrop-blur-md border-b border-surface-100 dark:border-ink-800">
      <div className="container-app flex items-center justify-between h-16">
        <Logo to="/" textClassName="text-surface-900 dark:text-white" />
        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium transition-colors ${
                location.pathname === l.to
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-white'
              }`}
            >
              {t(l.labelKey)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <ThemeToggle />

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/profile"
                className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary-500/40 hover:border-primary-500 transition-colors shrink-0"
                title="Profile"
              >
                {userProfile?.avatar ? (
                  <img src={userProfile.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary-600 text-white flex items-center justify-center font-bold text-xs">
                    {userProfile?.name ? userProfile.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
              </Link>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-400 hidden sm:block"
              >
                {t('nav.signIn')}
              </Link>
              <Link
                to="/signup"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {t('nav.signUp')}
              </Link>
            </>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-surface-600 dark:text-surface-300"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="md:hidden border-t border-surface-100 dark:border-ink-800 px-4 py-3 space-y-2 bg-white dark:bg-ink-950">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block py-2 text-sm font-medium text-surface-600 dark:text-surface-300"
            >
              {t(l.labelKey)}
            </Link>
          ))}
          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="block py-2 text-sm font-semibold text-primary-600 dark:text-primary-400"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="block py-2 text-sm font-medium text-surface-600 dark:text-surface-300"
              >
                Profile
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 py-2 text-sm font-medium text-danger-600 dark:text-danger-400"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="block py-2 text-sm font-medium text-primary-600 dark:text-primary-400"
              >
                {t('nav.signIn')}
              </Link>
              <Link
                to="/signup"
                onClick={() => setOpen(false)}
                className="block py-2 text-sm font-semibold text-primary-600 dark:text-primary-400"
              >
                {t('nav.signUp')}
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}

export function LandingFooter() {
  const { t } = useTranslation();
  return (
    <footer className="bg-surface-900 dark:bg-ink-950 text-surface-300">
      <div className="container-app py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Logo to="/" textClassName="text-white" iconSize={18} />
            </div>
            <p className="text-sm text-surface-400 max-w-xs">
              Learn English through stories. Powered by AI. Built for curious minds.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/library" className="hover:text-white">
                  {t('nav.library')}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white">
                  {t('nav.pricing')}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white">
                  {t('nav.blog')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/faq" className="hover:text-white">
                  {t('nav.faq')}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-surface-800 mt-8 pt-6 text-sm text-surface-500">
          © 2025 Read<span className="text-primary-400">Lingo</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
