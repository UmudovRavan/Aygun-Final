import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { mockFAQs } from '../../data/mockData';

export function FAQSection() {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>(mockFAQs[0]?.id ?? null);

  const toggle = (id: string) => setOpenId((current) => (current === id ? null : id));

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-transparent to-accent-50/30 dark:to-accent-950/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-accent-50 dark:bg-accent-950/40 text-accent-600 dark:text-accent-300 text-sm font-semibold mb-4"
          >
            FAQ
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 dark:text-white mb-4"
          >
            Frequently asked{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              questions
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-ink-500 dark:text-ink-400 flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-5 h-5 text-accent-500" />
            Everything you need to know about ReadLingo
          </motion.p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {mockFAQs.map((faq, index) => {
            const isOpen = openId === faq.id;
            return (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
              >
                <Card
                  className={`overflow-hidden transition-colors ${
                    isOpen ? 'border-primary-300 dark:border-primary-800' : ''
                  }`}
                >
                  <button
                    onClick={() => toggle(faq.id)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className="font-display font-bold text-ink-900 dark:text-white text-base sm:text-lg">
                      {faq.question}
                    </span>
                    <span
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isOpen
                          ? 'bg-primary-600 text-white rotate-45'
                          : 'bg-ink-100 dark:bg-ink-800 text-ink-500 dark:text-ink-300'
                      }`}
                    >
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-ink-500 dark:text-ink-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-sm text-ink-400 mt-10">
          Still have questions?{' '}
          <a
            href="/contact"
            className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
          >
            {t('nav.contact')} →
          </a>
        </p>
      </div>
    </section>
  );
}
