import { Link } from 'react-router-dom';
import { BookMarked } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Story } from '../../types';

const difficultyStyles: Record<string, string> = {
  A1: 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300',
  A2: 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300',
  B1: 'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
  B2: 'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
  C1: 'bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300',
  C2: 'bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300',
  Beginner: 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300',
  Elementary: 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300',
  Intermediate: 'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
  'Upper Intermediate': 'bg-warning-100 text-warning-700 dark:bg-warning-900/40 dark:text-warning-300',
  Advanced: 'bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300',
  Proficient: 'bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-300',
};

interface StoryCardProps {
  story: Story;
  onToggleBookmark?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
}

export default function StoryCard({ story, onToggleBookmark, onToggleFavorite }: StoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Link to={`/story/${story.id}`} className="block group">
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-sm overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:shadow-surface-900/5 group-hover:-translate-y-1">
          {/* Cover Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={story.coverImage}
              alt={story.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute top-3 left-3 flex gap-2">
              <span className={`inline-flex items-center gap-1 font-semibold rounded-full px-2.5 py-0.5 text-xs ${difficultyStyles[story.difficulty] || difficultyStyles.A1}`}>
                {story.difficulty}
              </span>
            </div>
            <div className="absolute top-3 right-3 flex gap-2">
              {onToggleBookmark && (
                <button
                  onClick={(e) => { e.preventDefault(); onToggleBookmark(story.id); }}
                  className="w-8 h-8 rounded-full bg-white/90 dark:bg-surface-900/90 flex items-center justify-center text-surface-600 dark:text-surface-300 hover:text-primary-500 transition-colors"
                >
                  <BookMarked className={`w-4 h-4 ${story.isBookmarked ? 'fill-primary-500 text-primary-500' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-center gap-2 text-xs text-surface-400 mb-2">
              <span className="font-semibold uppercase tracking-wide">{story.category}</span>
              <span>•</span>
              <span>{story.author}</span>
            </div>
            <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {story.title}
            </h3>
            <p className="text-sm text-surface-500 dark:text-surface-400 line-clamp-2">
              {story.description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
