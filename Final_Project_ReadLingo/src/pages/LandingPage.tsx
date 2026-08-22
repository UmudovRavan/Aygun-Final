import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, BookOpen, Star, ChevronLeft, ChevronRight, Sparkles, Users, TrendingUp, Globe, Check, Compass, Search, Atom, Scroll, Coffee, Plane, TreePine } from 'lucide-react';
import { LandingNav, LandingFooter } from '../components/landing/LandingNav';
import LingoMascot from '../components/ui/LingoMascot';
import StoryCard from '../components/ui/StoryCard';
import { mockStories, mockCategories } from '../data/mockData';
import { storyService } from '../services';
import type { Story, Category } from '../types';
import { useState, useEffect, useMemo } from 'react';

const categoryIcons: Record<string, typeof BookOpen> = { Compass, Search, Sparkles, Atom, Scroll, Coffee, Plane, TreePine, BookOpen, Globe };

const defaultCategoryGradients = [
  'from-primary-500 to-primary-700',
  'from-surface-700 to-surface-900',
  'from-secondary-500 to-secondary-700',
  'from-success-500 to-success-700',
  'from-warning-500 to-warning-700',
  'from-danger-500 to-danger-700',
  'from-primary-400 to-secondary-500',
  'from-success-400 to-success-600',
];

const defaultCategoryImages = [
  'https://images.pexels.com/photos/12716176/pexels-photo-12716176.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/1580288/pexels-photo-1580288.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2168974/pexels-photo-2168974.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=400',
  'https://images.pexels.com/photos/9988402/pexels-photo-9988402.jpeg?auto=compress&cs=tinysrgb&w=400',
];

