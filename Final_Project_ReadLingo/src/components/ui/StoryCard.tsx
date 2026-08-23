import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import type { Story } from '../../types';
import Badge from './Badge';

const difficultyColors: Record<string, 'success' | 'warning' | 'danger'> = {
  A1: 'success', A2: 'success', B1: 'warning', B2: 'warning', C1: 'danger', C2: 'danger',
  Beginner: 'success', Elementary: 'success', Intermediate: 'warning', 'Upper Intermediate': 'warning', Advanced: 'danger', Proficient: 'danger',
};

const getDifficultyColor = (diff?: string): 'success' | 'warning' | 'danger' => {
  if (!diff) return 'success';
  if (difficultyColors[diff]) return difficultyColors[diff];
  const d = diff.toLowerCase();
  if (d.includes('beg') || d.includes('elem') || d === 'a1' || d === 'a2') return 'success';
  if (d.includes('inter') || d === 'b1' || d === 'b2') return 'warning';
  return 'danger';
};

export default function StoryCard({ story }: { story: Story }) {
  return (
    <Link to={`/story/${story.id}`} className="group block h-full rounded-2xl overflow-hidden bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative h-44 overflow-hidden">
        <img src={story.coverImage} alt={story.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <Badge color="primary">{story.category}</Badge>
          <Badge color={getDifficultyColor(story.difficulty)}>{story.difficulty}</Badge>
        </div>
        {story.isBookmarked && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-surface-900/90 flex items-center justify-center">
            <Bookmark size={14} className="text-primary-500 fill-primary-500" />
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col">
        <h3 className="font-display font-bold text-surface-900 dark:text-white text-sm mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{story.title}</h3>
        <p className="text-xs text-surface-400 line-clamp-2">{story.description}</p>
      </div>
    </Link>
  );
}
