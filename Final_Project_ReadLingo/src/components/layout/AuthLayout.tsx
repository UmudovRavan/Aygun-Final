import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import LingoMascot from '../ui/LingoMascot';
import Logo from '../ui/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageSwitcher } from '../ui/LanguageSwitcher';

interface AuthLayoutProps {
  mascotVariant: 'wave' | 'excited' | 'happy' | 'thinking';
  welcomeMessage: string;
  subtitle: string;
  children: ReactNode;
}

export default function AuthLayout({ mascotVariant, welcomeMessage, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-6">
          <Logo />
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <p className="text-lg text-surface-600 dark:text-surface-300 mb-8">{subtitle}</p>
            {children}
          </div>
        </div>
        <div className="p-6 text-center text-sm text-surface-400">
          <Link to="/" className="hover:text-primary-500 transition-colors">Back to home</Link>
        </div>
      </div>

      {/* Right side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-300 rounded-full blur-3xl" />
        </div>
        <div className="relative flex flex-col items-center justify-center w-full p-12 text-white">
          <LingoMascot mood={mascotVariant} size={200} />
          <h2 className="text-3xl font-display font-bold mt-8 text-center max-w-md">
            {welcomeMessage}
          </h2>
        </div>
      </div>
    </div>
  );
}