export default function LandingPage() {
  const { t } = useTranslation();
  const [stories, setStories] = useState<Story[]>(mockStories);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [fetchedStories, fetchedCategories] = await Promise.all([
          storyService.getStories(),
          storyService.getCategories(),
        ]);
        if (mounted) {
          if (fetchedStories && fetchedStories.length > 0) {
            setStories(fetchedStories);
          }
          if (fetchedCategories && fetchedCategories.length > 0) {
            setCategories(fetchedCategories);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch landing page dynamic data:', err);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  const featuredStories = useMemo(() => {
    const feat = stories.filter((s) => s.isFeatured);
    if (feat.length >= 4) return feat;
    const nonFeat = stories.filter((s) => !s.isFeatured);
    return [...feat, ...nonFeat].slice(0, 4);
  }, [stories]);

  const slides = useMemo(() => {
    const feat = stories.filter((s) => s.isFeatured);
    return feat.length > 0 ? feat : stories.slice(0, 5);
  }, [stories]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const next = () => setCurrent((c) => (c + 1) % slides.length);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const slide = slides[current] || slides[0];
  const previewStory = featuredStories[0] || stories[0] || mockStories[0];

  const plans = [
    { key: 'free', highlighted: false, mascotVariant: 'reading' as const },
    { key: 'pro', highlighted: true, mascotVariant: 'happy' as const },
    { key: 'premium', highlighted: false, mascotVariant: 'celebrate' as const },
  ];

  const features = [
    { icon: BookOpen, titleKey: 'features.context.title', descKey: 'features.context.desc' },
    { icon: Sparkles, titleKey: 'features.ai.title', descKey: 'features.ai.desc' },
    { icon: TrendingUp, titleKey: 'features.progress.title', descKey: 'features.progress.desc' },
  ];

  const steps = [
    { num: 1, titleKey: 'how.step1.title', descKey: 'how.step1.desc', mascotVariant: 'thinking' as const },
    { num: 2, titleKey: 'how.step2.title', descKey: 'how.step2.desc', mascotVariant: 'reading' as const },
    { num: 3, titleKey: 'how.step3.title', descKey: 'how.step3.desc', mascotVariant: 'celebrate' as const },
  ];

  return (
    <>
      <LandingNav />
      <main className="pt-16">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 to-white dark:from-ink-950 dark:to-ink-900">
          <div className="container-app py-16 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
                  <Sparkles size={14} /> {t('hero.badge')}
                </div>
                <h1 className="font-display text-4xl lg:text-6xl font-bold text-surface-900 dark:text-white leading-tight mb-6">{t('hero.title')}</h1>
                <p className="text-lg text-surface-500 dark:text-surface-400 mb-8 max-w-lg">{t('hero.subtitle')}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/signup" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-primary text-white font-semibold hover:opacity-90 transition-opacity">{t('hero.cta')} <ArrowRight size={18} /></Link>
                  <Link to="/library" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-200 font-semibold border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors">{t('hero.browse')}</Link>
                </div>
                <div className="flex items-center gap-6 mt-8 text-sm text-surface-400">
                  <span className="flex items-center gap-1.5"><Users size={16} /> {t('hero.learners')}</span>
                  <span className="flex items-center gap-1.5"><Globe size={16} /> {t('hero.levels')}</span>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="relative">
                <div className="absolute -top-4 -left-2 z-20">
                  <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="bg-white dark:bg-ink-900 rounded-2xl shadow-xl border border-surface-200 dark:border-ink-800 p-2 flex items-center gap-2">
                    <LingoMascot variant="wave" size={44} />
                    <div className="pr-2"><p className="font-display text-xs font-bold text-surface-900 dark:text-white">Lingo</p><p className="text-[10px] text-success-600 dark:text-success-400 font-medium">Your AI Tutor</p></div>
                  </motion.div>
                </div>
                {slide && (
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-primary-600/10">
                    <Link to={`/story/${slide.id}`} className="block relative h-72 sm:h-80 lg:h-96 overflow-hidden group">
                      <img src={slide.coverImage || defaultCategoryImages[0]} alt={slide.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/30 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-2.5 py-1 rounded-full bg-primary-500/90 text-xs font-bold uppercase tracking-wide">{slide.category}</span>
                          <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-xs font-semibold">{slide.difficulty}</span>
                        </div>
                        <h3 className="font-display text-2xl font-bold mb-2 leading-tight group-hover:text-primary-300 transition-colors">{slide.title}</h3>
                        <p className="text-sm text-white/80 line-clamp-2 mb-4">{slide.description}</p>
                        <div className="flex items-center gap-4 text-xs text-white/70">
                          <span className="flex items-center gap-1"><Clock size={14} /> {slide.readingTimeMinutes} min</span>
                          <span className="flex items-center gap-1"><BookOpen size={14} /> {slide.wordCount} words</span>
                          <span className="flex items-center gap-1"><Star size={14} className="fill-warning-400 text-warning-400" /> {slide.rating}</span>
                        </div>
                      </div>
                    </Link>
                    <button onClick={(e) => { e.preventDefault(); prev(); }} className="absolute top-1/2 left-3 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-ink-900/80 backdrop-blur flex items-center justify-center text-surface-600 dark:text-surface-300 hover:bg-white dark:hover:bg-ink-800 transition-colors shadow-lg z-10"><ChevronLeft size={20} /></button>
                    <button onClick={(e) => { e.preventDefault(); next(); }} className="absolute top-1/2 right-3 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 dark:bg-ink-900/80 backdrop-blur flex items-center justify-center text-surface-600 dark:text-surface-300 hover:bg-white dark:hover:bg-ink-800 transition-colors shadow-lg z-10"><ChevronRight size={20} /></button>
                    <div className="absolute top-4 right-4 flex gap-2 z-10">
                      {slides.map((_, i) => <button key={i} onClick={(e) => { e.preventDefault(); setCurrent(i); }} className={`h-2 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'}`} />)}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container-app py-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">{t('sections.features')}</h2>
            <p className="text-surface-500 dark:text-surface-400">{t('sections.featuresSub')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4"><Icon size={28} className="text-white" /></div>
                  <h3 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-2">{t(f.titleKey)}</h3>
                  <p className="text-surface-500 dark:text-surface-400">{t(f.descKey)}</p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-surface-50 dark:bg-ink-900 py-16">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">{t('sections.howItWorks')}</h2>
              <p className="text-surface-500 dark:text-surface-400">{t('sections.howItWorksSub')}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                  <div className="flex justify-center mb-4"><LingoMascot variant={step.mascotVariant} size={72} /></div>
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold mx-auto mb-3">{step.num}</div>
                  <h3 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-2">{t(step.titleKey)}</h3>
                  <p className="text-surface-500 dark:text-surface-400">{t(step.descKey)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Preview */}
        <section className="container-app py-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">{t('sections.storyPreview')}</h2>
            <p className="text-surface-500 dark:text-surface-400">{t('sections.storyPreviewSub')}</p>
          </div>
          <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 shadow-card">
            <div className="grid sm:grid-cols-3">
              <div className="sm:col-span-1 h-48 sm:h-auto overflow-hidden">
                <img src={previewStory.coverImage || defaultCategoryImages[0]} alt={previewStory.title} className="w-full h-full object-cover" />
              </div>
              <div className="sm:col-span-2 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="badge bg-primary-100 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300">{previewStory.category}</span>
                  <span className="badge bg-success-100 dark:bg-success-500/20 text-success-700 dark:text-success-300">{previewStory.difficulty}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-2">{previewStory.title}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 mb-4 line-clamp-2">{previewStory.description}</p>
                <div className="rounded-xl bg-surface-50 dark:bg-surface-800/50 p-4 mb-4">
                  <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed line-clamp-3">
                    {previewStory.chapters?.[0]?.content ? (
                      previewStory.chapters[0].content.slice(0, 180) + '...'
                    ) : (
                      previewStory.description
                    )}
                  </p>
                </div>
                <Link to={`/story/${previewStory.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:gap-2 transition-all">{t('common.readMore')} <ArrowRight size={14} /></Link>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-surface-50 dark:bg-ink-900 py-16">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">{t('sections.categories')}</h2>
              <p className="text-surface-500 dark:text-surface-400">{t('sections.categoriesSub')}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat, i) => {
                const Icon = categoryIcons[cat.icon] || BookOpen;
                const gradient = cat.color && cat.color.includes('from-') ? cat.color : defaultCategoryGradients[i % defaultCategoryGradients.length];
                const imageSrc = cat.image || defaultCategoryImages[i % defaultCategoryImages.length];
                const calculatedCount = stories.filter((s) => s.category?.toLowerCase() === cat.name?.toLowerCase()).length;
                const count = cat.storyCount || calculatedCount || 0;

                return (
                  <motion.div key={cat.id || i} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/library?category=${encodeURIComponent(cat.name)}`} className="group block rounded-2xl overflow-hidden bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                      <div className="relative h-32 overflow-hidden">
                        <img src={imageSrc} alt={cat.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className={`absolute inset-0 bg-gradient-to-t ${gradient} opacity-60 group-hover:opacity-40 transition-opacity`} />
                        <div className="absolute bottom-2 left-2 w-8 h-8 rounded-lg bg-white/90 dark:bg-surface-900/90 flex items-center justify-center"><Icon size={16} className="text-surface-700 dark:text-surface-200" /></div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-display font-bold text-sm text-surface-900 dark:text-white">{cat.name}</h3>
                        <p className="text-xs text-surface-400">{count} {count === 1 ? 'story' : 'stories'}</p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Stories */}
        <section className="container-app py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-bold text-surface-900 dark:text-white">Featured Stories</h2>
            <Link to="/library" className="text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:gap-2 transition-all">View all <ArrowRight size={16} /></Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredStories.slice(0, 4).map((s) => <StoryCard key={s.id} story={s} />)}
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-surface-50 dark:bg-ink-900 py-16">
          <div className="container-app">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">{t('sections.pricing')}</h2>
              <p className="text-surface-500 dark:text-surface-400">{t('sections.pricingSub')}</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {plans.map((plan, i) => {
                const planData = t(`pricing.${plan.key}`, { returnObjects: true }) as { name: string; price: string; period: string; cta: string; features: string[] };
                return (
                  <motion.div key={plan.key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className={`relative rounded-3xl p-8 ${plan.highlighted ? 'bg-gradient-primary text-white shadow-2xl shadow-primary-600/20 lg:-translate-y-4' : 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800'}`}>
                    {plan.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-warning-400 text-warning-900 text-xs font-bold flex items-center gap-1"><Sparkles size={12} /> {t('common.popular')}</div>}
                    <div className="flex justify-center mb-4"><LingoMascot variant={plan.mascotVariant} size={72} /></div>
                    <h3 className={`font-display text-xl font-bold mb-2 text-center ${plan.highlighted ? 'text-white' : 'text-surface-900 dark:text-white'}`}>{planData.name}</h3>
                    <div className="mb-6 text-center">
                      <span className={`font-display text-4xl font-bold ${plan.highlighted ? 'text-white' : 'text-surface-900 dark:text-white'}`}>{planData.price}</span>
                      <span className={`text-sm ${plan.highlighted ? 'text-white/70' : 'text-surface-400'}`}> /{planData.period}</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {planData.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm">
                          <Check size={18} className={`shrink-0 mt-0.5 ${plan.highlighted ? 'text-white' : 'text-success-500'}`} />
                          <span className={plan.highlighted ? 'text-white/90' : 'text-surface-600 dark:text-surface-300'}>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link to="/signup" className={`block text-center px-6 py-3 rounded-xl font-semibold transition-all ${plan.highlighted ? 'bg-white text-primary-600 hover:bg-primary-50' : 'bg-gradient-primary text-white hover:opacity-90'}`}>{planData.cta}</Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container-app py-16">
          <div className="rounded-3xl bg-gradient-primary p-8 lg:p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex justify-center mb-6"><LingoMascot variant="happy" size={80} /></div>
              <h2 className="font-display text-3xl font-bold mb-4">{t('sections.cta')}</h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">{t('sections.ctaSub')}</p>
              <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-600 font-semibold hover:bg-primary-50 transition-colors">{t('hero.cta')} <ArrowRight size={18} /></Link>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
