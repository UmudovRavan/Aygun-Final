import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User, Calendar, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LandingNav, LandingFooter } from '../components/landing/LandingNav';
import Badge from '../components/ui/Badge';
import LingoMascot from '../components/ui/LingoMascot';
import { LoadingState } from '../components/ui/Loading';
import { blogService } from '../services';
import type { BlogPost } from '../types';

const categoryColors: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = { 'Learning Tips': 'primary', Research: 'secondary', Pronunciation: 'success', Motivation: 'warning', 'Reading Tips': 'secondary' };

export default function BlogDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const load = async () => { const p = await blogService.getPostById(id!); setPost(p || null); setLoading(false); }; load(); }, [id]);

  if (loading) return <><LandingNav /><main className="pt-20"><LoadingState message="Loading article..." /></main></>;
  if (!post) return <><LandingNav /><main className="pt-20"><div className="container-app py-20 text-center"><h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">Article not found</h1><Link to="/blog" className="text-primary-600 dark:text-primary-400 font-semibold">Back to Blog</Link></div></main></>;

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const paragraphs = post.content.split('\n\n');

  return (
    <>
      <LandingNav />
      <main className="pt-16 lg:pt-20">
        <article>
          <div className="container-app py-8 max-w-3xl">
            <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors mb-6"><ArrowLeft size={16} /> {t('common.back')}</Link>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="mb-4"><Badge color={categoryColors[post.category] ?? 'primary'}>{post.category}</Badge></div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-surface-900 dark:text-white mb-4 leading-tight">{post.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-surface-400 mb-6">
                <span className="flex items-center gap-1.5"><User size={16} /> {post.author}</span>
                <span className="flex items-center gap-1.5"><Calendar size={16} /> {formatDate(post.date)}</span>
                <span className="flex items-center gap-1.5"><Clock size={16} /> {post.readTime} min read</span>
              </div>
              <div className="rounded-2xl overflow-hidden mb-8 aspect-[16/9]"><img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" /></div>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                {paragraphs.map((para, i) => {
                  const isHeading = para.startsWith('**') && para.endsWith('**');
                  if (isHeading) {
                    const text = para.replace(/\*\*/g, '');
                    return <h2 key={i} className="font-display text-xl font-bold text-surface-900 dark:text-white mt-8 mb-3">{text}</h2>;
                  }
                  return <p key={i} className="text-surface-600 dark:text-surface-300 leading-relaxed mb-4">{para}</p>;
                })}
              </div>
              <div className="flex items-center gap-3 mt-12 p-6 rounded-2xl bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800">
                <LingoMascot variant="happy" size={48} />
                <div>
                  <p className="font-display font-bold text-surface-900 dark:text-white">Enjoyed this article?</p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Start reading stories with ReadLingo today!</p>
                </div>
                <Link to="/signup" className="ml-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">Get Started <ArrowRight size={14} /></Link>
              </div>
            </motion.div>
          </div>
        </article>
      </main>
      <LandingFooter />
    </>
  );
}
