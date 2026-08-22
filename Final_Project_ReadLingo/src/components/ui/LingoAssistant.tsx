import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import LingoMascot from './LingoMascot';
import { isEnglishLearningQuestion, getOffTopicResponse } from '../../services';
import type { AIChatMessage } from '../../types';

const greetingMessage: AIChatMessage = {
  id: 'greeting',
  role: 'assistant',
  content: "Hi! I'm Lingo, your ReadLingo AI Assistant. I can help you with English learning — grammar, vocabulary, pronunciation, reading, quizzes, flashcards, IELTS, TOEFL, and ReadLingo features. What would you like to learn today?",
  timestamp: Date.now(),
};

const suggestedQuestions = [
  'What\'s the difference between "affect" and "effect"?',
  'How do I use the present perfect tense?',
  'Explain phrasal verbs',
  'Tips for IELTS speaking?',
];

function generateResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('affect') && q.includes('effect')) {
    return '"Affect" is typically a verb meaning to influence or produce a change in something. "Effect" is typically a noun meaning the result or outcome of an action.\n\nExample: The weather will affect our plans. (verb)\nExample: The effect of the medicine was immediate. (noun)\n\nA useful memory trick: **A**ffect is the **A**ction (verb), **E**ffect is the **E**nd result (noun).';
  }

  if (q.includes('present perfect')) {
    return 'The present perfect tense connects the past to the present. It uses "has/have + past participle".\n\nUsage:\n1. Past actions with present relevance: "I have lost my keys." (I still can\'t find them)\n2. Life experiences: "She has visited Japan." (at some point in her life)\n3. Recent events: "They have just arrived."\n\nKey words often used with it: already, yet, just, ever, never, since, for.';
  }

  if (q.includes('phrasal verb')) {
    return 'Phrasal verbs are combinations of a verb + a preposition or adverb that create a new meaning.\n\nExamples:\n• "Give up" = to quit or stop trying\n• "Look forward to" = to be excited about something in the future\n• "Pick up" = to lift or to learn something\n• "Run into" = to meet unexpectedly\n\nTip: Phrasal verbs are very common in spoken English, so learning them will help you sound more natural!';
  }

  if (q.includes('ielts') && q.includes('speak')) {
    return 'Here are some tips for IELTS Speaking:\n\n1. **Expand your answers** — Don\'t give one-word answers. Explain and give examples.\n2. **Use discourse markers** — Words like "well", "actually", "to be honest", "on the other hand" make you sound natural.\n3. **Practice fluency over accuracy** — It\'s better to keep speaking than to pause for every grammar rule.\n4. **Learn topic vocabulary** — Common IELTS topics include education, technology, environment, and health.\n5. **Record yourself** — Listen back and identify areas to improve.\n\nWould you like to practice with some sample questions?';
  }

  if (q.includes('grammar')) {
    return 'Grammar is the foundation of clear communication in English. Here are key areas to focus on:\n\n• **Tenses** — Master the 12 English tenses, starting with present simple, past simple, and present perfect.\n• **Articles** — Learn when to use "a", "an", "the", or no article.\n• **Prepositions** — These small words (in, on, at, by, etc.) can change meaning significantly.\n• **Conditionals** — Zero, first, second, and third conditionals express different levels of possibility.\n\nWhat specific grammar topic would you like to explore?';
  }

  if (q.includes('vocab') || q.includes('vocabulary')) {
    return 'Building vocabulary is one of the most rewarding parts of learning English! Here are some strategies:\n\n• **Read regularly** — Stories and articles expose you to words in context.\n• **Use flashcards** — Spaced repetition helps you retain new words long-term.\n• **Learn word families** — If you learn "beauty", also learn "beautiful", "beautifully", "beautify".\n• **Group by theme** — Learn words related to the same topic together.\n• **Use new words** — Try to use each new word in a sentence within 24 hours of learning it.\n\nReadLingo\'s flashcards and stories are designed to help you build vocabulary naturally!';
  }

  if (q.includes('pronunciation') || q.includes('pronounce')) {
    return 'Improving pronunciation takes practice, but here are some key tips:\n\n• **Listen actively** — Pay attention to how native speakers form sounds.\n• **Use the phonetic alphabet** — IPA symbols help you understand exact sounds.\n• **Practice word stress** — In English, stress patterns can change meaning (REcord vs reCORD).\n• **Slow down** — Speaking slowly lets you focus on accuracy.\n• **Record and compare** — Record yourself and compare with native pronunciation.\n\nIn ReadLingo stories, you can tap any word to hear its pronunciation!';
  }

  if (q.includes('readlingo') || q.includes('feature') || q.includes('how') && q.includes('use')) {
    return 'ReadLingo is designed to make English learning engaging and effective! Here\'s what you can do:\n\n• **Read Stories** — Browse the Library for stories at your level (beginner to advanced).\n• **Take Quizzes** — Test your understanding and earn XP with fun quizzes.\n• **Flashcards** — Use spaced-repetition flashcards to memorize new vocabulary.\n• **Track Progress** — See your reading history, statistics, and achievements.\n• **AI Assistant** — Ask me any English-learning question anytime!\n\nStart by exploring the Library and picking a story that interests you!';
  }

  if (q.includes('toefl')) {
    return 'TOEFL (Test of English as a Foreign Language) tests your academic English skills. Here\'s how to prepare:\n\n• **Reading** — Practice reading academic passages and answering comprehension questions.\n• **Listening** — Listen to lectures and conversations, then answer questions.\n• **Speaking** — Express opinions on familiar topics and summarize information.\n• **Writing** — Write essays responding to reading and listening passages.\n\nReadLingo\'s advanced stories and quizzes help build the skills you need for TOEFL. The Premium plan includes dedicated TOEFL prep modules!';
  }

  return "That's a great English learning question! Let me help you with that. In ReadLingo, you can explore our Library for stories, take quizzes to test your knowledge, use flashcards to build vocabulary, and track your progress over time. Could you tell me more specifically what you'd like to learn about?";
}

export function LingoAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AIChatMessage[]>([greetingMessage]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const content = (text || input).trim();
    if (!content) return;

    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const isOnTopic = isEnglishLearningQuestion(content);
      const response = isOnTopic ? generateResponse(content) : getOffTopicResponse();
      const aiMsg: AIChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 500);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-xl shadow-primary-600/40 flex items-center justify-center text-white ${open ? 'hidden' : 'flex'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full border-2 border-white animate-pulse" />
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 h-[600px] max-h-[80vh] bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-surface-200 dark:border-surface-800 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-500 to-primary-700 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold">Lingo AI</h3>
                  <p className="text-xs text-white/80">English Learning Assistant</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex-shrsurface-0 w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                      <LingoMascot mood="idle" size={24} />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'bg-primary-600 text-white rounded-tr-sm'
                        : 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-100 rounded-tl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="flex-shrsurface-0 w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                    <LingoMascot mood="think" size={24} />
                  </div>
                  <div className="bg-surface-100 dark:bg-surface-800 rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-2 h-2 bg-surface-400 rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested questions (only on first load) */}
              {messages.length === 1 && !isTyping && (
                <div className="space-y-2 pt-2">
                  <p className="text-xs text-surface-400 font-semibold uppercase tracking-wide">Try asking:</p>
                  {suggestedQuestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="w-full text-left text-sm px-3 py-2 rounded-xl border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-surface-100 dark:border-surface-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about English learning..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-surface-100 dark:bg-surface-800 text-sm text-surface-900 dark:text-white placeholder:text-surface-400 border-0 focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="w-10 h-10 flex-shrsurface-0 rounded-xl bg-primary-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-primary-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
