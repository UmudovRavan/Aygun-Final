import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import StoryCard from '../stories/StoryCard';
import { mockStories } from '../../data/mockData';

export function StoryPreviewSection() {
  const { t } = useTranslation();
  const featured = mockStories.filter((story) => story.isFeatured).slice(0, 3);

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-accent-50/40 to-transparent dark:from-accent-950/15 dark:to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-300 text-sm font-semibold mb-4"
          >
            Featured Stories
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 dark:text-white mb-4"
          >
            Hand-picked stories to{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              inspire you
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-ink-500 dark:text-ink-400"
          >
            Start with these reader favorites, then explore the full library.
          </motion.p>
        </div>

        {/* Story cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featured.map((story, index) => (
            <motion.div
              key={story.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
            >
              <StoryCard story={story} />
            </motion.div>
          ))}
        </div>

        {/* View all */}
        <div className="text-center">
          <Link to="/library">
            <Button variant="primary" size="lg">
              {t('common.viewAll')}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
