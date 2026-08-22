import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Send,
  Plus,
  MessageSquare,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Search,
  Clock,
  Menu,
  X,
  ChevronRight,
  RefreshCw,
  Sparkles,
  Crown,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import LingoMascot from '../components/ui/LingoMascot';
import Button from '../components/ui/Button';
import AIUpgradeModal from '../components/pricing/AIUpgradeModal';
import { chatService, speakEnglish } from '../services';
import type { ChatConversation, ChatMessage } from '../types';
import type { ChatUsage } from '../services/chatService';

const quickPrompts = [
  {
    icon: '🌲',
    title: 'Təbiət haqqında hekayə yaz',
    subtitle: 'Nature & Wildlife (A2)',
    prompt: 'Write an engaging A2 level story about nature and wild animals with vocabulary definitions and Azerbaijani translations.',
  },
  {
    icon: '🚀',
    title: 'Kosmos macərası yarat',
    subtitle: 'Sci-Fi Adventure (B1)',
    prompt: 'Write an exciting B1 level story about space exploration with key vocabulary and translations.',
  },
  {
    icon: '📝',
    title: 'Qrammatika izahı',
    subtitle: 'Present Perfect vs Past Simple',
    prompt: 'Explain the difference between Present Perfect and Past Simple in clear terms with English examples and Azerbaijani explanations.',
  },
  {
    icon: '💡',
    title: '5 Faydalı İdiom',
    subtitle: 'Daily Idioms & Phrases',
    prompt: 'Teach me 5 popular daily English idioms with their meanings, Azerbaijani translations, and example sentences.',
  },
];

