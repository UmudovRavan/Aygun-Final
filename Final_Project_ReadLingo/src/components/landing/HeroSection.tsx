import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Sparkles,
  Users,
  Languages,
  Brain,
  Clock,
  ChevronLeft,
  ChevronRight,
  Star,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { LingoMascot } from '../ui/LingoMascot';
import { mockStories } from '../../data/mockData';

const stats = [
  { icon: BookOpen, value: '250+', label: 'Stories' },
  { icon: Users, value: '10K+', label: 'Learners' },
  { icon: Languages, value: '5K+', label: 'Words' },
  { icon: Brain, value: '100+', label: 'Quizzes' },
];

const slides = mockStories.filter((s) => s.isFeatured).slice(0, 3);

const AUTOPLAY_INTERVAL = 5000;

export function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = slides[current];

  return (
    <section
      className="relative pt-28 lg:pt-36 pb-20 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Animated gradient background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-primary-300/30 dark:bg-primary-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute top-20 -right-24 w-[32rem] h-[32rem] bg-accent-300/30 dark:bg-accent-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -40, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-0 left-1/3 w-[26rem] h-[26rem] bg-success-300/25 dark:bg-success-500/15 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Content + Slider */}
          <div className="max-w-xl mx-auto lg:mx-0">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-ink-900/80 border border-ink-200 dark:border-ink-800 shadow-sm mb-6"
            >
              <Sparkles className="w-4 h-4 text-accent-500" />
              <span className="text-sm font-semibold text-ink-600 dark:text-ink-300">
                AI-Powered English Learning Platform
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink-900 dark:text-white leading-[1.1] mb-6"
            >
              Learn English{' '}
              <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                Through Stories
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-ink-500 dark:text-ink-400 leading-relaxed mb-8"
            >
              Read engaging stories, learn new vocabulary, and test your knowledge
              with fun quizzes — all powered by AI.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8"
            >
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" fullWidth className="sm:w-auto">
                  Start Learning Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/library" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" fullWidth className="sm:w-auto">
                  <BookOpen className="w-5 h-5" />
                  Browse Library
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="grid grid-cols-4 gap-3"
            >
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="text-center">
                    <Icon className="w-5 h-5 text-primary-500 dark:text-primary-400 mx-auto mb-1" />
                    <div className="font-display text-xl font-bold text-ink-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-ink-400">{stat.label}</div>
                  </div>
                );
              })}
            </motion.div>
          </div>

          {/* Right: Story Slider + Mascot */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative"
          >
            {/* Lingo mascot as supporting element - top-left floating */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -left-2 z-20"
            >
              <div className="bg-white dark:bg-ink-900 rounded-2xl shadow-xl border border-ink-200 dark:border-ink-800 p-2 flex items-center gap-2">
                <LingoMascot mood="wave" size={44} />
                <div className="pr-2">
                  <p className="font-display text-xs font-bold text-ink-900 dark:text-white">Lingo</p>
                  <p className="text-[10px] text-success-600 dark:text-success-400 font-medium">Your AI Tutor</p>
                </div>
              </div>
            </motion.div>

            {/* Slider */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary-600/10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="relative"
                >
                  {/* Cover image */}
                  <div className="relative h-72 sm:h-80 lg:h-96 overflow-hidden">
                    <img
                      src={slide.coverImage}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />

                    {/* Slide content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-primary-500/90 text-xs font-bold uppercase tracking-wide">
                          {slide.category}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold">
                          {slide.difficulty}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl font-bold mb-2 leading-tight">
                        {slide.title}
                      </h3>
                      <p className="text-sm text-white/80 line-clamp-2 mb-4">
                        {slide.excerpt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-white/70">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {slide.readingTimeMinutes} min
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" /> {slide.wordCount} words
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-warning-400 text-warning-400" /> {slide.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation arrows */}
              <button
                onClick={prev}
                className="absolute top-1/2 left-3 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-ink-900/80 backdrop-blur flex items-center justify-center text-ink-600 dark:text-ink-300 hover:bg-white dark:hover:bg-ink-800 transition-colors shadow-lg z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={next}
                className="absolute top-1/2 right-3 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-ink-900/80 backdrop-blur flex items-center justify-center text-ink-600 dark:text-ink-300 hover:bg-white dark:hover:bg-ink-800 transition-colors shadow-lg z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dots */}
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
