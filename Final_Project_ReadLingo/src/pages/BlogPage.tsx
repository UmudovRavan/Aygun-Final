import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, User, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LandingNav, LandingFooter } from '../components/landing/LandingNav';
import Badge from '../components/ui/Badge';
import { mockBlogPosts } from '../data/mockData';

const categoryColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = { 'Learning Tips': 'primary', Research: 'secondary', Pronunciation: 'success', Motivation: 'warning', 'Reading Tips': 'secondary' };

export default function BlogPage() {
  const { t } = useTranslation();
  const featured = mockBlogPosts[0];
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <>
      <LandingNav />
      <main className="pt-16 lg:pt-20">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary-50/60 to-white dark:from-ink-950 dark:to-ink-900">
          <div className="container-app py-16 lg:py-20 text-center">
            <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl lg:text-5xl font-bold text-surface-900 dark:text-white mb-4">Read<span className="text-primary-600 dark:text-primary-400">Lingo</span> Blog</motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">Tips, insights, and stories about learning English</motion.p>
          </div>
        </section>
        <section className="container-app pt-12 lg:pt-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to={`/blog/${featured.id}`} className="group block rounded-3xl overflow-hidden bg-white dark:bg-ink-900 border border-surface-200 dark:border-ink-800 transition-all duration-300 hover:shadow-xl hover:shadow-surface-900/10">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="aspect-[16/10] lg:aspect-auto overflow-hidden bg-surface-100 dark:bg-ink-800"><img src={featured.coverImage} alt={featured.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                <div className="p-6 lg:p-10 flex flex-col justify-center">
                  <div className="mb-3"><Badge color={categoryColors[featured.category] ?? 'primary'}>{featured.category}</Badge></div>
                  <h2 className="font-display text-2xl lg:text-3xl font-bold text-surface-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{featured.title}</h2>
                  <p className="text-surface-500 dark:text-surface-400 leading-relaxed mb-6 line-clamp-3">{featured.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-surface-400 mb-6"><span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {featured.author}</span><span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {featured.readTime} min read</span><span>{formatDate(featured.date)}</span></div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-2.5 transition-all">{t('common.readArticle')} <ArrowRight className="w-4 h-4" /></span>
                </div>
              </div>
            </Link>
          </motion.div>
        </section>
        <section className="container-app py-12 lg:py-16">
          <h3 className="font-display text-xl font-bold text-surface-900 dark:text-white mb-6">Latest Articles</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockBlogPosts.slice(1).map((post, idx) => (
              <motion.article key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
                <Link to={`/blog/${post.id}`} className="group block h-full rounded-2xl overflow-hidden bg-white dark:bg-ink-900 border border-surface-200 dark:border-ink-800 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-surface-900/10">
                  <div className="aspect-[16/10] overflow-hidden bg-surface-100 dark:bg-ink-800"><img src={post.coverImage} alt={post.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" /></div>
                  <div className="p-5 flex flex-col">
                    <div className="mb-3"><Badge color={categoryColors[post.category] ?? 'primary'}>{post.category}</Badge></div>
                    <h2 className="font-display text-lg font-bold text-surface-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{post.title}</h2>
                    <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-surface-100 dark:border-ink-800 text-xs text-surface-400"><span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {post.author}</span><span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime} min</span></div>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all">{t('common.readMore')} <ArrowRight className="w-4 h-4" /></span>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        </section>
      </main>
      <LandingFooter />
    </>
  );
}
