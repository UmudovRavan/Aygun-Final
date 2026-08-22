import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, Maximize2, Minimize2, RotateCcw, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LingoMascot from './ui/LingoMascot';
import AIUpgradeModal from './pricing/AIUpgradeModal';
import { chatService } from '../services';
import type { ChatUsage } from '../services/chatService';

interface Message {
  role: 'user' | 'lingo';
  text: string;
}

const suggestedPrompts = [
  'Explain the meaning of "Serendipity"',
  'Write a short A2 story about a friendly robot',
  'Difference between "affect" and "effect"',
];

export default function LingoAssistant() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [usage, setUsage] = useState<ChatUsage | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'lingo',
      text: "Hi! I'm Lingo, your ReadLingo AI tutor. Ask me any English word meaning, grammar question, or ask me to write a story for you!",
    },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      chatService.getUsage().then(setUsage).catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping, isExpanded]);

  const handleResetChat = () => {
    setConversationId(null);
    setMessages([
      {
        role: 'lingo',
        text: "Conversation reset! What would you like to learn or practice next?",
      },
    ]);
  };

  const handleSend = async (customText?: string) => {
    const userMsg = (customText || input).trim();
    if (!userMsg || isTyping) return;

    if (usage && !usage.isUnlimited && usage.remaining <= 0) {
      setUpgradeModalOpen(true);
      return;
    }

    setInput('');
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const res = await chatService.sendMessage(userMsg, conversationId || undefined);

      if (res.conversationId) {
        setConversationId(res.conversationId);
      }

      chatService.getUsage().then(setUsage).catch(() => {});

      if (res.reply) {
        setMessages((m) => [...m, { role: 'lingo', text: res.reply }]);
        setIsTyping(false);
        return;
      }
    } catch (error: any) {
      console.warn('LingoAssistant error:', error);
      const msg = error?.message || error?.response?.data?.message || '';
      if (msg.includes('limit') || msg.includes('Plan') || msg.includes('Upgrade')) {
        setUpgradeModalOpen(true);
        setIsTyping(false);
        return;
      }
    }

    // Default friendly message if server is offline or key missing
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: 'lingo',
          text: "I'm ready! Please make sure your DeepSeek/AI API key is configured in backend to receive real-time answers.",
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-primary shadow-card-hover flex items-center justify-center hover:scale-105 transition-transform"
        whileTap={{ scale: 0.95 }}
        aria-label="Open Lingo Assistant"
      >
        {open ? <X size={24} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed z-50 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'inset-0 sm:inset-4 md:inset-6 rounded-none sm:rounded-3xl'
                : 'bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[480px] h-[580px] max-h-[82vh] rounded-2xl'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-gradient-primary text-white select-none shrink-0">
              <div className="flex items-center gap-3">
                <LingoMascot variant="happy" size={38} />
                <div>
                  <p className="font-display font-bold text-sm sm:text-base flex items-center gap-1.5 leading-tight">
                    {t('lingo.title', 'Lingo AI Tutor')}
                    <Sparkles size={15} className="text-amber-300" />
                  </p>
                  <p className="text-xs text-white/80">
                    {usage?.isUnlimited
                      ? '👑 Limitsiz AI'
                      : usage
                      ? `✨ ${usage.remaining}/${usage.dailyLimit} qalıb`
                      : t('lingo.subtitle', 'Powered by DeepSeek AI')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {/* Open full page */}
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate('/lingo-ai');
                  }}
                  title="Open in LingoAI Page"
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/90 hover:text-white flex items-center justify-center"
                >
                  <ExternalLink size={17} />
                </button>

                {/* Reset Chat */}
                <button
                  onClick={handleResetChat}
                  title="New Conversation"
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/90 hover:text-white"
                >
                  <RotateCcw size={17} />
                </button>

                {/* Fullscreen / Minimize Toggle */}
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? 'Exit Full Screen' : 'Full Screen'}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/90 hover:text-white flex items-center justify-center"
                >
                  {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>

                {/* Close Button */}
                <button
                  onClick={() => setOpen(false)}
                  title="Close Assistant"
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors text-white/90 hover:text-white"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-surface-50/40 dark:bg-surface-900/50">
              <div className={`space-y-4 ${isExpanded ? 'max-w-4xl mx-auto' : 'w-full'}`}>
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[92%] sm:max-w-[85%] px-4 sm:px-5 py-3.5 rounded-2xl text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white rounded-br-sm shadow-sm'
                          : 'bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 rounded-bl-sm border border-surface-200/70 dark:border-surface-700/70 shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white dark:bg-surface-800 border border-surface-200/70 dark:border-surface-700/70 px-4 py-3.5 rounded-2xl rounded-bl-sm flex items-center gap-1.5 shadow-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}

                {/* Suggestions on start */}
                {messages.length === 1 && !isTyping && (
                  <div className="pt-3 space-y-2.5 max-w-xl">
                    <p className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Try asking:</p>
                    {suggestedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt)}
                        className="w-full text-left text-xs sm:text-sm p-3.5 rounded-xl bg-white dark:bg-surface-800 hover:bg-primary-50 dark:hover:bg-primary-950/40 border border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 transition-all shadow-sm hover:border-primary-300"
                      >
                        💡 {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Input Footer */}
            <div className="p-3 sm:p-4 border-t border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shrink-0">
              <div className={`flex items-center gap-2.5 ${isExpanded ? 'max-w-4xl mx-auto' : 'w-full'}`}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSend()}
                  placeholder={t('lingo.placeholder', 'Ask a word meaning, grammar, or story...')}
                  disabled={isTyping}
                  className="flex-1 px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm sm:text-base text-surface-900 dark:text-white outline-none focus:border-primary-500 transition-colors"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center text-white hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0 shadow-sm"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AIUpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        tier={usage?.tier || 'Free'}
      />
    </>
  );
}



