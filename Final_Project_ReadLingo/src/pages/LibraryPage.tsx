import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Bookmark } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import StoryCard from '../components/ui/StoryCard';
import Card from '../components/ui/Card';
import LingoMascot from '../components/ui/LingoMascot';
import { LoadingState } from '../components/ui/Loading';
import { storyService } from '../services';
import type { Story, Category } from '../types';

interface LevelFilter {
  id: string;
  label: string;
  matches: string[];
}

const levels: LevelFilter[] = [
  { id: 'All', label: 'All Levels', matches: ['all'] },
  { id: 'Beginner', label: 'Beginner (A1)', matches: ['beginner', 'a1'] },
  { id: 'Elementary', label: 'Elementary (A2)', matches: ['elementary', 'a2'] },
  { id: 'Intermediate', label: 'Intermediate (B1)', matches: ['intermediate', 'b1'] },
  { id: 'Upper Intermediate', label: 'Upper Int. (B2)', matches: ['upper intermediate', 'upper-intermediate', 'upper int.', 'b2'] },
  { id: 'Advanced', label: 'Advanced (C1)', matches: ['advanced', 'c1'] },
  { id: 'Proficient', label: 'Proficient (C2)', matches: ['proficient', 'c2'] },
];

export default function LibraryPage() {
  const [searchParams] = useSearchParams();
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState(searchParams.get('level') || 'All');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [onlyBookmarked, setOnlyBookmarked] = useState(searchParams.get('filter') === 'bookmarked');

  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) setCategory(catParam);
    const lvlParam = searchParams.get('level');
    if (lvlParam) setLevel(lvlParam);
    if (searchParams.get('filter') === 'bookmarked') setOnlyBookmarked(true);
  }, [searchParams]);

  useEffect(() => {
    const load = async () => {
      const [s, c] = await Promise.all([storyService.getStories(), storyService.getCategories()]);
      setStories(s); setCategories(c); setLoading(false);
    };
    load();
  }, []);

  const matchesLevel = (storyDifficulty: string, selectedLevelId: string) => {
    if (selectedLevelId === 'All') return true;
    const diff = (storyDifficulty || '').trim().toLowerCase();
    const target = levels.find((l) => l.id.toLowerCase() === selectedLevelId.toLowerCase());
    if (target) {
      return target.matches.includes(diff) || diff.includes(target.id.toLowerCase());
    }
    return diff === selectedLevelId.toLowerCase();
  };

  const filtered = stories.filter((s) =>
    (search === '' || s.title.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase())) &&
    matchesLevel(s.difficulty, level) &&
    (category === 'All' || (s.category || '').toLowerCase() === category.toLowerCase()) &&
    (!onlyBookmarked || s.isBookmarked)
  );

  if (loading) return <AppLayout><LoadingState message="Loading library..." /></AppLayout>;

  return (
    <AppLayout>
      <div className="container-app py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-surface-900 dark:text-white mb-2">Story Library</h1>
            <p className="text-surface-500 dark:text-surface-400">Find your next adventure — filtered by level and category</p>
          </div>
          <div className="hidden sm:block"><LingoMascot variant="reading" size={56} /></div>
        </div>
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search stories..." className="input pl-12" />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
            {levels.map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => setLevel(lvl.id)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  level.toLowerCase() === lvl.id.toLowerCase()
                    ? 'bg-primary-600 text-white shadow-soft font-semibold'
                    : 'bg-white dark:bg-surface-800 text-surface-600 dark:text-surface-300 border border-surface-200 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-8">
          <button
            onClick={() => { setCategory('All'); setOnlyBookmarked(false); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${category === 'All' && !onlyBookmarked ? 'bg-secondary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300'}`}
          >
            All Categories
          </button>
          <button
            onClick={() => setOnlyBookmarked(!onlyBookmarked)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${onlyBookmarked ? 'bg-amber-500 text-white shadow-md' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:bg-amber-50 dark:hover:bg-amber-500/10'}`}
          >
            <Bookmark size={15} className={onlyBookmarked ? 'fill-white' : ''} />
            <span>Bookmarks</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => { setCategory(cat.name); setOnlyBookmarked(false); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${category === cat.name && !onlyBookmarked ? 'bg-secondary-600 text-white' : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">{filtered.map((s) => <StoryCard key={s.id} story={s} />)}</div>
        ) : (
          <Card className="p-12 text-center"><p className="text-surface-400">No stories found. Try adjusting your filters.</p></Card>
        )}
      </div>
    </AppLayout>
  );
}
