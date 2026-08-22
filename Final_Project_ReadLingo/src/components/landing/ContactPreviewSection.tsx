import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { LingoMascot } from '../ui/LingoMascot';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'support@readlingo.az' },
  { icon: Phone, label: 'Phone', value: '+994 (12) 404-12-34' },
  { icon: MapPin, label: 'Location', value: 'Bakı, Azərbaycan' },
];

export function ContactPreviewSection() {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: mascot + info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-6 mb-8">
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full bg-gradient-to-br from-primary-200/50 to-accent-200/50 dark:from-primary-500/15 dark:to-accent-500/15 blur-xl" />
                </div>
                <LingoMascot mood="encourage" size={160} className="relative" />
              </div>
              <div className="sm:text-left text-center">
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-ink-900 dark:text-white mb-3">
                  Get in{' '}
                  <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
                    touch
                  </span>
                </h2>
                <p className="text-ink-500 dark:text-ink-400 leading-relaxed max-w-md">
                  Have a question or feedback? We would love to hear from you. Send us a message and
                  our team will get back to you soon.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              {contactInfo.map((info, i) => {
                const Icon = info.icon;
                return (
                  <motion.div
                    key={info.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                  >
                    <Card className="p-4 text-center sm:text-left h-full">
                      <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-0">
                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 flex items-center justify-center sm:mb-2">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs text-ink-400 font-medium uppercase tracking-wide">
                            {info.label}
                          </div>
                          <div className="text-sm font-semibold text-ink-900 dark:text-white">
                            {info.value}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6 sm:p-8 shadow-xl">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
                    className="w-16 h-16 rounded-full bg-success-100 dark:bg-success-900/40 text-success-600 dark:text-success-400 flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle2 className="w-8 h-8" />
                  </motion.div>
                  <h3 className="font-display text-xl font-bold text-ink-900 dark:text-white mb-2">
                    Message sent!
                  </h3>
                  <p className="text-ink-500 dark:text-ink-400 mb-6">
                    Thanks for reaching out. We will reply to you shortly.
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>
                    Send another message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="w-5 h-5 text-primary-500" />
                    <h3 className="font-display text-lg font-bold text-ink-900 dark:text-white">
                      Send us a message
                    </h3>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Name" htmlFor="contact-name">
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="Jane Doe"
                        className="form-input"
                      />
                    </Field>
                    <Field label="Email" htmlFor="contact-email">
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="jane@example.com"
                        className="form-input"
                      />
                    </Field>
                  </div>

                  <Field label="Message" htmlFor="contact-message">
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      placeholder="Tell us how we can help…"
                      className="form-input resize-none"
                    />
                  </Field>

                  <Button type="submit" variant="primary" size="lg" fullWidth>
                    <Send className="w-4 h-4" />
                    Send Message
                  </Button>

                  <p className="text-xs text-ink-400 text-center">
                    By submitting, you agree to our friendly privacy policy. We never spam.
                  </p>
                </form>
              )}
            </Card>

            <p className="text-center text-sm text-ink-400 mt-4">
              Prefer a dedicated page?{' '}
              <Link
                to="/contact"
                className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
              >
                {t('nav.contact')} →
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      <style>{`
        .form-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border-radius: 0.75rem;
          border: 1px solid;
          border-color: #d4d8e2;
          background: #ffffff;
          color: #2c303d;
          font-size: 0.875rem;
          transition: all 0.2s;
          outline: none;
        }
        .form-input:focus {
          border-color: #1c7ef5;
          box-shadow: 0 0 0 3px rgba(28, 126, 245, 0.15);
        }
        .form-input::placeholder { color: #aab1c3; }
        .dark .form-input {
          background: #1d2029;
          border-color: #323747;
          color: #ffffff;
        }
        .dark .form-input::placeholder { color: #5d6783; }
      `}</style>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-semibold text-ink-700 dark:text-ink-300 mb-1.5"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
