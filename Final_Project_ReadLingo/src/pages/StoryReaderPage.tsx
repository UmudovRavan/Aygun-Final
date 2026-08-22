import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, Clock, BookOpen, Star, Volume2, CheckCircle2, Maximize2, Minimize2, Type, Sun, Moon, Languages, X, Play, Pause, RotateCcw, Heart, Zap, Target, Lock, HelpCircle, Sparkles, Loader2, Brain } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import LingoMascot from '../components/ui/LingoMascot';
import { LoadingState } from '../components/ui/Loading';
import { storyService, quizService, userService, getMockWordDefinition, speakEnglish } from '../services';
import type { Story, StoryChapter, WordDefinition, Quiz, QuizQuestion, QuizResult } from '../types';

const getDifficultyColor = (level: string): 'success' | 'warning' | 'danger' =>
  level === 'A1' || level === 'A2' ? 'success' : level === 'B1' || level === 'B2' ? 'warning' : 'danger';

type ReadingTheme = 'light' | 'sepia' | 'dark';
const themeStyles: Record<ReadingTheme, { bg: string; text: string; card: string }> = {
  light: { bg: 'bg-white dark:bg-surface-900', text: 'text-surface-700 dark:text-surface-200', card: 'bg-white dark:bg-surface-900 border-surface-100 dark:border-surface-800' },
  sepia: { bg: 'bg-amber-50', text: 'text-amber-900', card: 'bg-amber-50 border-amber-200' },
  dark: { bg: 'bg-surface-900', text: 'text-surface-200', card: 'bg-surface-900 border-surface-800' },
};

const MAX_HEARTS = 5;

function formatCountdown(ms: number) {
  const totalSecs = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function fireConfetti() {
  const colors = ['#2563eb', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#2dd4bf'];
  confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors });
  confetti({ particleCount: 40, spread: 100, origin: { y: 0.6 }, colors, scalar: 0.7 });
}

