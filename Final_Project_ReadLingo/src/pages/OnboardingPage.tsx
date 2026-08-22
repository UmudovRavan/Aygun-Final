import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowRight, Sparkles } from 'lucide-react';
import { ThemeToggle, LanguageSelector } from '../components/layout/AppLayout';
import LingoMascot from '../components/ui/LingoMascot';
import Button from '../components/ui/Button';

const goals = [
  { minutes: 5, prediction: '1,000+', desc: 'Reading 5 minutes every day may help you learn approximately 1,000+ new words per year.' },
  { minutes: 10, prediction: '2,000+', desc: 'Reading 10 minutes every day may help you learn approximately 2,000+ new words per year.' },
  { minutes: 20, prediction: '4,000+', desc: 'Reading 20 minutes every day may help you learn approximately 4,000+ new words per year.' },
  { minutes: 30, prediction: '6,000+', desc: 'Reading 30 minutes every day may help you learn approximately 6,000+ new words per year.' },
  { minutes: 45, prediction: '9,000+', desc: 'Reading 45 minutes every day may help you learn approximately 9,000+ new words per year.' },
  { minutes: 60, prediction: '12,000+', desc: 'Reading 60 minutes every day may help you learn approximately 12,000+ new words per year.' },
];

const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const languages = ['Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Portuguese', 'Arabic', 'Hindi', 'Azerbaijani', 'Russian', 'Other'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState('A2');
  const [nativeLang, setNativeLang] = useState('Spanish');
  const [goal, setGoal] = useState(15);
  const steps = ['Language', 'Level', 'Daily Goal'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50/60 to-white dark:from-ink-950 dark:to-ink-900 flex items-center justify-center px-4 py-8 relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-6"><LingoMascot variant="wave" size={64} /></div>
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i <= step ? 'bg-primary-600 text-white' : 'bg-surface-200 dark:bg-surface-700 text-surface-400'}`}>{i + 1}</div>
              {i < steps.length - 1 && <div className={`w-12 h-0.5 ${i < step ? 'bg-primary-600' : 'bg-surface-200 dark:bg-surface-700'}`} />}
            </div>
          ))}
        </div>
        <div className="card p-8">
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            {step === 0 && (
              <>
                <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">What's your native language?</h1>
                <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">We'll use this to translate words for you</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {languages.map((lang) => (
                    <button key={lang} onClick={() => setNativeLang(lang)} className={`px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${nativeLang === lang ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:border-surface-300'}`}>{lang}</button>
                  ))}
                </div>
              </>
            )}
            {step === 1 && (
              <>
                <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">What's your English level?</h1>
                <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">Choose your CEFR level — you can change this later</p>
                <div className="grid grid-cols-3 gap-3">
                  {levels.map((lvl) => (
                    <button key={lvl} onClick={() => setLevel(lvl)} className={`p-4 rounded-xl text-center border-2 transition-all ${level === lvl ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:border-surface-300'}`}>
                      <p className="font-display text-2xl font-bold mb-1">{lvl}</p>
                      <p className="text-xs">{lvl === 'A1' ? 'Beginner' : lvl === 'A2' ? 'Elementary' : lvl === 'B1' ? 'Intermediate' : lvl === 'B2' ? 'Upper Int.' : lvl === 'C1' ? 'Advanced' : 'Proficient'}</p>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">How much time per day?</h1>
                <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">Set a daily reading goal that works for you</p>
                <div className="space-y-3">
                  {goals.map((g) => (
                    <button key={g.minutes} onClick={() => setGoal(g.minutes)} className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${goal === g.minutes ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-surface-200 dark:border-surface-700 hover:border-surface-300'}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${goal === g.minutes ? 'bg-primary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-400'}`}><Clock size={22} /></div>
                      <div className="flex-1"><p className="font-display font-bold text-lg text-surface-900 dark:text-white">{g.minutes} minutes / day</p><p className="text-xs text-surface-500 dark:text-surface-400">{g.desc}</p></div>
                    </button>
                  ))}
                </div>
                <div className="mt-4 p-4 rounded-xl bg-gradient-primary text-white text-center">
                  <Sparkles size={20} className="mx-auto mb-2" />
                  <p className="text-sm">At this pace, you could learn <strong>{goals.find((g) => g.minutes === goal)?.prediction}</strong> new words per year!</p>
                </div>
              </>
            )}
          </motion.div>
          <div className="flex items-center justify-between mt-8">
            {step > 0 ? <Button variant="ghost" onClick={() => setStep(step - 1)}>Back</Button> : <div />}
            {step < 2 ? <Button variant="gradient" onClick={() => setStep(step + 1)} rightIcon={<ArrowRight size={18} />}>Continue</Button> : <Button variant="gradient" onClick={() => navigate('/dashboard')} rightIcon={<ArrowRight size={18} />}>Start Learning</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
