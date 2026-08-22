import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Heart, Zap, RotateCcw, Star, Target, Timer, Sparkles, Brain, BookOpen, Loader2, Clock } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import LingoMascot from '../components/ui/LingoMascot';
import { quizService, userService } from '../services';
import type { Quiz, QuizResult } from '../types';

const MAX_HEARTS = 5;

function fireConfetti() {
  const colors = ['#2563eb', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#2dd4bf'];
  confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 }, colors });
  confetti({ particleCount: 40, spread: 100, origin: { y: 0.6 }, colors, scalar: 0.7 });
}

function formatCountdown(ms: number) {
  const totalSecs = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export default function QuizPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState('');
  const [matchSelected, setMatchSelected] = useState<Record<string, string>>({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [heartLostIndex, setHeartLostIndex] = useState<number | null>(null);
  const [heartGainedIndex, setHeartGainedIndex] = useState<number | null>(null);
  const [correctStreak, setCorrectStreak] = useState(0);
  const [lingoMood, setLingoMood] = useState<'thinking' | 'happy' | 'sad' | 'idle'>('idle');
  const [speechBubble, setSpeechBubble] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isFreeUser, setIsFreeUser] = useState(true);
  const [heartCountdown, setHeartCountdown] = useState<number>(0);

  useEffect(() => {
    if (!isFreeUser || hearts > 0) return;

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
          setHearts(5);
          window.dispatchEvent(new Event('profile-updated'));
        }).catch(() => {});
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isFreeUser, hearts]);

  const questionTimeLimit = quiz?.questions[currentQ]?.timeLimit ?? 15;

  const clearTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    if (showFeedback || result) { clearTimer(); return; }
    setTimeLeft(questionTimeLimit);
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearTimer(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return clearTimer;
  }, [currentQ, showFeedback, result, questionTimeLimit, clearTimer]);


  useEffect(() => {
    if (timeLeft === 0 && !showFeedback && !result) {
      setIsCorrect(false);
      setShowFeedback(true);
      if (isFreeUser) {
        const newHearts = Math.max(0, hearts - 1);
        setHearts(newHearts);
        setHeartLostIndex(hearts - 1);
        setTimeout(() => setHeartLostIndex(null), 700);
        userService.updateProfile({ hearts: newHearts }).then(() => {
          window.dispatchEvent(new Event('profile-updated'));
        }).catch(() => {});
      }
      setIncorrectCount((c) => c + 1);
      setLingoMood('sad');
      setCorrectStreak(0);
      showBubble("Time's up!");
    }
  }, [timeLeft, showFeedback, result, hearts, isFreeUser]);

  useEffect(() => {
    const load = async () => {
      if (!storyId) return;
      try {
        const [q, u] = await Promise.all([
          quizService.getQuiz(storyId),
          userService.getProfile().catch(() => null),
        ]);
        setQuiz(q);
        if (u) {
          const isUnlimited = u.plan === 'pro' || u.plan === 'premium' || (u as any).currentTier === 'Pro' || (u as any).currentTier === 'Premium';
          setIsFreeUser(!isUnlimited);
          setHearts(isUnlimited ? MAX_HEARTS : (u.hearts ?? MAX_HEARTS));
        }
      } catch (err) {
        console.error('Quiz load error:', err);
      } finally {
        setLingoMood('thinking');
        setLoading(false);
      }
    };
    load();
  }, [storyId]);

  const showBubble = (msg: string) => { setSpeechBubble(msg); setTimeout(() => setSpeechBubble(null), 2500); };

  const checkMatchAnswer = (question: typeof quiz): boolean => {
    if (!question || !question.questions[currentQ].pairs) return false;
    const pairs = question.questions[currentQ].pairs!;
    const correctPairs = pairs.map((p) => `${p.left}:${p.right}`);
    const selectedPairs = Object.entries(matchSelected).map(([left, right]) => `${left}:${right}`);
    return correctPairs.length === selectedPairs.length && correctPairs.every((cp) => selectedPairs.includes(cp));
  };

  const handleSubmitAnswer = useCallback(() => {
    if (!quiz) return;
    const question = quiz.questions[currentQ];
    let correct: boolean;

    if (question.type === 'match') {
      correct = checkMatchAnswer(quiz);
    } else {
      correct = selected.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    }

    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const newScore = score + 1;
      const newCorrect = correctCount + 1;
      const newStreak = correctStreak + 1;
      setScore(newScore);
      setCorrectCount(newCorrect);
      setLingoMood('happy');
      showBubble(['Excellent!', 'Great Job!', 'Awesome!'][Math.floor(Math.random() * 3)]);

      if (isFreeUser && newStreak % 3 === 0 && hearts < MAX_HEARTS) {
        const newHearts = hearts + 1;
        setHearts(newHearts);
        setHeartGainedIndex(newHearts - 1);
        setTimeout(() => setHeartGainedIndex(null), 700);
        showBubble('+1 Heart!');
        userService.updateProfile({ hearts: newHearts }).then(() => {
          window.dispatchEvent(new Event('profile-updated'));
        }).catch(() => {});
      }
      setCorrectStreak(newStreak);
    } else {
      const newIncorrect = incorrectCount + 1;
      setIncorrectCount(newIncorrect);
      if (isFreeUser) {
        setHearts((prevHearts) => {
          const newHearts = Math.max(0, prevHearts - 1);
          setHeartLostIndex(newHearts);
          setTimeout(() => setHeartLostIndex(null), 700);
          userService.updateProfile({ hearts: newHearts }).then(() => {
            window.dispatchEvent(new Event('profile-updated'));
          }).catch(() => {});
          return newHearts;
        });
      }
      setLingoMood('sad');
      setCorrectStreak(0);
      showBubble(['Try again!', 'Almost!', "Don't give up!"][Math.floor(Math.random() * 3)]);
    }
  }, [quiz, selected, matchSelected, currentQ, hearts, score, correctCount, incorrectCount, correctStreak, isFreeUser]);

  const handleNext = async () => {
    if (!quiz) return;
    setShowFeedback(false);
    setSelected('');
    setMatchSelected({});
    setSpeechBubble(null);

    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setLingoMood('thinking');
    } else {
      const accuracy = Math.round((score / quiz.questions.length) * 100);
      const xpEarned = score * 20;
      const res: QuizResult = {
        score, totalQuestions: quiz.questions.length, accuracy, xpEarned,
        heartsRemaining: hearts, correctAnswers: correctCount, incorrectAnswers: incorrectCount,
      };
      setResult(res);
      fireConfetti();
      setLingoMood('happy');

      if (quiz.storyId) {
        quizService.recordQuizResult({
          storyId: quiz.storyId,
          correctAnswers: correctCount,
          incorrectAnswers: incorrectCount,
          xpEarned,
          remainingHearts: hearts,
        }).catch(() => {});
      }
    }
  };

  const handlePlayAgain = useCallback(async () => {
    try {
      const u = await userService.getProfile();
      if (u) {
        const isUnlimited = u.plan === 'pro' || u.plan === 'premium' || (u as any).currentTier === 'Pro' || (u as any).currentTier === 'Premium';
        setIsFreeUser(!isUnlimited);
        const currentHearts = isUnlimited ? MAX_HEARTS : (u.hearts ?? MAX_HEARTS);
        setHearts(currentHearts);
        if (!isUnlimited && currentHearts <= 0) {
          setResult(null);
          return;
        }
      }
    } catch {}
    setCurrentQ(0); setSelected(''); setMatchSelected({}); setShowFeedback(false); setIsCorrect(false);
    setScore(0); setCorrectCount(0); setIncorrectCount(0); setResult(null);
    setSpeechBubble(null); setCorrectStreak(0); setLingoMood('thinking'); setTimeLeft(15); clearTimer();
  }, [clearTimer]);

  if (loading)
    return (
      <AppLayout>
        <div className="container-app py-16 max-w-lg mx-auto">
          <Card className="p-8 sm:p-12 text-center shadow-xl border border-indigo-100 dark:border-indigo-900/40">
            <div className="relative inline-block mb-6">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/20 animate-pulse">
                <div className="w-full h-full bg-white dark:bg-surface-900 rounded-[22px] flex items-center justify-center">
                  <LingoMascot variant="thinking" size={64} />
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg animate-bounce">
                <Sparkles size={16} />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-3">
              <Loader2 size={13} className="animate-spin" />
              <span>AI Quiz Hazırlayır...</span>
            </div>

            <h2 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">
              Hekayə Üzrə Quiz Hazırlanır
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 max-w-md mx-auto mb-6 leading-relaxed">
              Süni intellekt bu hekayənin məzmununu analiz edir, oxuyub-anlama və lüğət suallarını hazırlayır. Zəhmət olmasa bir neçə saniyə gözləyin...
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-xs font-medium text-surface-600 dark:text-surface-300 animate-pulse">
                <BookOpen size={13} className="text-primary-500" /> Hekayə oxunur
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-xs font-medium text-surface-600 dark:text-surface-300 animate-pulse" style={{ animationDelay: '300ms' }}>
                <Brain size={13} className="text-purple-500" /> Suallar tərtib edilir
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-xs font-medium text-surface-600 dark:text-surface-300 animate-pulse" style={{ animationDelay: '600ms' }}>
                <Sparkles size={13} className="text-amber-500" /> Variantlar qarışdırılır
              </span>
            </div>
          </Card>
        </div>
      </AppLayout>
    );

  if (!quiz)
    return (
      <AppLayout>
        <div className="container-app py-20 text-center">
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">Quiz not found</h1>
          <Link to="/library">
            <Button variant="primary" className="mt-4">
              Back to Library
            </Button>
          </Link>
        </div>
      </AppLayout>
    );

  if (isFreeUser && hearts <= 0 && !result)
    return (
      <AppLayout>
        <div className="container-app py-16 max-w-lg mx-auto">
          <Card className="p-8 sm:p-10 text-center shadow-xl border border-danger-100 dark:border-danger-900/40">
            <div className="flex justify-center mb-5">
              <LingoMascot variant="sad" size={90} />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-danger-50 dark:bg-danger-950/40 border border-danger-200 dark:border-danger-800 text-xs font-bold text-danger-600 dark:text-danger-400 mb-3">
              <Heart size={13} className="fill-danger-500 text-danger-500" />
              <span>0 Canınız Qalıb</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">
              Canlarınız Bitdi! 💔
            </h2>
            <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 max-w-md mx-auto mb-4 leading-relaxed">
              Pulsuz planda səhvlər nəticəsində canlarınız tükəndi. Testləri limitsiz işləmək və fasiləsiz öyrənmək üçün <span className="font-bold text-primary-600 dark:text-primary-400">PRO Plana</span> keçin!
            </p>

            {/* Live Heart Recovery Countdown */}
            <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/80 border border-surface-200 dark:border-surface-700 mb-6 inline-flex flex-col items-center shadow-soft">
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
              <Link to="/pricing" className="flex-1">
                <Button variant="gradient" size="lg" fullWidth className="shadow-md">
                  <Zap size={18} className="mr-1.5 fill-white" /> PRO Plana Keç
                </Button>
              </Link>
              <Link to="/library" className="flex-1">
                <Button variant="secondary" size="lg" fullWidth>
                  Kitabxanaya Qayıt
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </AppLayout>
    );

  if (result) return (
    <AppLayout>
      <div className="container-app py-12 max-w-md">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-6"><LingoMascot variant="celebrate" size={100} /></div>
            <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">Quiz Complete!</h1>
            <p className="text-surface-500 dark:text-surface-400 mb-6">{quiz.storyTitle}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { icon: Target, label: 'Score', value: `${result.score}/${result.totalQuestions}`, color: 'primary' },
                { icon: CheckCircle2, label: 'Correct', value: result.correctAnswers, color: 'success' },
                { icon: XCircle, label: 'Incorrect', value: result.incorrectAnswers, color: 'danger' },
                { icon: Zap, label: 'XP', value: `+${result.xpEarned}`, color: 'warning' },
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
                  <Heart size={20} className={i < result.heartsRemaining ? 'text-danger-500 fill-danger-500' : 'text-surface-200 dark:text-surface-700'} />
                </motion.div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="gradient" size="lg" fullWidth onClick={handlePlayAgain} leftIcon={<RotateCcw size={18} />}>Play Again</Button>
              <Link to="/library" className="flex-1"><Button variant="secondary" size="lg" fullWidth>Back to Library</Button></Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );

  const question = quiz.questions[currentQ];
  const progress = ((currentQ + 1) / quiz.questions.length) * 100;

  return (
    <AppLayout>
      <div className="container-app py-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Link to={`/story/${storyId}`} className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors"><ArrowLeft size={16} /> Back to Story</Link>
          <div className="flex items-center gap-1">
            {!isFreeUser ? (
              <span className="inline-flex items-center gap-1 text-sm font-bold text-danger-500 bg-danger-50 dark:bg-danger-500/10 px-2.5 py-1 rounded-full border border-danger-200 dark:border-danger-800">
                <Heart size={16} className="fill-danger-500 text-danger-500" />
                <span>♾️ Limitsiz</span>
              </span>
            ) : (
              Array.from({ length: MAX_HEARTS }).map((_, i) => (
                <motion.div key={i}
                  animate={heartLostIndex === i ? { scale: [1, 1.5, 0.8, 0], rotate: [0, -15, 15, 0], opacity: [1, 1, 1, 0] } : heartGainedIndex === i ? { scale: [0, 1.5, 1], opacity: [0, 1, 1] } : { scale: 1, opacity: 1 }}
                  transition={{ duration: 0.7 }}
                >
                  <Heart size={18} className={i < hearts ? 'text-danger-500 fill-danger-500' : 'text-surface-200 dark:text-surface-700'} />
                </motion.div>
              ))
            )}
          </div>
        </div>
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-medium text-surface-600 dark:text-surface-300">Question {currentQ + 1} of {quiz.questions.length}</span>
            <span className="flex items-center gap-1.5 font-bold text-primary-600 dark:text-primary-400"><Star size={14} className="fill-primary-500" /> {score * (100 / quiz.questions.length) | 0} pts</span>
          </div>
          <ProgressBar value={progress} color="primary" size="md" />
        </div>
        {/* Countdown Timer */}
        <div className="mb-6 flex justify-center">
          <motion.div
            key={currentQ}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-full shadow-md ${
              timeLeft > 7 ? 'bg-success-50 dark:bg-success-500/10 border-2 border-success-200 dark:border-success-500/30' :
              timeLeft >= 4 ? 'bg-warning-50 dark:bg-warning-500/10 border-2 border-warning-200 dark:border-warning-500/30' :
              'bg-danger-50 dark:bg-danger-500/10 border-2 border-danger-200 dark:border-danger-500/30'
            } ${timeLeft <= 3 && timeLeft > 0 ? 'animate-pulse' : ''}`}
          >
            <Timer size={20} className={
              timeLeft > 7 ? 'text-success-500' :
              timeLeft >= 4 ? 'text-warning-500' :
              'text-danger-500'
            } />
            <span className={`font-display font-bold text-lg tabular-nums ${
              timeLeft > 7 ? 'text-success-600 dark:text-success-400' :
              timeLeft >= 4 ? 'text-warning-600 dark:text-warning-400' :
              'text-danger-600 dark:text-danger-400'
            }`}>
              {timeLeft}s
            </span>
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <motion.line
                x1="0" y1="50" x2="100" y2="50"
                stroke={timeLeft > 7 ? '#22c55e' : timeLeft >= 4 ? '#f59e0b' : '#ef4444'}
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 1 }}
                animate={{ pathLength: 1 - (timeLeft / questionTimeLimit) }}
                transition={{ duration: 1, ease: 'linear' }}
                opacity={0.3}
              />
            </svg>
          </motion.div>
        </div>
        <div className="flex items-end gap-4 mb-6">
          <motion.div
            animate={showFeedback ? (isCorrect ? { y: [0, -15, 0], rotate: [0, -5, 5, 0] } : { x: [0, -8, 8, -8, 8, 0] }) : { y: [0, -5, 0] }}
            transition={showFeedback ? (isCorrect ? { duration: 0.6, repeat: Infinity, repeatType: 'reverse' } : { duration: 0.4 }) : { duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <LingoMascot variant={showFeedback ? (isCorrect ? 'happy' : 'sad') : lingoMood} size={72} />
          </motion.div>
          <AnimatePresence>
            {speechBubble && (
              <motion.div initial={{ opacity: 0, scale: 0.5, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5 }} className={`relative px-4 py-3 rounded-2xl shadow-lg mb-2 ${isCorrect ? 'bg-success-500 text-white' : 'bg-warning-500 text-white'}`}>
                <p className="font-display font-bold text-sm whitespace-nowrap">{speechBubble}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <Card className="p-8 mb-6">
              <div className="flex items-center gap-2 mb-4"><Badge color="primary">{question.type.replace('_', ' ').toUpperCase()}</Badge>{question.word && <Badge color="surface">{question.word}</Badge>}</div>
              <h2 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-4">{question.question}</h2>
              {question.contextSentence && (
                <div className="mb-4 p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 border-l-4 border-primary-400">
                  <p className="text-sm italic text-surface-600 dark:text-surface-300">"{question.contextSentence}"</p>
                </div>
              )}

              {/* Multiple Choice & Comprehension */}
              {(question.type === 'multiple_choice' || question.type === 'comprehension') && question.options && (
                <div className="space-y-3">
                  {question.options.map((opt, i) => {
                    const isCorrectOpt = showFeedback && opt.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
                    const isWrongSelected = showFeedback && selected.trim().toLowerCase() === opt.trim().toLowerCase() && opt.trim().toLowerCase() !== question.correctAnswer.trim().toLowerCase();
                    return (
                      <motion.button key={opt} onClick={() => !showFeedback && setSelected(opt)} disabled={showFeedback}
                        animate={isCorrectOpt ? { scale: [1, 1.03, 1] } : isWrongSelected ? { x: [0, -6, 6, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${isCorrectOpt ? 'border-success-500 bg-success-50 dark:bg-success-500/10' : isWrongSelected ? 'border-danger-500 bg-danger-50 dark:bg-danger-500/10' : selected === opt ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'}`}
                      >
                        <span className="flex items-center gap-3">
                          <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isCorrectOpt ? 'bg-success-500 text-white' : isWrongSelected ? 'bg-danger-500 text-white' : selected === opt ? 'bg-primary-500 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-500'}`}>{String.fromCharCode(65 + i)}</span>
                          <span className="text-sm font-medium text-surface-900 dark:text-white">{opt}</span>
                        </span>
                        {isCorrectOpt && <CheckCircle2 size={20} className="text-success-500" />}
                        {isWrongSelected && <XCircle size={20} className="text-danger-500" />}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* AI Explanation feedback */}
              {showFeedback && question.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs sm:text-sm text-blue-900 dark:text-blue-200"
                >
                  <strong className="font-semibold block mb-0.5">💡 İzah (Explanation):</strong>
                  {question.explanation}
                </motion.div>
              )}

              {/* True / False */}
              {question.type === 'true_false' && question.options && (
                <div className="grid grid-cols-2 gap-3">
                  {question.options.map((opt) => {
                    const isCorrectOpt = showFeedback && opt === question.correctAnswer;
                    const isWrongSelected = showFeedback && selected === opt && opt !== question.correctAnswer;
                    return (
                      <motion.button key={opt} onClick={() => !showFeedback && setSelected(opt)} disabled={showFeedback}
                        animate={isCorrectOpt ? { scale: [1, 1.05, 1] } : isWrongSelected ? { x: [0, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}
                        className={`p-6 rounded-xl border-2 transition-all text-center font-display font-bold text-lg ${isCorrectOpt ? 'border-success-500 bg-success-50 dark:bg-success-500/10 text-success-600' : isWrongSelected ? 'border-danger-500 bg-danger-50 dark:bg-danger-500/10 text-danger-600' : selected === opt ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-primary-600' : 'border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-200 hover:border-surface-300'}`}
                      >
                        {opt === 'True' ? <CheckCircle2 size={28} className="mx-auto mb-2" /> : <XCircle size={28} className="mx-auto mb-2" />}
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {/* Fill in the Blank */}
              {question.type === 'fill_blank' && (
                <input type="text" value={selected} onChange={(e) => !showFeedback && setSelected(e.target.value)} disabled={showFeedback} placeholder="Type your answer..." className="input text-lg" onKeyDown={(e) => e.key === 'Enter' && !showFeedback && handleSubmitAnswer()} />
              )}

              {/* Match the Word with its Meaning */}
              {question.type === 'match' && question.pairs && (
                <div className="space-y-3">
                  {question.pairs.map((pair) => (
                    <div key={pair.left} className="flex items-center gap-3">
                      <div className="flex-1 p-3 rounded-xl bg-primary-50 dark:bg-primary-500/10 border-2 border-primary-200 dark:border-primary-700 text-sm font-medium text-surface-900 dark:text-white">{pair.left}</div>
                      <span className="text-surface-400">→</span>
                      <select
                        value={matchSelected[pair.left] || ''}
                        onChange={(e) => !showFeedback && setMatchSelected({ ...matchSelected, [pair.left]: e.target.value })}
                        disabled={showFeedback}
                        className={`flex-1 p-3 rounded-xl border-2 outline-none transition-colors ${showFeedback ? (matchSelected[pair.left] === pair.right ? 'border-success-500 bg-success-50 dark:bg-success-500/10' : 'border-danger-500 bg-danger-50 dark:bg-danger-500/10') : 'border-surface-200 dark:border-surface-700 focus:border-primary-500'} bg-white dark:bg-surface-800 text-sm font-medium text-surface-900 dark:text-white`}
                      >
                        <option value="">Select meaning...</option>
                        {[...question.pairs!].sort(() => Math.random() - 0.5).map((p) => <option key={p.right} value={p.right}>{p.right}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              )}

              {/* Reading Comprehension */}
              {question.type === 'comprehension' && question.options && (
                <div className="space-y-3">
                  {question.options.map((opt, i) => {
                    const isCorrectOpt = showFeedback && opt === question.correctAnswer;
                    const isWrongSelected = showFeedback && selected === opt && opt !== question.correctAnswer;
                    return (
                      <motion.button key={opt} onClick={() => !showFeedback && setSelected(opt)} disabled={showFeedback}
                        animate={isCorrectOpt ? { scale: [1, 1.03, 1] } : isWrongSelected ? { x: [0, -6, 6, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${isCorrectOpt ? 'border-success-500 bg-success-50 dark:bg-success-500/10' : isWrongSelected ? 'border-danger-500 bg-danger-50 dark:bg-danger-500/10' : selected === opt ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'}`}
                      >
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isCorrectOpt ? 'bg-success-500 text-white' : isWrongSelected ? 'bg-danger-500 text-white' : selected === opt ? 'bg-primary-500 text-white' : 'bg-surface-100 dark:bg-surface-700 text-surface-500'}`}>{String.fromCharCode(65 + i)}</span>
                        <span className="text-sm font-medium text-surface-900 dark:text-white">{opt}</span>
                        {isCorrectOpt && <CheckCircle2 size={20} className="text-success-500 ml-auto" />}
                        {isWrongSelected && <XCircle size={20} className="text-danger-500 ml-auto" />}
                      </motion.button>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                {!showFeedback ? (
                  <Button variant="gradient" size="lg" onClick={handleSubmitAnswer}
                    disabled={question.type === 'match' ? Object.keys(matchSelected).length !== (question.pairs?.length || 0) : !selected}>
                    Submit Answer
                  </Button>
                ) : (
                  <Button variant="gradient" size="lg" onClick={handleNext} rightIcon={<ArrowRight size={18} />}>
                    {currentQ < quiz.questions.length - 1 ? 'Next Question' : 'See Results'}
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
