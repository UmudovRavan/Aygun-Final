import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Bookmark, ListChecks } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LingoMascot from '../components/ui/LingoMascot';
import { LoadingState } from '../components/ui/Loading';
import { storyService } from '../services';
import type { Story } from '../types';

const getDifficultyColor = (level: string): 'success' | 'warning' | 'danger' => {
  const l = (level || '').toLowerCase();
  if (l === 'a1' || l === 'a2' || l.includes('beg') || l.includes('elem')) return 'success';
  if (l === 'b1' || l === 'b2' || l.includes('inter')) return 'warning';
  return 'danger';
};

export default function StoryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => { const s = await storyService.getStoryById(id!); setStory(s || null); setLoading(false); };
    load();
  }, [id]);

  const [isBookmarking, setIsBookmarking] = useState(false);

  const handleToggleBookmark = async () => {
    if (!story || isBookmarking) return;
    setIsBookmarking(true);
    const prev = story.isBookmarked;
    setStory({ ...story, isBookmarked: !prev });
    try {
      const newState = await storyService.toggleBookmark(story.id, prev);
      setStory((s) => (s ? { ...s, isBookmarked: newState } : null));
    } catch {
      setStory((s) => (s ? { ...s, isBookmarked: prev } : null));
    } finally {
      setIsBookmarking(false);
    }
  };

  if (loading) return <AppLayout><LoadingState message="Loading story..." /></AppLayout>;
  if (!story) return <AppLayout><div className="container-app py-20 text-center"><h1 className="font-display text-2xl font-bold text-surface-900 dark:text-white mb-2">Story not found</h1><Link to="/library"><Button variant="primary" className="mt-4">Back to Library</Button></Link></div></AppLayout>;

  return (
    <AppLayout>
      <div className="container-app py-8 max-w-4xl">
        <Link to="/library" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors mb-6"><ArrowLeft size={16} /> Back to Library</Link>
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <div className="w-full sm:w-48 h-64 rounded-2xl overflow-hidden shadow-card shrink-0"><img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" /></div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3"><Badge color="primary">{story.category}</Badge><Badge color={getDifficultyColor(story.difficulty)}>{story.difficulty}</Badge></div>
            <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">{story.title}</h1>
            <p className="text-surface-500 dark:text-surface-400 mb-4">by {story.author}</p>
            <p className="text-surface-600 dark:text-surface-300 mb-6">{story.description}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={`/read/${story.id}`}><Button variant="gradient" size="lg" rightIcon={<BookOpen size={18} />}>Start Reading</Button></Link>
              <Button
                variant={story.isBookmarked ? 'primary' : 'ghost'}
                size="lg"
                onClick={handleToggleBookmark}
                disabled={isBookmarking}
                leftIcon={<Bookmark size={18} className={story.isBookmarked ? 'fill-white text-white' : ''} />}
              >
                {story.isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
            </div>
          </div>
        </div>
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4"><ListChecks size={20} className="text-primary-500" /><h2 className="font-display text-lg font-bold text-surface-900 dark:text-white">Chapters</h2></div>
          <div className="space-y-3">
            {story.chapters.map((ch) => (
              <Link key={ch.id} to={`/read/${story.id}`} className="flex items-center gap-4 p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${ch.isCompleted ? 'bg-success-100 dark:bg-success-500/20 text-success-600' : 'bg-primary-100 dark:bg-primary-500/20 text-primary-600'}`}>{ch.chapterNumber}</div>
                <div className="flex-1"><p className="font-medium text-surface-900 dark:text-white text-sm">{ch.title}</p><p className="text-xs text-surface-400">{ch.readingTimeMinutes} min read</p></div>
              </Link>
            ))}
          </div>
        </Card>
        <div className="flex justify-center mt-8"><LingoMascot variant="thinking" size={56} /></div>
      </div>
    </AppLayout>
  );
}
