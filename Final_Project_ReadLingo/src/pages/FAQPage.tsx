import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { LandingNav, LandingFooter } from '../components/landing/LandingNav';
import LingoMascot from '../components/ui/LingoMascot';

const faqs = [
  { q: 'What is ReadLingo?', a: 'ReadLingo is an AI-powered English learning app that teaches through stories. You read at your level, click any word for instant definitions and translations, and take quizzes to reinforce what you\'ve learned.' },
  { q: 'What CEFR levels do you support?', a: 'We support all six CEFR levels: A1 (Beginner), A2 (Elementary), B1 (Intermediate), B2 (Upper Intermediate), C1 (Advanced), and C2 (Proficient). You can set your level during onboarding and change it anytime in settings.' },
  { q: 'How does the AI tutor Lingo work?', a: 'Lingo is your AI companion. It provides word definitions, translations in your native language, story recommendations, and motivational feedback as you read and complete quizzes.' },
  { q: 'What devices can I use ReadLingo on?', a: 'ReadLingo works in any modern web browser on desktop, tablet, and mobile. There\'s nothing to install — just visit the website and start learning.' },
  { q: 'How does the hearts system work?', a: 'You start with 5 hearts. Each incorrect answer in quizzes costs 1 heart. You can earn +1 heart for every 3 correct answers! Lost hearts also automatically regenerate over time with a live countdown timer. Pro & Premium members enjoy unlimited hearts with zero waiting time.' },
  { q: 'Can I change my daily goal?', a: 'Yes! You can set your daily reading goal from 5 to 60 minutes during onboarding or in your profile settings. The app will show you a prediction of how many words you could learn per year at that pace.' },
  { q: 'Is my progress saved?', a: 'Yes, all your progress — stories read, words learned, quiz scores, streaks, and XP — is saved to your account and syncs across devices when you sign in.' },
  { q: 'How do I cancel my subscription?', a: 'You can cancel anytime from your Profile > Settings page. Your premium features remain active until the end of your current billing period.' },
];

function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden bg-white dark:bg-surface-900">
      <button onClick={onToggle} className="w-full flex items-center justify-between p-5 text-left">
        <span className="font-medium text-surface-900 dark:text-white text-sm sm:text-base">{q}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown size={18} className="text-surface-400 shrink-0 ml-3" /></motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <p className="px-5 pb-5 text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <>
      <LandingNav />
      <main className="pt-16 lg:pt-20">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 to-white dark:from-ink-950 dark:to-ink-900">
          <div className="container-app py-16 text-center">
            <div className="flex justify-center mb-4"><LingoMascot variant="thinking" size={72} /></div>
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4"><HelpCircle size={28} className="text-white" /></div>
            <h1 className="font-display text-4xl font-bold text-surface-900 dark:text-white mb-4">Frequently Asked Questions</h1>
            <p className="text-lg text-surface-500 dark:text-surface-400 max-w-xl mx-auto">Find answers to common questions about ReadLingo</p>
          </div>
        </section>
        <section className="container-app py-12 lg:py-16 max-w-3xl">
          <div className="space-y-3">
            {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} isOpen={openIdx === i} onToggle={() => setOpenIdx(openIdx === i ? null : i)} />)}
          </div>
          <div className="mt-12 text-center p-8 rounded-2xl bg-surface-50 dark:bg-surface-900">
            <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-2">Still have questions?</h2>
            <p className="text-surface-500 dark:text-surface-400 mb-4">Our support team is here to help.</p>
            <a href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-surface-800 text-primary-600 dark:text-primary-400 font-semibold px-6 py-3 hover:bg-primary-50 dark:hover:bg-surface-700 transition-colors border border-surface-200 dark:border-surface-700">Contact Us</a>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
