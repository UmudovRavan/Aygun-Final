import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Lock, CheckCircle2, ShieldCheck, Sparkles, Loader2, Zap } from 'lucide-react';
import LingoMascot from '../ui/LingoMascot';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: number;
  onSuccess: () => Promise<void>;
}

export default function StripeCheckoutModal({
  isOpen,
  onClose,
  planName,
  price,
  onSuccess,
}: StripeCheckoutModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFillDemoCard = () => {
    setCardNumber('4242 •••• •••• 4242');
    setExpiry('12/28');
    setCvc('123');
    setName('ReadLingo Learner');
    setError(null);
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !expiry || !cvc) {
      setError('Please fill in the card details or click Auto-Fill Demo Card.');
      return;
    }

    setError(null);
    setIsProcessing(true);

    try {
      // Simulate Stripe 3D Secure / Processing delay
      await new Promise((resolve) => setTimeout(resolve, 1600));

      // Call actual backend upgrade
      await onSuccess();

      setIsProcessing(false);
      setIsSuccess(true);

      // Close modal after showing success animation
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setIsProcessing(false);
      setError(err?.message || 'Payment processing failed. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-surface-200 dark:border-surface-800 overflow-hidden"
        >
          {/* Top Brand Banner */}
          <div className="bg-[#635BFF] text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="bg-white/20 p-1.5 rounded-lg flex items-center justify-center font-black tracking-wider text-sm">
                stripe
              </div>
              <span className="text-xs font-medium tracking-wide text-white/90 flex items-center gap-1">
                <Lock size={12} /> Demo Checkout Simulator
              </span>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center space-y-4"
            >
              <div className="w-16 h-16 bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="font-display text-2xl font-bold text-surface-900 dark:text-white">
                Payment Successful!
              </h3>
              <p className="text-sm text-surface-600 dark:text-surface-300">
                You have officially upgraded to <span className="font-bold text-primary-600">{planName} Plan</span>. All features are now unlocked!
              </p>
              <div className="flex justify-center pt-2">
                <LingoMascot variant="celebrate" size={90} />
              </div>
            </motion.div>
          ) : (
            <div className="p-6 sm:p-8 space-y-6">
              {/* Plan Summary Card */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700/60">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-surface-900 dark:text-white text-base">
                      ReadLingo {planName}
                    </h4>
                    <p className="text-xs text-surface-500 dark:text-surface-400">
                      Billed monthly • Cancel anytime
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl font-extrabold text-surface-900 dark:text-white">
                    ${price.toFixed(2)}
                  </span>
                  <span className="text-xs text-surface-500 block">/month</span>
                </div>
              </div>

              {/* Auto-fill Quick Action */}
              <div className="flex items-center justify-between bg-primary-50 dark:bg-primary-950/40 p-3 rounded-xl border border-primary-200 dark:border-primary-800/40">
                <div className="flex items-center gap-2 text-xs font-medium text-primary-800 dark:text-primary-300">
                  <Zap size={15} className="text-primary-600 fill-primary-600" />
                  <span>Testing without real card?</span>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoCard}
                  className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-colors shadow-sm"
                >
                  Auto-Fill Demo Card
                </button>
              </div>

              {/* Card Form */}
              <form onSubmit={handlePay} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-xs text-danger-700 dark:text-danger-300">
                    {error}
                  </div>
                )}

                {/* Card Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-surface-700 dark:text-surface-300 flex items-center justify-between">
                    <span>Card Information</span>
                    <span className="text-[10px] text-surface-400 uppercase font-mono">VISA / MASTERCARD / AMEX</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      disabled={isProcessing}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white outline-none focus:border-[#635BFF] transition-colors font-mono"
                    />
                    <CreditCard
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
                    />
                  </div>
                </div>

                {/* Expiry & CVC */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                      Expiration Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM / YY"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white outline-none focus:border-[#635BFF] transition-colors font-mono text-center"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                      CVC / CVV
                    </label>
                    <input
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      disabled={isProcessing}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white outline-none focus:border-[#635BFF] transition-colors font-mono text-center"
                    />
                  </div>
                </div>

                {/* Cardholder Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-surface-700 dark:text-surface-300">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isProcessing}
                    className="w-full px-3 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm text-surface-900 dark:text-white outline-none focus:border-[#635BFF] transition-colors"
                  />
                </div>

                {/* Pay Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-xl bg-[#635BFF] hover:bg-[#534be0] disabled:opacity-50 text-white font-bold text-sm transition-colors shadow-lg shadow-[#635BFF]/25 flex items-center justify-center gap-2 mt-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Processing with Stripe...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Pay ${price.toFixed(2)} & Subscribe</span>
                    </>
                  )}
                </button>
              </form>

              {/* Security Footer Note */}
              <div className="flex items-center justify-center gap-2 text-[11px] text-surface-400">
                <ShieldCheck size={14} className="text-success-500" />
                <span>Encrypted 256-bit SSL transaction simulated safely for demo testing.</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
