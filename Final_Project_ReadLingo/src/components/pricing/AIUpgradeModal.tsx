import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Crown, Zap, Check, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LingoMascot from '../ui/LingoMascot';
import Button from '../ui/Button';
import { paymentService } from '../../services';

interface Props {
  open: boolean;
  onClose: () => void;
  tier?: string;
}

export default function AIUpgradeModal({ open, onClose, tier = 'Free' }: Props) {
  const navigate = useNavigate();
  const [loadingTier, setLoadingTier] = useState<number | null>(null);

  if (!open) return null;

  const handleCheckout = async (tierNumber: number) => {
    try {
      setLoadingTier(tierNumber);
      const session = await paymentService.createCheckoutSession(tierNumber);
      if (session?.checkoutUrl) {
        window.location.href = session.checkoutUrl;
      }
    } catch (e: any) {
      console.warn('Checkout error, redirecting to pricing:', e);
      onClose();
      navigate('/pricing');
    } finally {
      setLoadingTier(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-surface-900 rounded-3xl border border-surface-200 dark:border-surface-800 shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-surface-400 hover:text-surface-600 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors z-20"
          >
            <X size={20} />
          </button>

          {/* Modal Header */}
          <div className="p-6 sm:p-8 text-center bg-gradient-to-b from-primary-50/70 dark:from-primary-950/30 to-transparent shrink-0">
            <div className="inline-block p-3 rounded-2xl bg-amber-500/10 mb-3">
              <LingoMascot variant="thinking" size={64} />
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white flex items-center justify-center gap-2">
              <span>Gündəlik AI Limiti Bitdi</span>
              <Sparkles size={22} className="text-amber-500 fill-amber-500" />
            </h2>
            <p className="text-sm text-surface-600 dark:text-surface-300 max-w-md mx-auto mt-2">
              Siz bugünkü {tier === 'Free' ? '5 pulsuz' : '50'} AI mesaj limitinizə çatdınız. Lingo AI ilə daha çox söhbət etmək və fərdi hekayələr yaratmaq üçün planınızı yüksəldin!
            </p>
          </div>

          {/* Plan Cards */}
          <div className="px-6 sm:px-8 pb-6 overflow-y-auto grid sm:grid-cols-2 gap-4">
            
            {/* PRO CARD */}
            <div className="p-5 rounded-2xl border border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50 flex flex-col justify-between hover:border-primary-500/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400">
                      <Zap size={18} />
                    </div>
                    <h3 className="font-bold text-base text-surface-900 dark:text-white">Pro Plan</h3>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                    Aylıq
                  </span>
                </div>

                <div className="mb-4">
                  <span className="text-2xl font-display font-extrabold text-surface-900 dark:text-white">$3.99</span>
                  <span className="text-xs text-surface-400"> / ay</span>
                </div>

                <ul className="space-y-2.5 text-xs text-surface-600 dark:text-surface-300 mb-6">
                  <li className="flex items-center gap-2 font-semibold text-primary-600 dark:text-primary-400">
                    <Check size={14} /> 50 Gündəlik AI Mesajı
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-success-500" /> Bütün Hekayələr & Lüğət
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-success-500" /> Limitsiz Can / Ürək
                  </li>
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-success-500" /> Qrammatika İzahları
                  </li>
                </ul>
              </div>

              <Button
                variant="secondary"
                fullWidth
                disabled={loadingTier === 1}
                onClick={() => handleCheckout(1)}
                className="rounded-xl font-bold"
              >
                {loadingTier === 1 ? 'Yüklənir...' : 'Pro-ya Keç ($3.99)'}
              </Button>
            </div>

            {/* PREMIUM CARD */}
            <div className="relative p-5 rounded-2xl border-2 border-primary-500 bg-gradient-to-b from-primary-50/30 dark:from-primary-500/10 to-transparent flex flex-col justify-between shadow-lg shadow-primary-500/10">
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-gradient-primary text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
                Ən Məşhur
              </span>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-500">
                      <Crown size={18} />
                    </div>
                    <h3 className="font-bold text-base text-surface-900 dark:text-white">Premium Plan</h3>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-2xl font-display font-extrabold text-surface-900 dark:text-white">$6.99</span>
                  <span className="text-xs text-surface-400"> / ay</span>
                </div>

                <ul className="space-y-2.5 text-xs text-surface-700 dark:text-surface-200 mb-6">
                  <li className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
                    <Sparkles size={14} /> ♾️ Limitsiz 24/7 AI Təlimçi
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check size={14} className="text-success-500" /> Fərdi Hekayə Generatoru
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check size={14} className="text-success-500" /> Limitsiz Can və Bütün Kitabxana
                  </li>
                  <li className="flex items-center gap-2 font-medium">
                    <Check size={14} className="text-success-500" /> Prioritet Yüksək Sürətli AI
                  </li>
                </ul>
              </div>

              <Button
                variant="gradient"
                fullWidth
                disabled={loadingTier === 2}
                onClick={() => handleCheckout(2)}
                className="rounded-xl font-bold shadow-md hover:shadow-primary-500/20"
              >
                {loadingTier === 2 ? 'Yüklənir...' : 'Premium-a Keç ($6.99)'}
              </Button>
            </div>
          </div>

          {/* Footer link */}
          <div className="p-4 border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 text-center text-xs text-surface-500 flex items-center justify-center gap-2">
            <ShieldCheck size={15} className="text-success-500" />
            <span>Təhlükəsiz Stripe ödənişi • İstənilən vaxt ləğv etmək mümkündür.</span>
            <button
              onClick={() => {
                onClose();
                navigate('/pricing');
              }}
              className="font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5 ml-2"
            >
              Planları Gör <ArrowRight size={12} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
