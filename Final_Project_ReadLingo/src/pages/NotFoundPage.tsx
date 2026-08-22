import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import LingoMascot from '../components/ui/LingoMascot';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 dark:bg-ink-950 text-center px-4">
      <div className="flex justify-center mb-6"><LingoMascot variant="sad" size={80} /></div>
      <h1 className="font-display text-6xl font-bold text-surface-900 dark:text-white mb-2">404</h1>
      <h2 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">Page not found</h2>
      <p className="text-surface-500 dark:text-surface-400 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"><Home size={18} /> Back Home</Link>
    </div>
  );
}