export default function LingoAIPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [usage, setUsage] = useState<ChatUsage | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load conversations & usage on mount
  useEffect(() => {
    loadConversations();
    loadUsage();
  }, []);

  const loadConversations = async () => {
    const list = await chatService.getConversations();
    setConversations(list);
  };

  const loadUsage = async () => {
    const u = await chatService.getUsage();
    setUsage(u);
  };

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConversationId) {
      setMessages([]);
      return;
    }
    const loadConversationMessages = async () => {
      setLoadingHistory(true);
      const msgs = await chatService.getMessages(activeConversationId);
      setMessages(msgs);
      setLoadingHistory(false);
    };
    loadConversationMessages();
  }, [activeConversationId]);

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
    setInput('');
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setSidebarOpen(false);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isTyping) return;

    // If quota reached on client side
    if (usage && !usage.isUnlimited && usage.remaining <= 0) {
      setUpgradeModalOpen(true);
      return;
    }

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      text: textToSend,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const res = await chatService.sendMessage(
        textToSend,
        activeConversationId || undefined
      );

      if (res.conversationId && res.conversationId !== activeConversationId) {
        setActiveConversationId(res.conversationId);
        loadConversations();
      }

      // Refresh usage counter
      loadUsage();

      if (res.reply) {
        const lingoMsg: ChatMessage = {
          id: `lingo-${Date.now()}`,
          role: 'lingo',
          text: res.reply,
          createdAt: res.createdAt || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, lingoMsg]);
        setIsTyping(false);
        return;
      }
    } catch (error: any) {
      console.warn('LingoAI send error:', error);
      const errorMsg = error?.message || error?.response?.data?.message || '';
      if (errorMsg.includes('limit') || errorMsg.includes('Plan') || errorMsg.includes('Upgrade')) {
        setUpgradeModalOpen(true);
        setIsTyping(false);
        return;
      }
    }

    // Fallback response if offline or key missing
    setTimeout(() => {
      const fallbackMsg: ChatMessage = {
        id: `lingo-${Date.now()}`,
        role: 'lingo',
        text: "I'm ready! Please make sure your DeepSeek/AI API key is configured in backend to receive real-time answers.",
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      setIsTyping(false);
    }, 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (playingId === id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    setPlayingId(id);
    speakEnglish(text);

    // Simple auto reset after estimated duration
    const words = text.split(/\s+/).length;
    const durationMs = Math.max(2000, (words / 2.5) * 1000);
    setTimeout(() => {
      setPlayingId((current) => (current === id ? null : current));
    }, durationMs);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeTitle =
    conversations.find((c) => c.id === activeConversationId)?.title ||
    'Yeni Söhbət';

  return (
    <AppLayout>
      <div className="container-app py-4 sm:py-6 h-[calc(100vh-5rem)] min-h-[550px] flex flex-col">
        <div className="flex-1 flex gap-4 lg:gap-6 overflow-hidden rounded-3xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-card">
          
          {/* ================= LEFT SIDEBAR (CHAT HISTORY) ================= */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-surface-900 border-r border-surface-200 dark:border-surface-800 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Sidebar Top: New Chat */}
            <div className="p-4 border-b border-surface-100 dark:border-surface-800 flex items-center gap-2">
              <Button
                variant="gradient"
                className="flex-1 shadow-md hover:shadow-primary-500/20"
                leftIcon={<Plus size={18} />}
                onClick={handleNewChat}
              >
                Yeni Söhbət
              </Button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-xl text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-800"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search conversations */}
            <div className="p-3 border-b border-surface-100 dark:border-surface-800">
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
                />
                <input
                  type="text"
                  placeholder="Tarixçədə axtar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
              <div className="px-3 py-1.5 text-[11px] font-bold text-surface-400 uppercase tracking-wider">
                Keçmiş Söhbətlər ({filteredConversations.length})
              </div>

              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 px-4 text-surface-400 text-xs">
                  <MessageSquare size={28} className="mx-auto mb-2 opacity-40" />
                  <p>Hələ söhbət tarixçəsi yoxdur.</p>
                  <p className="text-[11px] mt-1 text-surface-500">
                    AI ilə danışmağa başlayın!
                  </p>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isActive = c.id === activeConversationId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSelectConversation(c.id)}
                      className={`w-full text-left p-3 rounded-2xl text-xs font-medium transition-all flex items-start gap-2.5 group relative ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-500/15 text-primary-700 dark:text-primary-300 font-semibold border border-primary-200 dark:border-primary-500/30 shadow-sm'
                          : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800/60'
                      }`}
                    >
                      <MessageSquare
                        size={16}
                        className={`shrink-0 mt-0.5 ${
                          isActive
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-surface-400 group-hover:text-surface-600 dark:group-hover:text-surface-300'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="truncate leading-tight mb-1">{c.title}</p>
                        <span className="text-[10px] text-surface-400 flex items-center gap-1 font-normal">
                          <Clock size={10} />
                          {new Date(c.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 absolute right-2.5 top-1/2 -translate-y-1/2" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Sidebar Bottom: Info */}
            <div className="p-3 border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-900/50 flex items-center gap-2 text-xs text-surface-500">
              <div className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
              <span>Lingo AI v2.0 • Online</span>
            </div>
          </aside>

          {/* Mobile backdrop */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
            />
          )}

          {/* ================= RIGHT MAIN CHAT AREA ================= */}
          <main className="flex-1 flex flex-col min-w-0 bg-surface-50/30 dark:bg-ink-950/40 relative">
            
            {/* Chat Top Header */}
            <header className="h-16 px-4 sm:px-6 border-b border-surface-200 dark:border-surface-800 flex items-center justify-between bg-white/70 dark:bg-surface-900/70 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-xl text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800"
                  title="Söhbət Tarixçəsi"
                >
                  <Menu size={20} />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-md">
                    <LingoMascot variant="wave" size={32} />
                  </div>
                  <span className="w-3 h-3 rounded-full bg-success-500 border-2 border-white dark:border-surface-900 absolute -bottom-0.5 -right-0.5" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-display font-bold text-sm sm:text-base text-surface-900 dark:text-white truncate flex items-center gap-1.5">
                    {activeConversationId ? activeTitle : 'Lingo AI Tutor'}
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 font-semibold hidden sm:inline-block">
                      AI Powered
                    </span>
                  </h2>
                  <p className="text-xs text-surface-400 truncate">
                    {activeConversationId
                      ? 'Aktiv Söhbət'
                      : 'İstənilən ingilis dili sualını və ya hekayə istəyini yazın'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Daily AI Usage Badge */}
                {usage && (
                  usage.isUnlimited ? (
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm">
                      <Crown size={14} className="fill-amber-400 text-amber-500" />
                      <span>Limitsiz AI</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setUpgradeModalOpen(true)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all hover:scale-105 ${
                        usage.remaining <= 1
                          ? 'bg-danger-50 dark:bg-danger-500/10 border-danger-200 dark:border-danger-500/30 text-danger-600 dark:text-danger-400'
                          : 'bg-primary-50 dark:bg-primary-500/10 border-primary-200 dark:border-primary-500/30 text-primary-700 dark:text-primary-300'
                      }`}
                      title="Planınızı yüksəldin"
                    >
                      <Sparkles size={13} className="text-primary-500" />
                      <span>{usage.remaining} / {usage.dailyLimit} qalıb</span>
                      <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-primary-200/50 dark:bg-primary-500/30 text-primary-800 dark:text-primary-200 font-bold ml-0.5">
                        {usage.tier}
                      </span>
                    </button>
                  )
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<RefreshCw size={14} />}
                  onClick={handleNewChat}
                  className="hidden sm:inline-flex"
                >
                  Təmizlə
                </Button>
              </div>
            </header>

            {/* Chat Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
              {loadingHistory ? (
                <div className="flex flex-col items-center justify-center h-full text-surface-400 gap-3">
                  <LingoMascot variant="thinking" size={64} />
                  <p className="text-sm font-medium">Söhbət mesajları yüklənir...</p>
                </div>
              ) : messages.length === 0 ? (
                /* Welcome Starter Screen */
                <div className="max-w-2xl mx-auto py-8 text-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="inline-flex p-3 rounded-3xl bg-primary-50 dark:bg-primary-500/10 mb-4">
                      <LingoMascot variant="celebrate" size={80} />
                    </div>
                    <h1 className="font-display text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-2">
                      Salam! Mən <span className="text-primary-600 dark:text-primary-400">Lingo AI</span>
                    </h1>
                    <p className="text-sm text-surface-500 dark:text-surface-400 max-w-md mx-auto mb-8">
                      Sizin fərdi ingilis dili təlimçinizəm. Məndən istənilən mövzuda hekayə yazmağımı, söz izahını və ya qrammatika yoxlanışını istəyə bilərsiniz.
                    </p>

                    {/* Quick suggestion cards */}
                    <div className="grid sm:grid-cols-2 gap-3 text-left">
                      {quickPrompts.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(item.prompt)}
                          className="p-4 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-500 hover:shadow-soft transition-all group hover:-translate-y-0.5"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{item.icon}</span>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-bold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-xs text-surface-400 line-clamp-1 mt-0.5">
                                {item.subtitle}
                              </p>
                            </div>
                            <ChevronRight
                              size={16}
                              className="text-surface-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all mt-1"
                            />
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ) : (
                /* Chat Messages List */
                messages.map((m) => {
                  const isUser = m.role === 'user';
                  const isPlaying = playingId === m.id;
                  const isCopied = copiedId === m.id;

                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 max-w-3xl ${
                        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                      }`}
                    >
                      {/* Avatar */}
                      <div className="shrink-0 mt-1">
                        {isUser ? (
                          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                            Siz
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shadow-sm">
                            <LingoMascot variant="study" size={24} />
                          </div>
                        )}
                      </div>

                      {/* Bubble */}
                      <div
                        className={`flex flex-col gap-1.5 ${
                          isUser ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`rounded-3xl p-4 sm:p-5 text-sm leading-relaxed ${
                            isUser
                              ? 'bg-gradient-primary text-white rounded-tr-sm shadow-md'
                              : 'bg-white dark:bg-surface-800 text-surface-800 dark:text-surface-100 rounded-tl-sm border border-surface-200 dark:border-surface-700 shadow-card'
                          }`}
                        >
                          <div className="whitespace-pre-wrap select-text">
                            {m.text}
                          </div>
                        </div>

                        {/* Interactive Message Actions for Lingo Responses */}
                        {!isUser && (
                          <div className="flex items-center gap-1 text-xs text-surface-400 pl-2">
                            <button
                              onClick={() => handleSpeak(m.id, m.text)}
                              className={`p-1.5 rounded-lg flex items-center gap-1 transition-colors ${
                                isPlaying
                                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-500/20 font-semibold'
                                  : 'hover:bg-surface-200 dark:hover:bg-surface-800 hover:text-surface-700'
                              }`}
                              title={isPlaying ? 'Dayandır' : 'İngiliscə səsləndir (TTS)'}
                            >
                              {isPlaying ? (
                                <>
                                  <VolumeX size={14} className="animate-pulse" />
                                  <span>Dayandır</span>
                                </>
                              ) : (
                                <>
                                  <Volume2 size={14} />
                                  <span>Dinlə</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleCopy(m.id, m.text)}
                              className="p-1.5 rounded-lg flex items-center gap-1 hover:bg-surface-200 dark:hover:bg-surface-800 hover:text-surface-700 transition-colors"
                              title="Kopyala"
                            >
                              {isCopied ? (
                                <>
                                  <Check size={14} className="text-success-500" />
                                  <span className="text-success-500">Kopyalandı</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  <span>Kopyala</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}

              {/* Typing animation */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 mr-auto max-w-xl"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center shrink-0 mt-1">
                    <LingoMascot variant="thinking" size={24} />
                  </div>
                  <div className="bg-white dark:bg-surface-800 rounded-3xl rounded-tl-sm p-4 border border-surface-200 dark:border-surface-700 flex items-center gap-2 shadow-card">
                    <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-xs text-surface-400 font-medium ml-1">
                      Lingo düşünür və yazır...
                    </span>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Bottom Input Area */}
            <div className="p-4 sm:p-5 border-t border-surface-200 dark:border-surface-800 bg-white/80 dark:bg-surface-900/80 backdrop-blur-md">
              <div className="max-w-4xl mx-auto">
                {/* Prompt Quick Tags */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none text-xs">
                  <button
                    onClick={() =>
                      handleSend(
                        'Write a short exciting story in English about a nature adventure with vocabulary list'
                      )
                    }
                    className="px-3 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/20 whitespace-nowrap transition-colors"
                  >
                    🌲 Təbiət hekayəsi yaz
                  </button>
                  <button
                    onClick={() =>
                      handleSend(
                        'Explain this English word in detail with example sentences and pronunciation: '
                      )
                    }
                    className="px-3 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/20 whitespace-nowrap transition-colors"
                  >
                    📖 Söz izahı
                  </button>
                  <button
                    onClick={() =>
                      handleSend(
                        'Check the grammar and natural phrasing of this sentence: '
                      )
                    }
                    className="px-3 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/20 whitespace-nowrap transition-colors"
                  >
                    📝 Qrammatika yoxla
                  </button>
                  <button
                    onClick={() =>
                      handleSend(
                        'Let us practice a friendly English conversation. You start by asking me a question!'
                      )
                    }
                    className="px-3 py-1 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-500/20 whitespace-nowrap transition-colors"
                  >
                    🗣️ Söhbət praktikası
                  </button>
                </div>

                {/* Input box */}
                <div className="relative flex items-end gap-2 p-2 rounded-2xl bg-surface-50 dark:bg-surface-800/80 border border-surface-200 dark:border-surface-700 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={input}
                    onChange={handleTextareaInput}
                    onKeyDown={handleKeyDown}
                    placeholder="Lingo AI-ya yazın... (məs: təbiət haqqında hekayə yaz)"
                    disabled={isTyping}
                    className="flex-1 max-h-36 py-2 px-3 bg-transparent text-sm text-surface-900 dark:text-white placeholder:text-surface-400 focus:outline-none resize-none"
                  />
                  <Button
                    variant="gradient"
                    size="md"
                    disabled={!input.trim() || isTyping}
                    onClick={() => handleSend()}
                    className="shrink-0 rounded-xl px-4 shadow-sm"
                  >
                    <Send size={16} />
                  </Button>
                </div>
                <p className="text-[11px] text-surface-400 text-center mt-2">
                  Lingo AI ingilis dili öyrənmək üçün yaradılmış süni intellekt köməkçisidir.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>

      <AIUpgradeModal
        open={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        tier={usage?.tier || 'Free'}
      />
    </AppLayout>
  );
}
