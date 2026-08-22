import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Sparkles, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LandingNav, LandingFooter } from '../components/landing/LandingNav';
import AppLayout from '../components/layout/AppLayout';
import LingoMascot from '../components/ui/LingoMascot';
import Button from '../components/ui/Button';
import { authService, userService, subscriptionService, paymentService } from '../services';
import type { User as UserType } from '../types';

interface PlanConfig {
  key: 'free' | 'pro' | 'premium';
  numericPrice: number;
  popular?: boolean;
  mascotVariant: 'reading' | 'happy' | 'celebrate';
}

export default function PricingPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isLoggedIn = authService.isAuthenticated();
  const [profile, setProfile] = useState<UserType | null>(null);
  const [submittingPlan, setSubmittingPlan] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProfile = async () => {
    if (!isLoggedIn) return;
    try {
      const p = await userService.getProfile();
      setProfile(p);
    } catch (e) {
      console.error('Failed to load profile:', e);
    }
  };

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const init = async () => {
      const isSuccess = searchParams.get('payment') === 'success';
      const sessionId = searchParams.get('session_id');

      if (isSuccess && sessionId) {
        try {
          await paymentService.verifySession(sessionId);
          setSuccessMessage('🎉 Stripe payment was successful! Your subscription is now active.');
        } catch (e) {
          console.error('Session verification error:', e);
        }
      } else if (searchParams.get('payment') === 'cancelled') {
        alert('Stripe checkout was cancelled.');
      }

      await loadProfile();
      window.dispatchEvent(new Event('profile-updated'));
    };

    init();
  }, [searchParams]);

  const planConfigs: PlanConfig[] = [
    {
      key: 'free',
      numericPrice: 0,
      mascotVariant: 'reading',
    },
    {
      key: 'pro',
      numericPrice: 3.99,
      popular: true,
      mascotVariant: 'happy',
    },
    {
      key: 'premium',
      numericPrice: 6.99,
      mascotVariant: 'celebrate',
    },
  ];

  const handleSelectPlan = async (planKey: 'free' | 'pro' | 'premium', numericPrice: number) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setSubmittingPlan(planKey);
    setSuccessMessage(null);

    // Free plan downgrade
    if (numericPrice === 0) {
      try {
        await subscriptionService.subscribe('FREE', 0);
        await userService.updateProfile({ plan: 'free' });
        const updatedProfile = await userService.getProfile();
        setProfile(updatedProfile);
        window.dispatchEvent(new Event('profile-updated'));
        setSuccessMessage('Successfully switched to Free plan.');
      } catch (e: any) {
        alert(e?.message || 'Failed to update plan. Please try again.');
      } finally {
        setSubmittingPlan(null);
      }
      return;
    }

    // Paid plans (Pro = 2, Premium = 3 according to SubscriptionTier enum)
    const tierNumber = planKey === 'pro' ? 2 : 3;

    try {
      // Direct Stripe Hosted Checkout session redirect
      const session = await paymentService.createCheckoutSession(tierNumber);
      if (session && session.checkoutUrl) {
        window.location.href = session.checkoutUrl;
        return;
      }
      throw new Error('Could not generate Stripe Checkout URL.');
    } catch (err: any) {
      alert(err?.message || 'Failed to initiate Stripe Checkout. Please try again.');
    } finally {
      setSubmittingPlan(null);
    }
  };

  const currentPlanKey = (profile?.plan || 'free').toLowerCase();

  const content = (
    <div className="py-8">
      {/* Top Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-4">
          <Sparkles size={16} /> Choose Your Learning Journey
        </motion.div>
        <h1 className="font-display text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mb-4">
          Flexible Plans for Every Learner
        </h1>
        <p className="text-lg text-surface-500 dark:text-surface-400">
          Upgrade to unlock <span className="font-bold text-primary-600 dark:text-primary-400">unlimited hearts</span>, zero reading limits, and AI-powered learning tools.
        </p>
      </div>

      {/* Alert Banner */}
      {successMessage && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mb-8 p-4 rounded-2xl bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20 text-success-700 dark:text-success-400 text-center font-semibold flex items-center justify-center gap-2">
          <CheckCircle2 size={20} />
          {successMessage}
        </motion.div>
      )}

      {/* Plan Cards */}
      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
        {planConfigs.map((config, i) => {
          const planData = (t(`pricing.${config.key}`, { returnObjects: true }) || {}) as {
            name?: string;
            price?: string;
            period?: string;
            cta?: string;
            features?: string[];
          };
          const isCurrent = currentPlanKey === config.key;
          const isSubmitting = submittingPlan === config.key;
          const features = planData.features || [];

          return (
            <motion.div
              key={config.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                config.popular
                  ? 'bg-gradient-to-b from-primary-600 to-primary-800 text-white shadow-2xl shadow-primary-600/30 lg:-translate-y-4 border-2 border-primary-400'
                  : 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-xl'
              }`}
            >
              {config.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-warning-400 text-warning-950 text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Sparkles size={14} /> {t('common.popular', 'Most Popular')}
                </div>
              )}

              <div>
                <div className="flex justify-center mb-4">
                  <LingoMascot variant={config.mascotVariant} size={80} />
                </div>

                <div className="text-center mb-6">
                  <h3 className={`font-display text-2xl font-bold mb-1 ${config.popular ? 'text-white' : 'text-surface-900 dark:text-white'}`}>
                    {planData.name}
                  </h3>
                </div>

                <div className="text-center mb-8 pb-6 border-b border-surface-200/40 dark:border-surface-700/40">
                  <span className={`font-display text-4xl lg:text-5xl font-extrabold ${config.popular ? 'text-white' : 'text-surface-900 dark:text-white'}`}>
                    {planData.price}
                  </span>
                  <span className={`text-sm ml-1 ${config.popular ? 'text-white/70' : 'text-surface-400'}`}>
                    /{planData.period}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 size={18} className={`shrink-0 mt-0.5 ${config.popular ? 'text-warning-300' : 'text-success-500'}`} />
                      <span className={config.popular ? 'text-white/95' : 'text-surface-600 dark:text-surface-300'}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                {isCurrent ? (
                  <div className="w-full py-3.5 px-4 rounded-xl font-bold text-center bg-success-500/20 text-success-700 dark:text-success-300 border border-success-500/30 flex items-center justify-center gap-2">
                    <Check size={18} /> Active Plan
                  </div>
                ) : (
                  <Button
                    onClick={() => handleSelectPlan(config.key, config.numericPrice)}
                    disabled={isSubmitting}
                    variant={config.popular ? 'secondary' : 'gradient'}
                    fullWidth
                    size="lg"
                    className={config.popular ? 'bg-white text-primary-700 hover:bg-primary-50 shadow-lg' : ''}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Updating...
                      </>
                    ) : (
                      <>
                        {planData.cta || (config.key === 'free' ? 'Downgrade to Free' : `Upgrade to ${planData.name}`)}
                        <ArrowRight size={18} />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {isLoggedIn ? (
        <AppLayout>{content}</AppLayout>
      ) : (
        <>
          <LandingNav />
          <main className="pt-16 lg:pt-20">
            <div className="container-app py-8">{content}</div>
          </main>
          <LandingFooter />
        </>
      )}
    </>
  );
}
