import { motion } from 'framer-motion';
import {
  Sparkles,
  MessageCircle,
  BookOpen,
  GraduationCap,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { LingoMascot } from '../ui/LingoMascot';

const bullets: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: MessageCircle,
    title: 'Natural Conversations',
    desc: 'Ask questions in plain language and get clear, helpful explanations — just like chatting with a tutor.',
  },
  {
    icon: BookOpen,
    title: 'Context-Aware Help',
    desc: 'The assistant knows the story you are reading and explains vocabulary and grammar in context.',
  },
  {
    icon: GraduationCap,
    title: 'Personalized Guidance',
    desc: 'Get tailored practice recommendations based on your level, progress, and learning goals.',
  },
];

const exampleMessages = [
  {
    role: 'user' as const,
    text: 'What does "ephemeral" mean in this sentence?',
  },
  {
    role: 'assistant' as const,
    text: '“Ephemeral” means lasting for a very short time. Here, it describes cherry blossoms that bloom briefly each spring. 🌸',
  },
  {
    role: 'user' as const,
    text: 'Can you give me another example?',
  },
  {
    role: 'assistant' as const,
    text: 'Sure! “Fame can be ephemeral — many stars shine brightly, then fade.” Want a quick quiz on this word? 💡',
  },
];

export function AIFeaturesSection() {
  const { t } = useTranslation();

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-950/20 dark:to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text + bullets */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="accent" className="mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                AI Assistant
              </Badge>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-900 dark:text-white mb-4"
            >
              Meet your personal{' '}
              <span className="bg-gradient-to-r from-accent-500 to-primary-600 bg-clip-text text-transparent">
                AI English tutor
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-ink-500 dark:text-ink-400 mb-8"
            >
              Stuck on a word or grammar rule? Lingo is always ready to help with instant, friendly
              explanations tailored to what you are reading.
            </motion.p>

            <div className="space-y-5">
              {bullets.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.25 + i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white shadow-md">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-ink-900 dark:text-white mb-1">
                        {item.title}
                      </h3>
                      <p className="text-ink-500 dark:text-ink-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Right: Mock chat interface */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            {/* Background glow */}
            <div className="absolute -inset-4 bg-gradient-to-br from-primary-200/30 to-accent-200/30 dark:from-primary-500/10 dark:to-accent-500/10 rounded-3xl blur-2xl" />

            <Card className="relative overflow-hidden p-0">
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-ink-200 dark:border-ink-800 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-ink-900 dark:to-ink-800">
                <div className="relative">
                  <LingoMascot mood="idle" size={44} />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-success-500 border-2 border-white dark:border-ink-900" />
                </div>
                <div>
                  <div className="font-display font-bold text-ink-900 dark:text-white">Lingo</div>
                  <div className="text-xs text-success-600 dark:text-success-400 font-medium">
                    AI Tutor • Online
                  </div>
                </div>
                <Badge variant="success" size="sm" className="ml-auto">
                  <CheckCircle2 className="w-3 h-3" />
                  {t('common.start')}
                </Badge>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-3 min-h-[300px] bg-ink-50/50 dark:bg-ink-950/30">
                {exampleMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.3 }}
                    className={`flex items-end gap-2 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && <LingoMascot mood="idle" size={32} />}
                    <div
                      className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-br-sm shadow-md shadow-primary-600/20'
                          : 'bg-white dark:bg-ink-800 text-ink-700 dark:text-ink-200 rounded-bl-sm border border-ink-200 dark:border-ink-700'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Input mock */}
              <div className="flex items-center gap-3 px-5 py-4 border-t border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900">
                <div className="flex-1 px-4 py-2.5 rounded-xl bg-ink-100 dark:bg-ink-800 text-ink-400 text-sm">
                  Ask Lingo anything about English…
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-600/25">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
