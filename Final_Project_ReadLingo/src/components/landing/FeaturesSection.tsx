import { motion } from 'framer-motion';
import {
  BookOpen,
  Brain,
  Layers,
  Trophy,
  Mic,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { mockFeatures } from '../../data/mockData';

const iconMap: Record<string, LucideIcon> = {
  BookOpen,
  Brain,
  Layers,
  Trophy,
  Mic,
  TrendingUp,
};

const iconColors: Record<number, string> = {
  0: 'from-primary-500 to-primary-700',
  1: 'from-accent-500 to-accent-700',
  2: 'from-success-500 to-success-700',
  3: 'from-warning-500 to-warning-700',
  4: 'from-primary-400 to-accent-500',
  5: 'from-success-400 to-primary-500',
};

export function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-300 text-sm font-semibold mb-4"
          >
            Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 dark:text-white mb-4"
          >
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              master English
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-ink-500 dark:text-ink-400"
          >
            Powerful tools designed to make learning English engaging, effective, and fun.
          </motion.p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockFeatures.map((feature, index) => {
            const Icon = iconMap[feature.icon] ?? BookOpen;
            const gradient = iconColors[index] ?? 'from-primary-500 to-primary-700';
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card hover className="h-full p-6 group">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-lg mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-ink-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-ink-500 dark:text-ink-400 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <p className="sr-only">{t('common.viewAll')}</p>
      </div>
    </section>
  );
}
