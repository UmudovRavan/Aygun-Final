import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Layers, Award, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  const location = useLocation();

  const items = [
    { path: '/dashboard', icon: Home, label: t('nav.dashboard') },
    { path: '/library', icon: BookOpen, label: t('nav.library') },
    { path: '/flashcards', icon: Layers, label: t('nav.flashcards') },
    { path: '/quiz', icon: Award, label: t('nav.quiz') },
    { path: '/profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass border-t border-surface-200 dark:border-surface-800">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400 dark:text-surface-500'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
