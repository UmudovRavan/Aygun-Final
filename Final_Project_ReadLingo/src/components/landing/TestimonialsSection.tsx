import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card } from '../ui/Card';
import { mockTestimonials } from '../../data/mockData';

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-transparent to-primary-50/40 dark:to-primary-950/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-warning-50 dark:bg-warning-950/40 text-warning-600 dark:text-warning-300 text-sm font-semibold mb-4"
          >
            Testimonials
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 dark:text-white mb-4"
          >
            Loved by{' '}
            <span className="bg-gradient-to-r from-accent-500 to-warning-500 bg-clip-text text-transparent">
              learners worldwide
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-ink-500 dark:text-ink-400"
          >
            Join thousands of students achieving their English goals with ReadLingo.
          </motion.p>
        </div>

        {/* Testimonials grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockTestimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.45, delay: index * 0.1 }}
            >
              <Card hover className="h-full p-6 flex flex-col">
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-primary-200 dark:text-primary-800 mb-3" />

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < testimonial.rating
                          ? 'fill-warning-400 text-warning-400'
                          : 'text-ink-300 dark:text-ink-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-ink-600 dark:text-ink-300 leading-relaxed text-sm flex-1 mb-5">
                  “{testimonial.text}”
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-ink-200 dark:border-ink-800">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-primary-100 dark:ring-primary-900/40"
                    loading="lazy"
                  />
                  <div>
                    <div className="font-display font-bold text-ink-900 dark:text-white text-sm">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-ink-400">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
