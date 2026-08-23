import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import {
  ArrowLeft,
  Clock,
  ArrowRight,
  Share2,
  Bookmark,
  Heart,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Sparkles,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LandingNav, LandingFooter } from '../components/landing/LandingNav';
import Badge from '../components/ui/Badge';
import LingoMascot from '../components/ui/LingoMascot';
import { LoadingState } from '../components/ui/Loading';
import { blogService } from '../services';
import type { BlogPost } from '../types';

const categoryColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
  'Learning Tips': 'primary',
  Research: 'secondary',
  Pronunciation: 'success',
  Motivation: 'warning',
  'Reading Tips': 'secondary',
};

export default function BlogDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive states
  const [likes, setLikes] = useState(42);
  const [hasLiked, setHasLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);

  // Scroll reading progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const load = async () => {
      setLoading(true);
      const [p, posts] = await Promise.all([
        blogService.getPostById(id!),
        blogService.getPosts(),
      ]);
      setPost(p);
      setAllPosts(posts);
      setLoading(false);
      setIsPlayingAudio(false);
      window.speechSynthesis?.cancel();
    };
    load();

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [id]);

  const handleLike = () => {
    if (hasLiked) {
      setLikes((prev) => prev - 1);
      setHasLiked(false);
    } else {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleAudioNarration = () => {
    if (!('speechSynthesis' in window) || !post) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      // Clean content from markdown formatting for speech
      const textToSpeak = `${post.title}. ${post.excerpt}. ${post.content.replace(/\*\*/g, '')}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      utterance.rate = speechRate;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const changeSpeed = () => {
    const nextRate = speechRate === 1 ? 1.25 : speechRate === 1.25 ? 0.85 : 1;
    setSpeechRate(nextRate);
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  if (loading) {
    return (
      <>
        <LandingNav />
        <main className="pt-24 min-h-screen bg-surface-50 dark:bg-ink-950">
          <LoadingState message="Loading article..." />
        </main>
        <LandingFooter />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <LandingNav />
        <main className="pt-24 min-h-[70vh] bg-surface-50 dark:bg-ink-950 flex items-center justify-center">
          <div className="container-app py-16 text-center">
            <LingoMascot variant="thinking" size={72} className="mx-auto mb-4" />
            <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">
              Article not found
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mb-6">
              The article you're looking for doesn't exist or has been moved.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-colors"
            >
              <ArrowLeft size={16} /> Back to Blog
            </Link>
          </div>
        </main>
        <LandingFooter />
      </>
    );
  }

  const paragraphs = post.content.split('\n\n');
  const relatedPosts = allPosts
    .filter((p) => String(p.id) !== String(post.id))
    .slice(0, 3);

  return (
    <>
      <LandingNav />

      {/* Top Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-600 origin-left z-50"
        style={{ scaleX }}
      />

      <main className="pt-20 lg:pt-24 bg-surface-50/50 dark:bg-ink-950 min-h-screen pb-20">
        <article className="container-app max-w-4xl py-6">
          {/* Breadcrumb & Navigation */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
              <Link
                to="/"
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Home
              </Link>
              <ChevronRight size={14} />
              <Link
                to="/blog"
                className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                Blog
              </Link>
              <ChevronRight size={14} />
              <span className="text-surface-900 dark:text-white font-medium truncate max-w-[200px] sm:max-w-[300px]">
                {post.title}
              </span>
            </div>

            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            >
              <ArrowLeft size={14} /> {t('common.back') || 'Back'}
            </Link>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header / Meta */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge color={categoryColors[post.category] ?? 'primary'}>
                  {post.category}
                </Badge>
                <span className="flex items-center gap-1 text-xs font-medium text-surface-500 dark:text-surface-400">
                  <Clock size={13} /> {post.readTime} min read
                </span>
              </div>

              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-surface-900 dark:text-white mb-6 leading-[1.2] tracking-tight">
                {post.title}
              </h1>

              <p className="text-lg sm:text-xl text-surface-600 dark:text-surface-300 leading-relaxed mb-6 font-normal">
                {post.excerpt}
              </p>

              {/* Author & Audio Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold shadow-md shadow-primary-500/20 text-sm">
                    {post.author.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-surface-900 dark:text-white text-sm">
                      {post.author}
                    </h4>
                    <p className="text-xs text-surface-400 flex items-center gap-2">
                      <span>{formatDate(post.date)}</span>
                      <span>•</span>
                      <span>ReadLingo Educator</span>
                    </p>
                  </div>
                </div>

                {/* Audio Listen Feature */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleAudioNarration}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isPlayingAudio
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/30 animate-pulse'
                        : 'bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-100 dark:hover:bg-primary-900/50'
                    }`}
                  >
                    {isPlayingAudio ? <VolumeX size={15} /> : <Volume2 size={15} />}
                    <span>{isPlayingAudio ? 'Pause Narration' : 'Listen to Article'}</span>
                  </button>
                  {isPlayingAudio && (
                    <button
                      onClick={changeSpeed}
                      className="px-2.5 py-2 rounded-xl text-xs font-bold bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200"
                    >
                      {speechRate}x
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="relative rounded-3xl overflow-hidden mb-10 aspect-[16/9] shadow-lg border border-surface-200 dark:border-surface-800">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Article Content Container */}
            <div className="bg-white dark:bg-surface-900 rounded-3xl p-6 sm:p-10 border border-surface-200 dark:border-surface-800 shadow-sm mb-10">
              {/* Key Takeaways Callout */}
              <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-primary-50 to-secondary-50/50 dark:from-primary-950/40 dark:to-secondary-950/30 border border-primary-200/70 dark:border-primary-800/60">
                <div className="flex items-center gap-2 text-primary-700 dark:text-primary-300 font-bold text-sm mb-2">
                  <Sparkles size={16} className="text-primary-600 dark:text-primary-400" />
                  <span>Key Takeaway</span>
                </div>
                <p className="text-xs sm:text-sm text-surface-700 dark:text-surface-300 leading-relaxed">
                  Consistent, enjoyable daily practice in meaningful context accelerates language acquisition more effectively than traditional memorization.
                </p>
              </div>

              {/* Parsed Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert">
                {paragraphs.map((para, i) => {
                  const isHeading = para.startsWith('**') && para.endsWith('**');
                  if (isHeading) {
                    const text = para.replace(/\*\*/g, '');
                    return (
                      <div key={i} className="mt-8 mb-4">
                        <h2 className="font-display text-xl sm:text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2.5">
                          <span className="w-2 h-6 rounded-full bg-primary-600 shrink-0" />
                          {text}
                        </h2>
                      </div>
                    );
                  }
                  return (
                    <p
                      key={i}
                      className="text-surface-700 dark:text-surface-300 text-base sm:text-lg leading-[1.8] mb-5 font-normal"
                    >
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* Engagement & Share Bar */}
              <div className="mt-12 pt-8 border-t border-surface-100 dark:border-surface-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      hasLiked
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600'
                    }`}
                  >
                    <Heart
                      size={17}
                      className={hasLiked ? 'fill-rose-500 text-rose-500' : ''}
                    />
                    <span>{likes}</span>
                  </button>

                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isBookmarked
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-600'
                        : 'bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:text-amber-500'
                    }`}
                    title="Bookmark this post"
                  >
                    <Bookmark
                      size={17}
                      className={isBookmarked ? 'fill-amber-500 text-amber-500' : ''}
                    />
                  </button>
                </div>

                {/* Social Share Buttons */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-surface-400 mr-1 flex items-center gap-1">
                    <Share2 size={13} /> Share:
                  </span>

                  <button
                    onClick={handleCopyLink}
                    className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-primary-50 hover:text-primary-600 dark:hover:bg-primary-950/40 transition-colors relative"
                    title="Copy Link"
                  >
                    {copied ? (
                      <Check size={16} className="text-emerald-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                    {copied && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-surface-900 text-white text-[10px] whitespace-nowrap shadow-md">
                        Copied!
                      </span>
                    )}
                  </button>

                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                      post.title
                    )}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-sky-50 hover:text-sky-500 dark:hover:bg-sky-950/40 transition-colors"
                    title="Share on Twitter"
                  >
                    <Twitter size={16} />
                  </a>

                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      window.location.href
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950/40 transition-colors"
                    title="Share on LinkedIn"
                  >
                    <Linkedin size={16} />
                  </a>
                </div>
              </div>
            </div>

            {/* Author Bio Box */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm mb-12 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-500 via-secondary-500 to-amber-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
                {post.author.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h3 className="font-display font-bold text-lg text-surface-900 dark:text-white">
                    Written by {post.author}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
                    Language Pedagogist
                  </span>
                </div>
                <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed mb-4">
                  Passionate about transforming modern language education through interactive storytelling, cognitive reading strategies, and AI-assisted pedagogy.
                </p>
                <Link
                  to="/library"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:gap-2 transition-all"
                >
                  <BookOpen size={14} /> Explore stories for this topic <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* CTA Box */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-700 p-8 sm:p-10 text-white shadow-xl mb-16">
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5 text-center md:text-left">
                  <div className="hidden sm:block shrink-0">
                    <LingoMascot variant="celebrate" size={72} />
                  </div>
                  <div>
                    <h3 className="font-display text-2xl font-bold mb-2">
                      Ready to Put These Tips Into Practice?
                    </h3>
                    <p className="text-primary-100 text-sm max-w-lg">
                      Explore interactive English stories tailored for all levels from A1 to C2 with AI vocabulary lookups and quizzes.
                    </p>
                  </div>
                </div>
                <Link
                  to="/library"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-primary-700 font-bold text-sm shadow-lg hover:bg-primary-50 hover:shadow-xl transition-all shrink-0"
                >
                  Browse Stories <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Related Articles Section */}
            {relatedPosts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-2xl font-bold text-surface-900 dark:text-white">
                    Related Articles
                  </h3>
                  <Link
                    to="/blog"
                    className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                  >
                    View all <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedPosts.map((rPost) => (
                    <Link
                      key={rPost.id}
                      to={`/blog/${rPost.id}`}
                      className="group block rounded-2xl overflow-hidden bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl"
                    >
                      <div className="aspect-[16/10] overflow-hidden bg-surface-100 dark:bg-surface-800">
                        <img
                          src={rPost.coverImage}
                          alt={rPost.title}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-5 flex flex-col h-[calc(100%-160px)]">
                        <div className="mb-2.5">
                          <Badge color={categoryColors[rPost.category] ?? 'primary'}>
                            {rPost.category}
                          </Badge>
                        </div>
                        <h4 className="font-display font-bold text-base text-surface-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {rPost.title}
                        </h4>
                        <p className="text-xs text-surface-500 dark:text-surface-400 line-clamp-2 mb-4">
                          {rPost.excerpt}
                        </p>
                        <div className="mt-auto flex items-center justify-between text-xs text-surface-400 pt-3 border-t border-surface-100 dark:border-surface-800">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {rPost.readTime} min
                          </span>
                          <span className="font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 group-hover:gap-1.5 transition-all">
                            Read <ArrowRight size={12} />
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </article>
      </main>

      <LandingFooter />
    </>
  );
}

