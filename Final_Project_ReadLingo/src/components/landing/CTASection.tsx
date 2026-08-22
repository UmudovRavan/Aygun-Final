import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { LingoMascot } from '../ui/LingoMascot';

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 px-6 py-16 sm:px-12 lg:py-20 shadow-2xl shadow-primary-600/30"
        >
          {/* Decorative blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-20 -left-16 w-72 h-72 bg-accent-400/30 rounded-full blur-3xl"
            />
            <motion.div
              animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -bottom-24 -right-16 w-80 h-80 bg-success-400/20 rounded-full blur-3xl"
            />
          </div>

          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left: text */}
            <div className="text-center lg:text-left flex-1 max-w-2xl">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur text-white text-sm font-semibold mb-5"
              >
                <Sparkles className="w-4 h-4" />
                Free to start · No credit card
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4"
              >
                Ready to Start Learning?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-lg text-primary-100 leading-relaxed mb-8"
              >
                Join thousands of learners improving their English every day with stories, quizzes,
                and an AI tutor that is always by your side.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
              >
                <Link to="/register" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    className="sm:w-auto bg-white !text-primary-700 hover:bg-primary-50"
                  >
                    {t('nav.register')}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/library" className="w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size="lg"
                    fullWidth
                    className="sm:w-auto !text-white hover:!bg-white/10"
                  >
                    {t('landing.heroSecondary')}
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right: celebrating mascot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex-shrink-0 relative"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 rounded-full bg-white/15 backdrop-blur" />
              </div>
              <LingoMascot mood="celebrate" size={220} className="relative drop-shadow-2xl" />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
