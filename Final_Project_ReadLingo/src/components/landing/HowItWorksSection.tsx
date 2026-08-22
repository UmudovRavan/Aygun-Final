import { motion } from 'framer-motion';
import {
  BookOpen,
  BookMarked,
  Brain,
  LineChart,
  type LucideIcon,
} from 'lucide-react';

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const steps: Step[] = [
  {
    number: '01',
    icon: BookOpen,
    title: 'Choose a Story',
    description: 'Browse hundreds of stories across genres and pick one that matches your level and interests.',
    color: 'from-primary-500 to-primary-700',
  },
  {
    number: '02',
    icon: BookMarked,
    title: 'Read & Learn',
    description: 'Read at your own pace. Tap any word for instant definitions, translations, and pronunciation.',
    color: 'from-accent-500 to-accent-700',
  },
  {
    number: '03',
    icon: Brain,
    title: 'Practice with Quizzes',
    description: 'Reinforce what you learned with fun quizzes, flashcards, and gamified challenges.',
    color: 'from-success-500 to-success-700',
  },
  {
    number: '04',
    icon: LineChart,
    title: 'Track Progress',
    description: 'Watch your skills grow with detailed stats, streaks, and achievement badges.',
    color: 'from-warning-500 to-warning-700',
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-success-50 dark:bg-success-950/40 text-success-600 dark:text-success-300 text-sm font-semibold mb-4"
          >
            How It Works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 dark:text-white mb-4"
          >
            Learn in{' '}
            <span className="bg-gradient-to-r from-success-500 to-primary-600 bg-clip-text text-transparent">
              four simple steps
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-ink-500 dark:text-ink-400"
          >
            A clear path from your first story to confident English.
          </motion.p>
        </div>

        {/* Steps with connecting line */}
        <div className="relative">
          {/* Horizontal connecting line (desktop) */}
          <div className="hidden lg:block absolute top-24 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-300 via-accent-300 to-warning-300 dark:from-primary-800 dark:via-accent-800 dark:to-warning-800" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.45, delay: index * 0.12 }}
                  className="relative text-center"
                >
                  {/* Icon circle */}
                  <div className="relative inline-flex mb-6">
                    <div className="relative z-10 w-20 h-20 rounded-full bg-white dark:bg-ink-900 border-2 border-ink-200 dark:border-ink-800 shadow-lg flex items-center justify-center">
                      <div
                        className={`w-14 h-14 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-md`}
                      >
                        <Icon className="w-7 h-7" />
                      </div>
                    </div>
                    {/* Number badge */}
                    <span className="absolute -top-2 -right-2 z-20 w-8 h-8 rounded-full bg-ink-900 dark:bg-white text-white dark:text-ink-900 text-xs font-display font-bold flex items-center justify-center shadow-md">
                      {index + 1}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-ink-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-ink-500 dark:text-ink-400 leading-relaxed text-sm">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