export default function StoryReaderPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<StoryChapter[]>([]);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('light');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordDefinition | null>(null);
  const [isWordLoading, setIsWordLoading] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Read Aloud state
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentSentenceIdx, setCurrentSentenceIdx] = useState(-1);
  const [sentences, setSentences] = useState<string[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const trackedWordsRef = useRef<Set<string>>(new Set());

  // Chapter quiz gating state
  const [chapterQuizState, setChapterQuizState] = useState<Record<number, 'locked' | 'active' | 'completed'>>({});
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizQ, setQuizQ] = useState(0);
  const [quizSelected, setQuizSelected] = useState<string>('');
  const [quizMatchSelected, setQuizMatchSelected] = useState<Record<string, string>>({});
  const [quizShowFeedback, setQuizShowFeedback] = useState(false);
  const [quizIsCorrect, setQuizIsCorrect] = useState(false);
  const [quizHearts, setQuizHearts] = useState(MAX_HEARTS);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [quizIncorrectCount, setQuizIncorrectCount] = useState(0);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [heartLostIdx, setHeartLostIdx] = useState<number | null>(null);
  const [heartGainedIdx, setHeartGainedIdx] = useState<number | null>(null);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [quizTimer, setQuizTimer] = useState(15);
  const [lingoMood, setLingoMood] = useState<'thinking' | 'happy' | 'sad' | 'idle'>('idle');
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'premium'>('free');
  const isFreeUser = userPlan === 'free';

  // Live heart countdown ticker (4-hour recovery cycle)
  const [heartCountdown, setHeartCountdown] = useState<number>(0);
  const [midnightCountdown, setMidnightCountdown] = useState<number>(0);

  useEffect(() => {
    if (!isFreeUser || quizHearts > 0) return;

    let target = Number(localStorage.getItem('readlingo_heart_recovery_target'));
    if (!target || isNaN(target) || target <= Date.now()) {
      target = Date.now() + 4 * 60 * 60 * 1000;
      localStorage.setItem('readlingo_heart_recovery_target', target.toString());
    }

    setHeartCountdown(Math.max(0, target - Date.now()));

    const interval = setInterval(() => {
      const remaining = Math.max(0, target - Date.now());
      setHeartCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        localStorage.removeItem('readlingo_heart_recovery_target');
        userService.updateProfile({ hearts: 5 }).then(() => {
          setQuizHearts(5);
          window.dispatchEvent(new Event('profile-updated'));
        }).catch(() => {});
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isFreeUser, quizHearts]);

  // Live midnight countdown for daily story limit
  useEffect(() => {
    const calcMidnight = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
      return Math.max(0, midnight.getTime() - now.getTime());
    };

    setMidnightCountdown(calcMidnight());
    const interval = setInterval(() => {
      setMidnightCountdown(calcMidnight());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      const [s, u] = await Promise.all([storyService.getStoryById(id!), userService.getProfile()]);
      setUserPlan(u.plan);
      if (u && typeof u.hearts === 'number') {
        const isUnlimited = u.plan === 'pro' || u.plan === 'premium' || (u as any).currentTier === 'Pro' || (u as any).currentTier === 'Premium';
        setQuizHearts(isUnlimited ? MAX_HEARTS : u.hearts);
      }
      setStory(s || null);
      setChapters(s?.chapters || []);
      const gateState: Record<number, 'locked' | 'active' | 'completed'> = {};
      (s?.chapters || []).forEach((_, i) => { gateState[i] = i === 0 ? 'active' : 'locked'; });
      setChapterQuizState(gateState);
      setLoading(false);
      if (id && s?.chapters && s.chapters.length > 0) {
        const firstChId = s.chapters[0]?.id;
        storyService.updateProgress(id, firstChId, 100, true).catch(() => {});
      }
    };
    load();
  }, [id]);

  // Build sentences from chapter content for TTS + highlighting
  useEffect(() => {
    const chapter = chapters[currentChapter];
    if (chapter) {
      const allSentences = chapter.content.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
      setSentences(allSentences);
      if (id && chapter.id) {
        storyService.updateProgress(id, chapter.id, 100, true).catch(() => {});
      }
    } else {
      setSentences([]);
    }
    setCurrentSentenceIdx(-1);
    setIsReading(false);
    setIsPaused(false);
  }, [currentChapter, chapters]);

  // Cleanup TTS on unmount or chapter change
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentChapter]);

  const showBubble = (msg: string) => {
    setSpeechBubble(msg);
    setTimeout(() => setSpeechBubble(null), 2500);
  };

  // Read Aloud functions
  const startReading = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || sentences.length === 0) return;
    window.speechSynthesis.cancel();
    setIsReading(true);
    setIsPaused(false);
    setCurrentSentenceIdx(0);

    const speakSentence = (idx: number) => {
      if (idx >= sentences.length) {
        setIsReading(false);
        setIsPaused(false);
        setCurrentSentenceIdx(-1);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(sentences[idx]);
      utterance.rate = 0.8;
      utterance.onend = () => {
        if (!isPaused) {
          const next = idx + 1;
          setCurrentSentenceIdx(next);
          speakSentence(next);
        }
      };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    speakSentence(0);
  }, [sentences, isPaused]);

  const pauseReading = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPaused(true);
  }, []);

  const resumeReading = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || currentSentenceIdx < 0) return;
    setIsPaused(false);
    const idx = currentSentenceIdx;
    const utterance = new SpeechSynthesisUtterance(sentences[idx]);
    utterance.rate = 0.9;
    utterance.onend = () => {
      const next = idx + 1;
      if (next < sentences.length) {
        setCurrentSentenceIdx(next);
        const nextUtterance = new SpeechSynthesisUtterance(sentences[next]);
        nextUtterance.rate = 0.9;
        nextUtterance.onend = () => {
          if (next + 1 < sentences.length) { setCurrentSentenceIdx(next + 1); window.speechSynthesis.speak(nextUtterance); }
          else { setIsReading(false); setCurrentSentenceIdx(-1); }
        };
        window.speechSynthesis.speak(nextUtterance);
      } else {
        setIsReading(false);
        setCurrentSentenceIdx(-1);
      }
    };
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [currentSentenceIdx, sentences]);

  const restartReading = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setCurrentSentenceIdx(0);
    setIsReading(true);
    setIsPaused(false);

    const speakSentence = (idx: number) => {
      if (idx >= sentences.length) { setIsReading(false); setCurrentSentenceIdx(-1); return; }
      const utterance = new SpeechSynthesisUtterance(sentences[idx]);
      utterance.rate = 0.8;
      utterance.onend = () => { const next = idx + 1; setCurrentSentenceIdx(next); speakSentence(next); };
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };
    speakSentence(0);
  }, [sentences]);

  const stopReading = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsReading(false);
    setIsPaused(false);
    setCurrentSentenceIdx(-1);
  }, []);

  const handleWordClick = async (rawWord: string, contextSentence?: string) => {
    const cleanWord = rawWord.replace(/[^\w]/g, '').toLowerCase();
    if (!cleanWord) return;
    speakEnglish(cleanWord);
    setIsWordLoading(true);
    setSelectedWord({
      word: cleanWord,
      pronunciation: `/${cleanWord}/`,
      partOfSpeech: '',
      definition: '',
      translation: 'AI tərcümə edir...',
      example: '',
      contextSentence: contextSentence || '',
      isSaved: false,
      isFavorite: false,
      isLearned: false,
    });
    try {
      const def = await getMockWordDefinition(cleanWord, contextSentence);
      setSelectedWord(def);
      trackedWordsRef.current.add(cleanWord);
    } catch {
      // keep initial fallback
    } finally {
      setIsWordLoading(false);
    }
  };

  // Chapter quiz flow
  const startChapterQuiz = async () => {
    if (!story || !chapters[currentChapter]) return;
    setQuizLoading(true);
    setChapterQuizState((prev) => ({ ...prev, [currentChapter]: 'active' }));
    const currentCh = chapters[currentChapter];
    let q = await quizService.getQuiz(story.id, currentCh?.id);

    if (!q || !q.questions || q.questions.length === 0) {
      const textWords = (currentCh.title + ' ' + (currentCh.content || '')).replace(/[^\w\s]/g, '').split(/\s+/).filter((w) => w.length >= 3);
      const wordsPool = Array.from(new Set(textWords)).slice(0, 5);
      const sampleWords = wordsPool.length >= 2 ? wordsPool : ['Beginning', 'Reading', 'Story', 'Learning'];

      const fallbackQuestions = sampleWords.map((word, i) => {
        const cleanWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        return {
          id: `fallback-${i}`,
          type: 'comprehension' as const,
          question: `What is the best translation/meaning of "${cleanWord}"?`,
          options: [cleanWord, `${cleanWord} (Verb)`, `${cleanWord} (Noun)`, `${cleanWord} (Action)`].sort(() => Math.random() - 0.5),
          correctAnswer: cleanWord,
        };
      });

      q = {
        id: 'chapter-quiz',
        storyId: story.id,
        storyTitle: story.title,
        questions: fallbackQuestions,
      };
    }
    let userH = quizHearts;
    try {
      const u = await userService.getProfile();
      if (u) {
        setUserPlan(u.plan);
        const isUnlimited = u.plan === 'pro' || u.plan === 'premium' || (u as any).currentTier === 'Pro' || (u as any).currentTier === 'Premium';
        userH = isUnlimited ? MAX_HEARTS : (u.hearts ?? 0);
      }
    } catch {}

    setQuiz(q);
    setQuizQ(0);
    setQuizSelected('');
    setQuizMatchSelected({});
    setQuizShowFeedback(false);
    setQuizHearts(userH);
    setQuizScore(0);
    setQuizCorrectCount(0);
    setQuizIncorrectCount(0);
    setQuizResult(null);
    setCorrectStreak(0);
    setQuizTimer(15);
    setLingoMood('thinking');
    setQuizLoading(false);
  };

  const checkMatchAnswer = (question: QuizQuestion): boolean => {
    if (!question.pairs) return false;
    const correctPairs = question.pairs.map((p) => `${p.left}:${p.right}`);
    const selectedPairs = Object.entries(quizMatchSelected).map(([left, right]) => `${left}:${right}`);
    return correctPairs.length === selectedPairs.length && correctPairs.every((cp) => selectedPairs.includes(cp));
  };

  const handleQuizSubmit = () => {
    if (!quiz) return;
    const question = quiz.questions[quizQ];
    let correct: boolean;

    if (question.type === 'match') {
      correct = checkMatchAnswer(question);
    } else {
      correct = quizSelected.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    }

    setQuizIsCorrect(correct);
    setQuizShowFeedback(true);

    if (correct) {
      const newScore = quizScore + 1;
      const newCorrect = quizCorrectCount + 1;
      const newStreak = correctStreak + 1;
      setQuizScore(newScore);
      setQuizCorrectCount(newCorrect);
      setLingoMood('happy');
      showBubble(['Excellent!', 'Great Job!', 'Awesome!'][Math.floor(Math.random() * 3)]);

      // Every 3 correct answers = +1 heart
      if (newStreak % 3 === 0 && quizHearts < MAX_HEARTS) {
        const newHearts = quizHearts + 1;
        setQuizHearts(newHearts);
        setHeartGainedIdx(newHearts - 1);
        setTimeout(() => setHeartGainedIdx(null), 700);
        showBubble('+1 Heart!');
        userService.updateProfile({ hearts: newHearts }).then(() => {
          window.dispatchEvent(new Event('profile-updated'));
        }).catch(() => {});
      }
      setCorrectStreak(newStreak);
    } else {
      const newIncorrect = quizIncorrectCount + 1;
      setQuizIncorrectCount(newIncorrect);
      setLingoMood('sad');
      setCorrectStreak(0);

      setQuizHearts((prevHearts) => {
        const newHearts = Math.max(0, prevHearts - 1);
        setHeartLostIdx(newHearts);
        setTimeout(() => setHeartLostIdx(null), 700);
        userService.updateProfile({ hearts: newHearts }).then(() => {
          window.dispatchEvent(new Event('profile-updated'));
        }).catch(() => {});
        if (newHearts === 0) {
          const target = Date.now() + 4 * 60 * 60 * 1000;
          localStorage.setItem('readlingo_heart_recovery_target', target.toString());
          setHeartCountdown(4 * 60 * 60 * 1000);
        }
        return newHearts;
      });

      showBubble(['Try again!', 'Almost!', "Don't give up!"][Math.floor(Math.random() * 3)]);
    }
  };

  const handleQuizNext = () => {
    if (!quiz) return;
    setQuizShowFeedback(false);
    setQuizSelected('');
    setQuizMatchSelected({});
    setSpeechBubble(null);
    setQuizTimer(15);

    if (quizQ < quiz.questions.length - 1) {
      setQuizQ(quizQ + 1);
      setLingoMood('thinking');
    } else {
      // Quiz complete
      const accuracy = Math.round((quizScore / quiz.questions.length) * 100);
      const xpEarned = quizScore * 20;
      const result: QuizResult = {
        score: quizScore,
        totalQuestions: quiz.questions.length,
        accuracy,
        xpEarned,
        heartsRemaining: quizHearts,
        correctAnswers: quizCorrectCount,
        incorrectAnswers: quizIncorrectCount,
      };
      setQuizResult(result);
      fireConfetti();
      setLingoMood('celebrate' as 'happy');

      const currentCh = chapters[currentChapter];
      quizService.recordQuizResult({
        storyId: id!,
        chapterId: currentCh?.id,
        correctAnswers: quizCorrectCount,
        incorrectAnswers: quizIncorrectCount,
        xpEarned,
        remainingHearts: quizHearts,
      }).catch(() => {});
    }
  };

  // 15-second per-question timer
  useEffect(() => {
    if (!quiz || quizShowFeedback || quizResult) return;
    if (quizTimer <= 0) {
      handleQuizSubmit();
      return;
    }
    const interval = setInterval(() => setQuizTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [quiz, quizShowFeedback, quizResult, quizTimer]);

  const handleQuizComplete = () => {
    // Mark chapter as completed, unlock next
    setChapterQuizState((prev) => ({ ...prev, [currentChapter]: 'completed' }));
    setQuiz(null);
    setQuizResult(null);

    if (currentChapter < chapters.length - 1) {
      setChapterQuizState((prev) => ({ ...prev, [currentChapter + 1]: 'active' }));
      setCurrentChapter(currentChapter + 1);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (story) {
      storyService.updateProgress(story.id, 100);
      setShowFinish(true);
    }
  };

  const handleNextChapter = async () => {
    // If current chapter quiz not completed, require quiz
    if (chapterQuizState[currentChapter] !== 'completed') {
      if (isFreeUser && quizHearts === 0) return; // locked, can't start
      startChapterQuiz();
      return;
    }
    if (currentChapter < chapters.length - 1) {
      setCurrentChapter(currentChapter + 1);
      contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (story) {
      await storyService.updateProgress(story.id, 100);
      setShowFinish(true);
    }
  };

  if (loading) return <AppLayout><LoadingState message="Loading story..." /></AppLayout>;
  if (!story)
    return (
      <AppLayout>
        <div className="container-app py-16 text-center max-w-lg mx-auto">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="flex justify-center mb-5">
              <LingoMascot variant="thinking" size={100} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-700 dark:text-amber-300 mb-3">
              <BookOpen size={13} className="text-amber-500" />
              <span>Gündəlik Hekayə Limiti</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">
              Gündəlik Oxuma Limiti Bitib! 📖
            </h1>
            <p className="text-surface-600 dark:text-surface-300 text-sm leading-relaxed mb-5">
              Pulsuz planda gündəlik maksimum 3 hekayə oxumaq mümkündür. Bugünkü oxuma limitiniz tamamlandı və ya bu hekayə kilidlidir.
            </p>

            {/* Live Midnight Countdown */}
            <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/70 border border-surface-200 dark:border-surface-700 mb-6 inline-flex flex-col items-center shadow-soft">
              <div className="flex items-center gap-1.5 text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">
                <Clock size={14} className="text-primary-500 animate-pulse" />
                <span>Gündəlik limitin sıfırlanmasına qalan vaxt:</span>
              </div>
              <div className="font-mono font-bold text-2xl text-primary-600 dark:text-primary-400 tracking-wider bg-white dark:bg-surface-900 px-5 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700 shadow-inner">
                {formatCountdown(midnightCountdown)}
              </div>
              <span className="text-[11px] text-surface-400 mt-1.5">
                🌙 Hər gecə saat 00:00-da yeni oxuma limiti aktivləşir
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/pricing" className="flex-1">
                <Button variant="gradient" size="lg" fullWidth className="shadow-md">
                  <Zap size={18} className="mr-1.5 fill-white" /> PRO Plana Keç (Limitsiz Oxu)
                </Button>
              </Link>
              <Link to="/library" className="flex-1">
                <Button variant="secondary" size="lg" fullWidth>
                  Kitabxanaya Qayıt
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </AppLayout>
    );

  if (showFinish) return (
    <AppLayout>
      <div className="container-app py-16 max-w-md text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <div className="flex justify-center mb-6"><LingoMascot variant="celebrate" size={120} /></div>
          <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">Great Job!</h1>
          <p className="text-surface-500 dark:text-surface-400 mb-8">You finished "{story.title}"!</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/library"><Button variant="gradient" size="lg" rightIcon={<ArrowRight size={18} />}>Browse More Stories</Button></Link>
            <Link to="/dashboard"><Button variant="secondary" size="lg">Back to Dashboard</Button></Link>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );

  const chapter = chapters[currentChapter];
  const paragraphs = chapter?.content.split('\n\n') || [];
  const progress = ((currentChapter + 1) / chapters.length) * 100;
  const fontSizeClass = { sm: 'text-base leading-relaxed', md: 'text-lg leading-relaxed', lg: 'text-xl leading-loose' }[fontSize];
  const theme = themeStyles[readingTheme];

  // Render paragraph with sentence highlighting
  const renderParagraphWithHighlight = (para: string, pIdx: number) => {
    const paraSentences = para.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
    let runningIdx = 0;
    for (let i = 0; i < pIdx; i++) {
      runningIdx += paragraphs[i].split(/(?<=[.!?])\s+/).filter((s) => s.trim()).length;
    }

    return paraSentences.map((sentence, sIdx) => {
      const globalIdx = runningIdx + sIdx;
      const isCurrent = currentSentenceIdx === globalIdx && isReading && !isPaused;
      const words = sentence.split(/(\s+)/);
      return (
        <span key={sIdx} className={`transition-colors duration-300 rounded-md ${isCurrent ? 'bg-primary-100 dark:bg-primary-500/20 px-1 -mx-1' : ''}`}>
          {words.map((word, wIdx) => {
            const clean = word.replace(/[^\w]/g, '').toLowerCase();
            if (clean.length === 0) return word;
            return (
              <span
                key={`${sIdx}-${wIdx}`}
                onClick={() => handleWordClick(clean, sentence.trim())}
                className="cursor-pointer rounded px-0.5 hover:bg-primary-50 dark:hover:bg-primary-500/10 hover:text-primary-700 dark:hover:text-primary-300 border-b border-dotted border-surface-300 dark:border-surface-600"
              >
                {word}
              </span>
            );
          })}
          {sIdx < paraSentences.length - 1 ? ' ' : ''}
        </span>
      );
    });
  };

  // Quiz UI rendering
  const renderQuiz = () => {
    if (quizLoading) {
      return (
        <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/20 animate-pulse">
              <div className="w-full h-full bg-white dark:bg-surface-900 rounded-[22px] flex items-center justify-center">
                <LingoMascot variant="thinking" size={56} />
              </div>
            </div>
            <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg animate-bounce">
              <Sparkles size={14} />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3">
            <Loader2 size={13} className="animate-spin" />
            <span>AI Quiz Hazırlayır...</span>
          </div>

          <h3 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-2">
            Hekayə Üzrə Quiz Hazırlanır
          </h3>
          <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 max-w-sm mx-auto mb-5 leading-relaxed">
            Süni intellekt bu fəslin məzmununu analiz edir, oxuyub-anlama və lüğət suallarını tərtib edir. Zəhmət olmasa bir neçə saniyə gözləyin...
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-xs font-medium text-surface-600 dark:text-surface-300 animate-pulse">
              <BookOpen size={12} className="text-primary-500" /> Mətn oxunur
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-xs font-medium text-surface-600 dark:text-surface-300 animate-pulse" style={{ animationDelay: '300ms' }}>
              <Brain size={12} className="text-purple-500" /> Suallar tərtib edilir
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-xs font-medium text-surface-600 dark:text-surface-300 animate-pulse" style={{ animationDelay: '600ms' }}>
              <Sparkles size={12} className="text-amber-500" /> Variantlar qarışdırılır
            </span>
          </div>
        </div>
      );
    }
    if (!quiz) return null;

    if (isFreeUser && quizHearts <= 0) {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
          <div className="flex justify-center mb-5">
            <LingoMascot variant="sad" size={90} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger-50 dark:bg-danger-950/40 border border-danger-200 dark:border-danger-800 text-xs font-bold text-danger-600 dark:text-danger-400 mb-3">
            <Heart size={13} className="fill-danger-500 text-danger-500" />
            <span>0 Can Qaldı</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">
            Canlarınız Bitdi! 💔
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 max-w-md mx-auto mb-4 leading-relaxed">
            Pulsuz planda səhvlər nəticəsində canlarınız tükəndi. Testə və oxumağa fasiləsiz davam etmək üçün <span className="font-bold text-primary-600 dark:text-primary-400">PRO Plana</span> keçin (Limitsiz canlar)!
          </p>

          {/* Live Heart Countdown Timer */}
          <div className="p-4 rounded-2xl bg-surface-100/90 dark:bg-surface-800/90 border border-surface-200 dark:border-surface-700 mb-6 inline-flex flex-col items-center shadow-soft">
            <div className="flex items-center gap-1.5 text-xs font-medium text-surface-500 dark:text-surface-400 mb-1.5">
              <Clock size={14} className="text-danger-500 animate-pulse" />
              <span>Növbəti canın bərpasına qalan vaxt:</span>
            </div>
            <div className="font-mono font-bold text-2xl text-danger-600 dark:text-danger-400 tracking-wider bg-white dark:bg-surface-900 px-5 py-1.5 rounded-xl border border-surface-200 dark:border-surface-700 shadow-inner">
              {formatCountdown(heartCountdown)}
            </div>
            <span className="text-[11px] text-surface-400 mt-1.5">
              ⏰ Hər 4 saatdan bir canlar avtomatik bərpa olunur
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/pricing">
              <Button variant="gradient" size="lg" className="w-full sm:w-auto shadow-md">
                <Zap size={18} className="mr-1.5 fill-white" /> PRO Plana Keç (Limitsiz Can)
              </Button>
            </Link>
            <Button variant="secondary" size="lg" onClick={() => setQuiz(null)}>
              Hekayəyə Qayıt
            </Button>
          </div>
        </motion.div>
      );
    }

    if (quizResult) {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="text-center py-8">
          <div className="flex justify-center mb-6"><LingoMascot variant="celebrate" size={100} /></div>
          <h2 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">Quiz Complete!</h2>
          <p className="text-surface-500 dark:text-surface-400 mb-6">{quiz.storyTitle} — Chapter {currentChapter + 1}</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 max-w-lg mx-auto">
            {[
              { icon: Target, label: 'Score', value: `${quizResult.score}/${quizResult.totalQuestions}`, color: 'primary' },
              { icon: CheckCircle2, label: 'Correct', value: quizResult.correctAnswers, color: 'success' },
              { icon: X, label: 'Incorrect', value: quizResult.incorrectAnswers, color: 'danger' },
              { icon: Zap, label: 'XP', value: `+${quizResult.xpEarned}`, color: 'warning' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <Icon size={20} className={`text-${stat.color}-500 mx-auto mb-1`} />
                  <p className="font-display font-bold text-lg text-surface-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-surface-400">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-1 mb-6">
            {Array.from({ length: MAX_HEARTS }).map((_, i) => (
              <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5 + i * 0.05, type: 'spring' }}>
                <Heart size={20} className={i < quizResult.heartsRemaining ? 'text-danger-500 fill-danger-500' : 'text-surface-200 dark:text-surface-700'} />
              </motion.div>
            ))}
          </div>
          <Button variant="gradient" size="lg" onClick={handleQuizComplete} rightIcon={<ArrowRight size={18} />}>
            {currentChapter < chapters.length - 1 ? 'Continue Reading' : 'Finish Story'}
          </Button>
        </motion.div>
      );
    }

    const question = quiz.questions[quizQ];
    const quizProgress = ((quizQ + 1) / quiz.questions.length) * 100;

    return (
      <div>
        {/* Hearts display */}
        <div className="mb-6">
          <div className="flex items-center justify-center gap-1 mb-3">
              {Array.from({ length: MAX_HEARTS }).map((_, i) => (
                <motion.div key={i}
                  animate={heartLostIdx === i ? { scale: [1, 1.5, 0.8, 0], rotate: [0, -15, 15, 0], opacity: [1, 1, 1, 0] } : heartGainedIdx === i ? { scale: [0, 1.5, 1], opacity: [0, 1, 1] } : { scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7 }}
                >
                  <Heart size={22} className={i < quizHearts ? 'text-danger-500 fill-danger-500' : 'text-surface-200 dark:text-surface-700'} />
                </motion.div>
              ))}
            </div>
            {/* Out of hearts message with live countdown */}
            {isFreeUser && quizHearts === 0 && (
              <div className="text-center mt-3">
                <p className="text-sm font-medium text-danger-500">Canlarınız bitib 💔</p>
                <p className="text-xs text-surface-400">Bərpaya qalan vaxt: <span className="font-mono font-bold text-danger-500">{formatCountdown(heartCountdown)}</span></p>
              </div>
            )}
          </div>

        {/* Lingo mascot */}
        <div className="flex items-end gap-4 mb-6 justify-center">
          <motion.div
            animate={quizShowFeedback ? (quizIsCorrect ? { y: [0, -15, 0], rotate: [0, -5, 5, 0] } : { x: [0, -8, 8, -8, 8, 0] }) : { y: [0, -5, 0] }}
            transition={quizShowFeedback ? (quizIsCorrect ? { duration: 0.6, repeat: Infinity, repeatType: 'reverse' } : { duration: 0.4 }) : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <LingoMascot variant={quizShowFeedback ? (quizIsCorrect ? 'happy' : 'sad') : lingoMood} size={72} />
          </motion.div>
          <AnimatePresence>
            {speechBubble && (
              <motion.div initial={{ opacity: 0, scale: 0.5, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5 }} className={`relative px-4 py-3 rounded-2xl shadow-lg mb-2 ${quizIsCorrect ? 'bg-success-500 text-white' : 'bg-warning-500 text-white'}`}>
                <p className="font-display font-bold text-sm whitespace-nowrap">{speechBubble}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-surface-600 dark:text-surface-300">Question {quizQ + 1} of {quiz.questions.length}</span>
            <span className="flex items-center gap-1.5 font-bold text-primary-600 dark:text-primary-400"><Zap size={14} /> {quizScore * (100 / quiz.questions.length) | 0} pts</span>
          </div>
          <ProgressBar value={quizProgress} color="primary" size="md" />
        </div>

        {/* Circular Countdown Timer */}
        <div className="flex justify-center mb-6">
          <motion.div
            animate={quizTimer <= 3 ? { scale: [1, 1.12, 1], opacity: [1, 0.6, 1] } : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, repeat: quizTimer <= 3 ? Infinity : 0 }}
            className="relative w-20 h-20"
          >
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" strokeWidth="8" className="stroke-surface-100 dark:stroke-surface-700" />
              <circle
                cx="50" cy="50" r="42" fill="none" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 42}
                strokeDashoffset={2 * Math.PI * 42 * (1 - quizTimer / 15)}
                className={quizTimer <= 3 ? 'text-danger-500' : quizTimer <= 7 ? 'text-warning-500' : 'text-success-500'}
                stroke="currentColor"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
              />
            </svg>
            <div className={`absolute inset-0 flex items-center justify-center font-display font-bold text-2xl tabular-nums ${quizTimer <= 3 ? 'text-danger-500' : quizTimer <= 7 ? 'text-warning-500' : 'text-success-500'}`}>
              {quizTimer}
            </div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={quizQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <div className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge color="primary">{question.type.replace('_', ' ').toUpperCase()}</Badge>
                {question.word && <Badge color="surface">{question.word}</Badge>}
              </div>
              <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-4">{question.question}</h2>
              {question.contextSentence && (
                <div className="mb-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 border-l-4 border-primary-400">
                  <p className="text-sm italic text-surface-600 dark:text-surface-300">"{question.contextSentence}"</p>
                </div>
              )}

              {/* Multiple Choice */}
              {question.type === 'multiple_choice' && question.options && (
                <div className="space-y-3">
                  {question.options.map((opt, i) => {
                    const isCorrectOpt = quizShowFeedback && opt === question.correctAnswer;
                    const isWrongSelected = quizShowFeedback && quizSelected === opt && opt !== question.correctAnswer;
                    return (
                      <motion.button key={opt} onClick={() => !quizShowFeedback && setQuizSelected(opt)} disabled={quizShowFeedback}
                        animate={isCorrectOpt ? { scale: [1, 1.03, 1] } : isWrongSelected ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${isCorrectOpt ? 'border-success-500 bg-success-50 dark:bg-success-500/10' : isWrongSelected ? 'border-danger-500 bg-danger-50 dark:bg-danger-500/10' : quizSelected === opt ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isCorrectOpt ? 'bg-success-500 text-white' : isWrongSelected ? 'bg-danger-500 text-white' : quizSelected === opt ? 'bg-primary-500 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-500'}`}>{String.fromCharCode(65 + i)}</span>
                          <span className="text-sm font-medium text-surface-900 dark:text-white">{opt}</span>
                        </span>
                        {isCorrectOpt && <CheckCircle2 size={20} className="text-success-500" />}
                        {isWrongSelected && <X size={20} className="text-danger-500" />}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* True / False */}
              {question.type === 'true_false' && question.options && (
                <div className="grid grid-cols-2 gap-3">
                  {question.options.map((opt) => {
                    const isCorrectOpt = quizShowFeedback && opt === question.correctAnswer;
                    const isWrongSelected = quizShowFeedback && quizSelected === opt && opt !== question.correctAnswer;
                    return (
                      <motion.button key={opt} onClick={() => !quizShowFeedback && setQuizSelected(opt)} disabled={quizShowFeedback}
                        animate={isCorrectOpt ? { scale: [1, 1.05, 1] } : isWrongSelected ? { x: [0, -6, 6, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className={`p-6 rounded-xl border-2 transition-all text-center font-display font-bold text-lg ${isCorrectOpt ? 'border-success-500 bg-success-50 dark:bg-success-500/10 text-success-600' : isWrongSelected ? 'border-danger-500 bg-danger-50 dark:bg-danger-500/10 text-danger-600' : quizSelected === opt ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600' : 'border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-200 hover:border-surface-300'}`}
                      >
                        {opt === 'True' ? <CheckCircle2 size={28} className="mx-auto mb-2" /> : <X size={28} className="mx-auto mb-2" />}
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Fill in the Blank */}
              {question.type === 'fill_blank' && (
                <input type="text" value={quizSelected} onChange={(e) => !quizShowFeedback && setQuizSelected(e.target.value)} disabled={quizShowFeedback} placeholder="Type your answer..." className="input text-lg" onKeyDown={(e) => e.key === 'Enter' && !quizShowFeedback && handleQuizSubmit()} />
              )}

              {/* Match the Word with its Meaning */}
              {question.type === 'match' && question.pairs && (
                <div className="space-y-3">
                  {question.pairs.map((pair) => (
                    <div key={pair.left} className="flex items-center gap-3">
                      <div className="flex-1 p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 border-2 border-primary-200 dark:border-primary-700 text-sm font-medium text-surface-900 dark:text-white">{pair.left}</div>
                      <span className="text-surface-400">→</span>
                      <select
                        value={quizMatchSelected[pair.left] || ''}
                        onChange={(e) => !quizShowFeedback && setQuizMatchSelected({ ...quizMatchSelected, [pair.left]: e.target.value })}
                        disabled={quizShowFeedback}
                        className={`flex-1 p-3 rounded-xl border-2 outline-none transition-colors ${quizShowFeedback ? (quizMatchSelected[pair.left] === pair.right ? 'border-success-500 bg-success-50 dark:bg-success-500/10' : 'border-danger-500 bg-danger-50 dark:bg-danger-500/10') : 'border-surface-200 dark:border-surface-700 focus:border-primary-500'} bg-white dark:bg-surface-800 text-sm font-medium text-surface-900 dark:text-white`}
                      >
                        <option value="">Select meaning...</option>
                        {[...question.pairs!].sort(() => Math.random() - 0.5).map((p) => <option key={p.right} value={p.right}>{p.right}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Reading Comprehension & Multiple Choice */}
              {(question.type === 'comprehension' || question.type === 'multiple_choice') && question.options && (
                <div className="space-y-3">
                  {question.options.map((opt, i) => {
                    const isCorrectOpt = quizShowFeedback && opt.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
                    const isWrongSelected = quizShowFeedback && quizSelected.trim().toLowerCase() === opt.trim().toLowerCase() && opt.trim().toLowerCase() !== question.correctAnswer.trim().toLowerCase();
                    return (
                      <motion.button key={opt} onClick={() => !quizShowFeedback && setQuizSelected(opt)} disabled={quizShowFeedback}
                        animate={isCorrectOpt ? { scale: [1, 1.03, 1] } : isWrongSelected ? { x: [0, -6, 6, -6, 6, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${isCorrectOpt ? 'border-success-500 bg-success-50 dark:bg-success-500/10' : isWrongSelected ? 'border-danger-500 bg-danger-50 dark:bg-danger-500/10' : quizSelected === opt ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'}`}
                      >
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isCorrectOpt ? 'bg-success-500 text-white' : isWrongSelected ? 'bg-danger-500 text-white' : quizSelected === opt ? 'bg-primary-500 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-500'}`}>{String.fromCharCode(65 + i)}</span>
                        <span className="text-sm font-medium text-surface-900 dark:text-white">{opt}</span>
                        {isCorrectOpt && <CheckCircle2 size={20} className="text-success-500 ml-auto" />}
                        {isWrongSelected && <X size={20} className="text-danger-500 ml-auto" />}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* AI Explanation Feedback */}
              {quizShowFeedback && question.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs sm:text-sm text-blue-900 dark:text-blue-200"
                >
                  <strong className="font-semibold block mb-0.5">💡 İzah (Explanation):</strong>
                  {question.explanation}
                </motion.div>
              )}

              {/* Submit / Next button */}
              <div className="mt-6 flex justify-end">
                {!quizShowFeedback ? (
                  <Button variant="gradient" size="lg" onClick={handleQuizSubmit}
                    disabled={question.type === 'match' ? Object.keys(quizMatchSelected).length !== (question.pairs?.length || 0) : !quizSelected}>
                    Submit Answer
                  </Button>
                ) : (
                  <Button variant="gradient" size="lg" onClick={handleQuizNext} rightIcon={<ArrowRight size={18} />}>
                    {quizQ < quiz.questions.length - 1 ? 'Next Question' : 'See Results'}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className={isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto bg-surface-900' : 'container-app py-8 max-w-4xl'}>
        {!isFullscreen && <Link to={`/story/${story.id}`} className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors mb-6"><ArrowLeft size={16} /> Back to Details</Link>}
        {!isFullscreen && (
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            <div className="w-full sm:w-40 h-52 rounded-2xl overflow-hidden shadow-card shrink-0"><img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3"><Badge color="primary">{story.category}</Badge><Badge color={getDifficultyColor(story.difficulty)}>{story.difficulty}</Badge></div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-2">{story.title}</h1>
              <p className="text-surface-500 dark:text-surface-400 mb-4">by {story.author}</p>
              <div className="flex items-center gap-4 text-sm text-surface-400 mb-4">
                <span className="flex items-center gap-1"><Clock size={14} /> {story.readingTimeMinutes} min</span>
                <span className="flex items-center gap-1"><BookOpen size={14} /> {story.wordCount.toLocaleString()} words</span>
                <span className="flex items-center gap-1"><Star size={14} className="fill-warning-400 text-warning-400" /> {story.rating}</span>
              </div>
            </div>
          </div>
        )}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-surface-600 dark:text-surface-300">Chapter {currentChapter + 1} of {chapters.length}</span><span className="text-sm text-surface-400">{Math.round(progress)}% complete</span></div>
          <ProgressBar value={progress} color="primary" size="md" />
        </div>

        {/* Read Aloud Controls */}
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="flex items-center gap-2">
            {/* Read Aloud */}
            <div className="flex items-center gap-1 bg-surface-50 dark:bg-surface-800 rounded-lg p-1">
              <span className="text-xs text-surface-400 ml-1.5 mr-0.5 hidden sm:flex items-center gap-1"><Volume2 size={14} /> Read Aloud</span>
              {!isReading && !isPaused && (
                <button onClick={startReading} className="p-1.5 rounded text-xs font-medium transition-colors bg-primary-500 text-white hover:bg-primary-600 flex items-center gap-1"><Play size={14} /> Play</button>
              )}
              {isReading && !isPaused && (
                <button onClick={pauseReading} className="p-1.5 rounded text-xs font-medium transition-colors bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-200 hover:bg-surface-300 dark:hover:bg-surface-600 flex items-center gap-1"><Pause size={14} /> Pause</button>
              )}
              {isPaused && (
                <button onClick={resumeReading} className="p-1.5 rounded text-xs font-medium transition-colors bg-success-500 text-white hover:bg-success-600 flex items-center gap-1"><Play size={14} /> Resume</button>
              )}
              {(isReading || isPaused) && (
                <button onClick={restartReading} className="p-1.5 rounded text-xs font-medium transition-colors text-surface-500 hover:bg-surface-200 dark:hover:bg-surface-700 flex items-center gap-1"><RotateCcw size={14} /> Restart</button>
              )}
              {(isReading || isPaused) && (
                <button onClick={stopReading} className="p-1.5 rounded text-xs font-medium transition-colors text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 flex items-center gap-1"><X size={14} /> Stop</button>
              )}
            </div>
            {/* Font Size */}
            <div className="flex items-center gap-1 bg-surface-50 dark:bg-surface-800 rounded-lg p-1">
              <Type size={14} className="text-surface-400 ml-1.5" />
              {(['sm', 'md', 'lg'] as const).map((s) => <button key={s} onClick={() => setFontSize(s)} className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${fontSize === s ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-soft' : 'text-surface-400'}`}>{s === 'sm' ? 'A' : s === 'md' ? 'A+' : 'A++'}</button>)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-surface-50 dark:bg-surface-800 rounded-lg p-1">
              {(['light', 'sepia', 'dark'] as const).map((th) => { const Icon = th === 'light' ? Sun : th === 'sepia' ? Languages : Moon; return <button key={th} onClick={() => setReadingTheme(th)} className={`p-1.5 rounded transition-colors ${readingTheme === th ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-soft' : 'text-surface-400'}`}><Icon size={14} /></button>; })}
            </div>
            <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 rounded-lg bg-surface-50 dark:bg-surface-800 text-surface-400 hover:text-primary-500 transition-colors">{isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}</button>
          </div>
        </div>

        {/* Chapter content or Quiz */}
        {quiz || quizResult || quizLoading ? (
          <div className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50 p-6 mb-6">
            <div className="flex items-center gap-2 mb-6 justify-center">
              <HelpCircle size={24} className="text-primary-500" />
              <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white">Chapter {currentChapter + 1} Quiz</h2>
            </div>
            {renderQuiz()}
          </div>
        ) : (
          <div className={`rounded-2xl border ${theme.card} p-8 lg:p-12 mb-6`}>
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-surface-100 dark:border-surface-800">
              <div><p className="text-xs text-surface-400 mb-1">Chapter {chapter?.chapterNumber}</p><h2 className={`font-display text-2xl font-bold ${theme.text}`}>{chapter?.title}</h2></div>
              <LingoMascot variant="reading" size={48} />
            </div>
            <div ref={contentRef} className={`max-w-none ${fontSizeClass}`}>
              {paragraphs.map((para, i) => <p key={i} className={`mb-5 ${theme.text}`}>{renderParagraphWithHighlight(para, i)}</p>)}
            </div>
          </div>
        )}

        {/* Navigation */}
        {!quiz && !quizResult && !quizLoading && (
          <div className="flex items-center justify-between gap-4">
            <Button variant="secondary" onClick={() => { stopReading(); setCurrentChapter(Math.max(0, currentChapter - 1)); }} disabled={currentChapter === 0} leftIcon={<ArrowLeft size={18} />}>Previous</Button>
            <div className="flex gap-1.5">
              {chapters.map((ch, i) => (
                <button key={ch.id} onClick={() => { stopReading(); setCurrentChapter(i); }} className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all flex items-center justify-center ${i === currentChapter ? 'bg-primary-600 text-white' : chapterQuizState[i] === 'completed' ? 'bg-success-100 dark:bg-success-500/20 text-success-600' : chapterQuizState[i] === 'locked' ? 'bg-surface-100 dark:bg-surface-800 text-surface-300 dark:text-surface-600' : 'bg-surface-100 dark:bg-surface-800 text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700'}`}>
                  {chapterQuizState[i] === 'completed' && i !== currentChapter ? <CheckCircle2 size={14} className="mx-auto" /> : chapterQuizState[i] === 'locked' ? <Lock size={12} className="mx-auto" /> : i + 1}
                </button>
              ))}
            </div>
            {isFreeUser && quizHearts === 0 && chapterQuizState[currentChapter] !== 'completed' ? (
              <Button variant="secondary" disabled leftIcon={<Lock size={18} />}>Next Page</Button>
            ) : (
              <Button
                variant="gradient"
                onClick={handleNextChapter}
                disabled={quizLoading}
                rightIcon={
                  quizLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : chapterQuizState[currentChapter] === 'completed' ? (
                    currentChapter < chapters.length - 1 ? <ArrowRight size={18} /> : <CheckCircle2 size={18} />
                  ) : (
                    <HelpCircle size={18} />
                  )
                }
              >
                {quizLoading ? 'AI Quiz Hazırlayır...' : chapterQuizState[currentChapter] === 'completed' ? (currentChapter < chapters.length - 1 ? 'Next' : 'Finish') : 'Take Quiz'}
              </Button>
            )}
          </div>
        )}

        {isFreeUser && quizHearts === 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-warning-500/10 via-primary-500/10 to-danger-500/10 border border-warning-500/30 text-center">
            <div className="flex justify-center mb-3">
              <LingoMascot variant="thinking" size={64} />
            </div>
            <h3 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-2">
              Out of Hearts! (Canlarınız bitib 💔)
            </h3>
            <p className="text-sm text-surface-600 dark:text-surface-300 max-w-md mx-auto mb-3">
              Hekayə oxumağa və quizləri limitsiz keçməyə davam etmək üçün <span className="font-bold text-primary-600 dark:text-primary-400">PRO Plan</span>-a yüksəldin və ♾️ Sonsuz Can əldə edin!
            </p>

            {/* Live Heart Recovery Countdown */}
            <div className="my-3 p-3.5 rounded-2xl bg-surface-100/90 dark:bg-surface-800/90 border border-surface-200 dark:border-surface-700 inline-flex flex-col items-center shadow-soft">
              <div className="flex items-center gap-1.5 text-xs font-medium text-surface-500 dark:text-surface-400 mb-1">
                <Clock size={14} className="text-danger-500 animate-pulse" />
                <span>Növbəti canın bərpasına qalan vaxt:</span>
              </div>
              <div className="font-mono font-bold text-xl text-danger-600 dark:text-danger-400 tracking-wider bg-white dark:bg-surface-900 px-4 py-1 rounded-xl border border-surface-200 dark:border-surface-700 shadow-inner">
                {formatCountdown(heartCountdown)}
              </div>
              <span className="text-[10px] text-surface-400 mt-1">
                ⏰ Hər 4 saatdan bir canlar avtomatik bərpa olunur
              </span>
            </div>

            <div className="mt-2">
              <Link to="/pricing">
                <Button variant="gradient" size="md" className="shadow-lg">
                  <Zap size={18} className="mr-1 fill-white" /> Upgrade to PRO - Limitsiz Oxu
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {selectedWord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setSelectedWord(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-display text-2xl font-bold text-surface-900 dark:text-white capitalize">
                    {selectedWord.word}
                  </h3>
                  {selectedWord.partOfSpeech && selectedWord.partOfSpeech !== 'word' && (
                    <Badge color="primary">
                      {(() => {
                        const p = selectedWord.partOfSpeech.toLowerCase().trim();
                        const map: Record<string, string> = {
                          verb: 'Fel (Verb)',
                          noun: 'İsim (Noun)',
                          adjective: 'Sifət (Adjective)',
                          adverb: 'Zərf (Adverb)',
                          pronoun: 'Əvəzlik (Pronoun)',
                          preposition: 'Ön qoşma (Preposition)',
                          conjunction: 'Bağlayıcı (Conjunction)',
                          interjection: 'Nida (Interjection)',
                          numeral: 'Say (Numeral)',
                          determiner: 'Təyinedici (Determiner)',
                        };
                        return map[p] || selectedWord.partOfSpeech;
                      })()}
                    </Badge>
                  )}
                  {selectedWord.lemma && selectedWord.lemma.toLowerCase() !== selectedWord.word.toLowerCase() && (
                    <span className="text-xs px-2 py-0.5 rounded-md bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 font-medium">
                      Kök: <strong className="text-surface-700 dark:text-surface-200">{selectedWord.lemma}</strong>
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-surface-400">
                  {selectedWord.pronunciation}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => speakEnglish(selectedWord.word)}
                  className="p-2 rounded-xl bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-all flex items-center justify-center hover:scale-105 active:scale-95"
                  title="Səsləndir (EN)"
                >
                  <Volume2 size={18} />
                </button>
                <button onClick={() => setSelectedWord(null)} className="p-2 rounded-full text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Translation Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-transparent border border-primary-200/60 dark:border-primary-800/60 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400 block mb-1">
                Azərbaycan dilində tərcüməsi
              </span>
              <p className="font-display text-xl font-bold text-surface-900 dark:text-white capitalize flex items-center gap-2">
                {selectedWord.translation}
                {isWordLoading && <Loader2 size={16} className="animate-spin text-primary-500" />}
              </p>
            </div>

            {/* Context Sentence in Story */}
            {selectedWord.contextSentence && (
              <div className="p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-800/60 border border-surface-200 dark:border-surface-700 mb-3">
                <span className="text-[11px] font-semibold text-surface-400 block mb-1 uppercase tracking-wider">
                  Cümlə daxilində (Hekayədə):
                </span>
                <p className="text-sm text-surface-700 dark:text-surface-200 leading-relaxed italic">
                  "{selectedWord.contextSentence.split(new RegExp(`(\\b${selectedWord.word}\\b)`, 'gi')).map((part, i) =>
                    part.toLowerCase() === selectedWord.word.toLowerCase() ? (
                      <span key={i} className="font-bold text-primary-600 dark:text-primary-400 bg-primary-100 dark:bg-primary-500/20 px-1 py-0.5 rounded not-italic">
                        {part}
                      </span>
                    ) : (
                      part
                    )
                  )}"
                </p>
              </div>
            )}

            {/* AI Contextual Definition (EN & AZ) */}
            {(selectedWord.definitionEn || selectedWord.definitionAz || selectedWord.definition) && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-200/60 dark:border-indigo-800/40 mb-3 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <Sparkles size={14} className="animate-pulse" />
                  <span>AI Kontekst İzahı (Cümləyə Uyğun)</span>
                </div>

                {selectedWord.definitionEn && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 block mb-0.5">
                      🇬🇧 İngiliscə Tərif (Definition)
                    </span>
                    <p className="text-xs sm:text-sm text-surface-800 dark:text-surface-200 leading-relaxed font-medium">
                      {selectedWord.definitionEn}
                    </p>
                  </div>
                )}

                {selectedWord.definitionAz && (
                  <div className="pt-2 border-t border-indigo-100/80 dark:border-indigo-900/40">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 block mb-0.5">
                      🇦🇿 Azərbaycanca İzah (Məna)
                    </span>
                    <p className="text-xs sm:text-sm text-surface-800 dark:text-surface-200 leading-relaxed font-medium">
                      {selectedWord.definitionAz}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              <Button variant="primary" size="md" className="w-full justify-center shadow-md" leftIcon={<Volume2 size={16} />} onClick={() => speakEnglish(selectedWord.word)}>
                Listen (EN)
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AppLayout>
  );
}
