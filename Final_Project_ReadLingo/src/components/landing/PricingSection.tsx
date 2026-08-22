import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Star, Sparkles, Zap, Crown } from 'lucide-react';
import { Button } from '../ui/Button';
import { mockPricingPlans } from '../../data/mockData';

const planIcons: Record<string, typeof Star> = {
  free: Sparkles,
  pro: Zap,
  premium: Crown,
};

export function PricingSection() {
  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary-200/20 dark:bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-accent-200/20 dark:bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-4"
          >
            Pricing
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 dark:text-white mb-4"
          >
            Simple, transparent{' '}
            <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              pricing
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-ink-500 dark:text-ink-400"
          >
            Start for free, upgrade when you are ready. Cancel anytime.
          </motion.p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
          {mockPricingPlans.map((plan, index) => {
            const popular = plan.isPopular;
            const Icon = planIcons[plan.id] ?? Star;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: index * 0.1 }}
                className={`relative flex ${popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
              >
                <div
                  className={`relative w-full rounded-3xl p-8 flex flex-col transition-all duration-300 overflow-hidden ${
                    popular
                      ? 'bg-gradient-to-b from-primary-600 to-primary-800 text-white shadow-2xl shadow-primary-600/30 lg:scale-[1.04] border border-primary-400/50'
                      : 'bg-white dark:bg-ink-900 border-2 border-ink-200 dark:border-ink-800 shadow-sm hover:shadow-xl hover:border-ink-300 dark:hover:border-ink-700'
                  }`}
                >
                  {/* Popular badge */}
                  {popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                      <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-accent-400 to-accent-600 text-white text-sm font-bold shadow-lg shadow-accent-500/40">
                        <Sparkles className="w-3.5 h-3.5" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Decorative glow for popular */}
                  {popular && (
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                  )}

                  {/* Plan icon + name */}
                  <div className="flex items-center gap-3 mb-2 relative">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                      popular
                        ? 'bg-white/20 text-white'
                        : 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className={`font-display text-xl font-bold ${popular ? 'text-white' : 'text-ink-900 dark:text-white'}`}>
                      {plan.name}
                    </h3>
                  </div>
                  <p className={`text-sm mb-6 ${popular ? 'text-white/80' : 'text-ink-400'}`}>
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6 relative">
                    <div className="flex items-end gap-1">
                      <span className={`font-display text-5xl font-extrabold ${popular ? 'text-white' : 'text-ink-900 dark:text-white'}`}>
                        ${plan.price}
                      </span>
                      <span className={`text-sm mb-1.5 ${popular ? 'text-white/70' : 'text-ink-400'}`}>
                        /{plan.period}
                      </span>
                    </div>
                    {plan.price === 0 && (
                      <p className={`text-xs font-semibold mt-1.5 ${popular ? 'text-white/90' : 'text-success-600 dark:text-success-400'}`}>
                        No credit card required
                      </p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className={`h-px mb-6 ${popular ? 'bg-white/20' : 'bg-ink-100 dark:bg-ink-800'}`} />

                  {/* Features */}
                  <ul className="space-y-3.5 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <span
                          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                            popular
                              ? 'bg-white/20 text-white'
                              : 'bg-success-100 text-success-600 dark:bg-success-500/20 dark:text-success-400'
                          }`}
                        >
                          <Check className="w-3 h-3" strokeWidth={3} />
                        </span>
                        <span className={popular ? 'text-white/90' : 'text-ink-600 dark:text-ink-300'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <Link to="/register" className="mt-auto relative">
                    <Button
                      variant={popular ? 'gradient' : 'outline'}
                      size="lg"
                      fullWidth
                      className={popular ? 'shadow-lg bg-white text-primary-700 hover:bg-white/90' : ''}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12"
        >
          {[
            { icon: Check, text: '7-day free trial' },
            { icon: Check, text: 'Cancel anytime' },
            { icon: Check, text: 'Secure payment' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-ink-400">
              <item.icon className="w-4 h-4 text-success-500" />
              {item.text}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
