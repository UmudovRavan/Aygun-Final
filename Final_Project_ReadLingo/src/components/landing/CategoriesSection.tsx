import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Compass,
  Search,
  Atom,
  Sparkles,
  Scroll,
  TreePine,
  Coffee,
  Globe,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { mockCategories } from '../../data/mockData';

const iconMap: Record<string, LucideIcon> = {
  Compass,
  Search,
  Atom,
  Sparkles,
  Scroll,
  TreePine,
  Coffee,
  Globe,
};

export function CategoriesSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full bg-accent-50 dark:bg-accent-950/40 text-accent-600 dark:text-accent-300 text-sm font-semibold mb-4"
            >
              Explore Genres
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 dark:text-white"
            >
              Find your next favorite{' '}
              <span className="bg-gradient-to-r from-accent-500 to-primary-600 bg-clip-text text-transparent">
                story
              </span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Link
              to="/library"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:gap-3 transition-all"
            >
              View all categories
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {mockCategories.map((category, index) => {
            const Icon = iconMap[category.icon] ?? Compass;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: index * 0.06 }}
              >
                <Link to="/library" className="block group">
                  <Card className="relative overflow-hidden h-full p-0 transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl">
                    {/* Gradient background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90`}
                    />
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/30 blur-xl" />
                      <div className="absolute -bottom-10 -left-6 w-24 h-24 rounded-full bg-black/10 blur-xl" />
                    </div>

                    <div className="relative p-5 sm:p-6 text-white min-h-[140px] flex flex-col justify-between">
                      <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-white/25 backdrop-blur flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-3xl font-display font-extrabold text-white/30 leading-none">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-display text-lg sm:text-xl font-bold mb-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-white/85 font-medium">
                          {category.storyCount} stories
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
