import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

interface Props {
  to?: string;
  className?: string;
  textClassName?: string;
  iconSize?: number;
  showText?: boolean;
}

export default function Logo({ to = '/', className = '', textClassName = '', iconSize = 20, showText = true }: Props) {
  return (
    <Link to={to} className={`flex items-center gap-2 ${className}`}>
      <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shrink-0">
        <BookOpen size={iconSize} className="text-white" />
      </div>
      {showText && (
        <span className={`font-display font-bold text-lg ${textClassName}`}>
          Read<span className="text-primary-600 dark:text-primary-400">Lingo</span>
        </span>
      )}
    </Link>
  );
}
