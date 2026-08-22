import { Link } from 'react-router-dom';
import { Clock, BookOpen, Star, Bookmark } from 'lucide-react';
import type { Story } from '../../types';
import Badge from './Badge';

const difficultyColors: Record<string, 'success' | 'warning' | 'danger'> = {
  A1: 'success', A2: 'success', B1: 'warning', B2: 'warning', C1: 'danger', C2: 'danger',
};

export default function StoryCard({ story }: { story: Story }) {
  return (
    <Link to={`/story/${story.id}`} className="group block h-full rounded-2xl overflow-hidden bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative h-44 overflow-hidden">
        <img src={story.coverImage} alt={story.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <Badge color="primary">{story.category}</Badge>
          <Badge color={difficultyColors[story.difficulty]}>{story.difficulty}</Badge>
        </div>
        {story.isBookmarked && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-surface-900/90 flex items-center justify-center">
            <Bookmark size={14} className="text-primary-500 fill-primary-500" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col">
        <h3 className="font-display font-bold text-surface-900 dark:text-white text-sm mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{story.title}</h3>
        <p className="text-xs text-surface-400 mb-3 line-clamp-2">{story.description}</p>
        <div className="mt-auto flex items-center gap-3 text-xs text-surface-400">
          <span className="flex items-center gap-1"><Clock size={12} /> {story.readingTimeMinutes}m</span>
          <span className="flex items-center gap-1"><BookOpen size={12} /> {story.wordCount}</span>
          <span className="flex items-center gap-1"><Star size={12} className="fill-warning-400 text-warning-400" /> {story.rating}</span>
        </div>
      </div>
    </Link>
  );
}
