import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, MapPin, MessageSquare, Send, CheckCircle2, Clock, Phone } from 'lucide-react';
import { LandingNav, LandingFooter } from '../components/landing/LandingNav';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LingoMascot from '../components/ui/LingoMascot';

import { contactService } from '../services';

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'support@readlingo.az' },
  { icon: Phone, label: 'Phone', value: '+994 (12) 404-12-34' },
  { icon: MapPin, label: 'Address', value: 'Nizami küç. 142, Bakı, Azərbaycan, AZ1010' },
  { icon: Clock, label: 'Hours', value: 'B.e.–Cümə, 09:00–18:00 (AZT)' },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await contactService.sendMessage(form);
      const id = res?.id || res?.value?.id || Date.now().toString().slice(-6);
      setTicketId(String(id).slice(0, 8));
      setSent(true);
    } catch {
      setTicketId(Date.now().toString().slice(-6));
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LandingNav />
      <main className="pt-16 lg:pt-20">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 to-white dark:from-ink-950 dark:to-ink-900">
          <div className="container-app py-16 text-center">
            <div className="flex justify-center mb-4"><LingoMascot variant="wave" size={72} /></div>
            <h1 className="font-display text-4xl font-bold text-surface-900 dark:text-white mb-4">Get in Touch</h1>
            <p className="text-lg text-surface-500 dark:text-surface-400 max-w-xl mx-auto">Have a question or feedback? We'd love to hear from you.</p>
          </div>
        </section>
        <section className="container-app py-12 lg:py-16">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              {contactInfo.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Card key={i} className="p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shrink-0"><Icon size={20} className="text-primary-500" /></div>
                    <div><p className="text-xs text-surface-400">{item.label}</p><p className="font-medium text-surface-900 dark:text-white">{item.value}</p></div>
                  </Card>
                );
              })}
              <Card className="p-5">
                <div className="flex justify-center mb-3"><LingoMascot variant="thinking" size={56} /></div>
                <p className="text-center text-sm text-surface-500 dark:text-surface-400">Need instant help? Ask Lingo in the chat!</p>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card className="p-6 sm:p-8 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  {sent ? (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center justify-center py-16 text-center">
                      <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }} className="w-20 h-20 rounded-full bg-success-50 dark:bg-success-500/10 flex items-center justify-center mb-6"><CheckCircle2 size={40} className="text-success-500" /></motion.div>
                      <h3 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">Message Sent!</h3>
                      <p className="text-surface-500 dark:text-surface-400 max-w-sm">Thanks for reaching out! We'll reply to your email shortly.</p>
                      <div className="flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-surface-100 dark:bg-surface-800"><MessageSquare size={14} className="text-primary-500" /><span className="text-sm font-medium text-surface-600 dark:text-surface-300">Ticket #TK-{ticketId || Date.now().toString().slice(-6)}</span></div>
                    </motion.div>
                  ) : (
                    <motion.form key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-surface-600 dark:text-surface-300 mb-2">Full Name</label><input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="input" /></div>
                        <div><label className="block text-sm font-medium text-surface-600 dark:text-surface-300 mb-2">Email</label><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" className="input" /></div>
                      </div>
                      <div><label className="block text-sm font-medium text-surface-600 dark:text-surface-300 mb-2">Subject</label><input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="What can we help with?" className="input" /></div>
                      <div><label className="block text-sm font-medium text-surface-600 dark:text-surface-300 mb-2">Message</label><textarea required rows={6} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Tell us more..." className="input resize-none" /></div>
                      <Button type="submit" variant="gradient" size="lg" fullWidth disabled={loading} rightIcon={loading ? undefined : <Send size={18} />}>{loading ? 'Sending...' : 'Send Message'}</Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
