import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Trash2, Save, Plus, X, Upload, Eye, Edit } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { LoadingState } from '../components/ui/Loading';
import { storyService } from '../services';
import { apiUploadFile, getMediaUrl } from '../services/api/client';
import type { Story, StoryChapter, Category } from '../types';

export default function AdminStoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [story, setStory] = useState<Story | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Edit Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImageUrl: '',
    storyCategoryId: '',
    storyLevelId: '',
    estimatedMinutes: 5,
    isPublished: true,
  });

  // Chapter Modals
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [chapterForm, setChapterForm] = useState({ title: '', content: '' });
  const [submittingChapter, setSubmittingChapter] = useState(false);

  const [editingChapter, setEditingChapter] = useState<StoryChapter | null>(null);
  const [showEditChapterModal, setShowEditChapterModal] = useState(false);
  const [editChapterForm, setEditChapterForm] = useState({ title: '', content: '' });
  const [submittingEditChapter, setSubmittingEditChapter] = useState(false);

  const [viewingChapter, setViewingChapter] = useState<StoryChapter | null>(null);
  const [showViewChapterModal, setShowViewChapterModal] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);

  const loadStory = async () => {
    if (!id) return;
    setLoadError(null);
    try {
      const [storyData, catList, levelList] = await Promise.all([
        storyService.getStoryById(id),
        storyService.getCategories(),
        storyService.getLevels(),
      ]);

      if (storyData) {
        setStory(storyData);
        const matchingCat = catList.find((c) => c.name === storyData.category);
        const matchingLvl = levelList.find((l) => l.name === storyData.difficulty);
        setFormData({
          title: storyData.title,
          description: storyData.description || '',
          coverImageUrl: storyData.coverImage || '',
          storyCategoryId: matchingCat?.id || (catList[0]?.id || ''),
          storyLevelId: matchingLvl?.id || (levelList[0]?.id || ''),
          estimatedMinutes: storyData.readingTimeMinutes || 5,
          isPublished: true,
        });
      } else {
        setLoadError('Story could not be loaded. It may not be published yet or you may not have access.');
      }
      setCategories(catList);
      setLevels(levelList);
    } catch (e: any) {
      console.error('Failed to load story details:', e);
      setLoadError(e?.message || 'Failed to load story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStory();
  }, [id]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await apiUploadFile<string>('/files/images?container=StoryCovers', body);
      setFormData((prev) => ({ ...prev, coverImageUrl: getMediaUrl(res) }));
    } catch (err: any) {
      alert(err?.message || 'Failed to upload cover image');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleUpdateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    try {
      await storyService.updateStory(id, formData);
      alert('Story updated successfully!');
      loadStory();
    } catch (err: any) {
      alert(err?.message || 'Failed to update story.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStory = async () => {
    if (!id || !confirm('Are you sure you want to delete this story? This cannot be undone.')) return;
    try {
      await storyService.deleteStory(id);
      navigate('/admin');
    } catch (err: any) {
      alert(err?.message || 'Failed to delete story.');
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !chapterForm.title || !chapterForm.content) return;
    setSubmittingChapter(true);
    try {
      await storyService.createChapter({
        storyId: id,
        title: chapterForm.title,
        content: chapterForm.content,
      });
      setShowAddChapterModal(false);
      setChapterForm({ title: '', content: '' });
      loadStory();
    } catch (err: any) {
      alert(err?.message || 'Failed to add chapter.');
    } finally {
      setSubmittingChapter(false);
    }
  };

  const handleOpenEditChapter = (ch: StoryChapter) => {
    setEditingChapter(ch);
    setEditChapterForm({ title: ch.title, content: ch.content || '' });
    setShowEditChapterModal(true);
  };

  const handleUpdateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapter || !editChapterForm.title || !editChapterForm.content) return;
    setSubmittingEditChapter(true);
    try {
      await storyService.updateChapter(editingChapter.id, editChapterForm);
      setShowEditChapterModal(false);
      setEditingChapter(null);
      loadStory();
    } catch (err: any) {
      alert(err?.message || 'Failed to update chapter.');
    } finally {
      setSubmittingEditChapter(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Delete this chapter?')) return;
    try {
      await storyService.deleteChapter(chapterId);
      loadStory();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete chapter.');
    }
  };

  const handleOpenViewChapter = (ch: StoryChapter) => {
    setViewingChapter(ch);
    setShowViewChapterModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-ink-900 flex items-center justify-center">
        <LoadingState message="Loading story details..." />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-ink-900 flex flex-col items-center justify-center p-6 text-center">
        <BookOpen className="w-12 h-12 text-surface-400 mb-3" />
        <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Story Not Found</h2>
        {loadError && (
          <p className="text-sm text-danger-500 dark:text-danger-400 mb-4 max-w-sm">{loadError}</p>
        )}
        <Button onClick={() => navigate('/admin')}>Back to Admin</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-ink-900 pb-12">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 rounded-lg text-surface-600 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-surface-900 dark:text-white leading-tight">{story.title}</h1>
              <p className="text-surface-500 dark:text-surface-400 text-xs">Admin Story Manager</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => navigate(`/read/${story.id}`)} className="hidden sm:flex items-center gap-1.5 text-xs">
              <Eye size={14} /> Read Story
            </Button>
            <button
              onClick={handleDeleteStory}
              className="px-3 py-2 rounded-xl bg-danger-500/10 text-danger-500 hover:bg-danger-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>
            <Button onClick={handleUpdateStory} disabled={saving} className="flex items-center gap-1.5 text-xs">
              <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-base font-bold text-surface-900 dark:text-white mb-4">Edit Story Details</h2>
              <form onSubmit={handleUpdateStory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-1">Title</label>
                  <input
                    required
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-1">Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input text-sm"
                    placeholder="Enter story overview/description..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-1">Cover Image</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={formData.coverImageUrl}
                      onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                      className="input text-sm flex-1"
                      placeholder="https://... or upload"
                    />
                    <label className="px-4 py-2.5 rounded-xl bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-800 dark:text-white text-xs font-medium cursor-pointer shrink-0 flex items-center gap-1.5">
                      <Upload size={14} />
                      {uploadingCover ? 'Uploading...' : 'Upload'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} disabled={uploadingCover} />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-1">Category</label>
                    <select
                      value={formData.storyCategoryId}
                      onChange={(e) => setFormData({ ...formData, storyCategoryId: e.target.value })}
                      className="input text-sm"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-1">Difficulty Level</label>
                    <select
                      value={formData.storyLevelId}
                      onChange={(e) => setFormData({ ...formData, storyLevelId: e.target.value })}
                      className="input text-sm"
                    >
                      {levels.map((l) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-1">Reading Time (Minutes)</label>
                    <input
                      type="number"
                      min={1}
                      value={formData.estimatedMinutes}
                      onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 5 })}
                      className="input text-sm"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Update Story'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Chapters Section */}
            <Card className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-surface-900 dark:text-white">Chapters ({story.chapters?.length || 0})</h2>
                  <p className="text-surface-500 dark:text-surface-400 text-xs">Manage reading chapters, view content, update or delete</p>
                </div>
                <Button onClick={() => setShowAddChapterModal(true)} className="flex items-center gap-1.5 text-xs">
                  <Plus size={14} /> Add Chapter
                </Button>
              </div>

              {story.chapters && story.chapters.length > 0 ? (
                <div className="space-y-3">
                  {story.chapters.map((ch, idx) => (
                    <div
                      key={ch.id}
                      className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 flex items-start justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge color="primary">Chapter {ch.chapterNumber || idx + 1}</Badge>
                          <h4 className="font-semibold text-surface-900 dark:text-white text-sm">{ch.title}</h4>
                        </div>
                        <p className="text-surface-600 dark:text-surface-300 text-xs line-clamp-2">{ch.content || 'No content added.'}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleOpenViewChapter(ch)}
                          className="p-1.5 text-surface-400 hover:text-primary-500 transition-colors"
                          title="View Chapter Content"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenEditChapter(ch)}
                          className="p-1.5 text-surface-400 hover:text-warning-500 transition-colors"
                          title="Edit Chapter"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteChapter(ch.id)}
                          className="p-1.5 text-surface-400 hover:text-danger-500 transition-colors"
                          title="Delete Chapter"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-surface-400 text-sm border-2 border-dashed border-surface-200 dark:border-surface-800 rounded-xl">
                  No chapters created yet. Click "Add Chapter" to create one.
                </div>
              )}
            </Card>
          </div>

          {/* Right Column: Preview & Status */}
          <div className="space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider">Preview Card</h3>
              <div className="rounded-xl overflow-hidden bg-surface-800 h-48 relative">
                {formData.coverImageUrl ? (
                  <img src={formData.coverImageUrl} alt={formData.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-surface-400 font-bold">
                    {formData.title || 'Story Cover'}
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge color="primary">{story.category}</Badge>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg text-surface-900 dark:text-white mb-1">{formData.title || 'Untitled Story'}</h4>
                <p className="text-surface-500 dark:text-surface-400 text-xs mb-3">{formData.description || 'No description'}</p>
                <div className="flex items-center gap-2">
                  <Badge color="surface">{story.difficulty}</Badge>
                  <span className="text-surface-500 dark:text-surface-400 text-xs">{formData.estimatedMinutes} min read</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Modal: Add Chapter */}
      {showAddChapterModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-lg w-full border border-surface-200 dark:border-surface-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-surface-900 dark:text-white">Add New Chapter</h3>
              <button onClick={() => setShowAddChapterModal(false)}><X size={20} className="text-surface-400" /></button>
            </div>
            <form onSubmit={handleAddChapter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-1">Chapter Title</label>
                <input
                  required
                  value={chapterForm.title}
                  onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                  className="input text-sm"
                  placeholder="e.g. Chapter 1: The Beginning"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-1">Chapter Content</label>
                <textarea
                  required
                  rows={8}
                  value={chapterForm.content}
                  onChange={(e) => setChapterForm({ ...chapterForm, content: e.target.value })}
                  className="input text-sm"
                  placeholder="Write full story chapter content paragraphs here..."
                />
              </div>

              <Button type="submit" fullWidth disabled={submittingChapter}>
                {submittingChapter ? 'Adding...' : 'Add Chapter'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Chapter */}
      {showEditChapterModal && editingChapter && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-lg w-full border border-surface-200 dark:border-surface-800 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg text-surface-900 dark:text-white">Edit Chapter</h3>
              <button onClick={() => setShowEditChapterModal(false)}><X size={20} className="text-surface-400" /></button>
            </div>
            <form onSubmit={handleUpdateChapter} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-1">Chapter Title</label>
                <input
                  required
                  value={editChapterForm.title}
                  onChange={(e) => setEditChapterForm({ ...editChapterForm, title: e.target.value })}
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-300 mb-1">Chapter Content</label>
                <textarea
                  required
                  rows={8}
                  value={editChapterForm.content}
                  onChange={(e) => setEditChapterForm({ ...editChapterForm, content: e.target.value })}
                  className="input text-sm"
                />
              </div>

              <Button type="submit" fullWidth disabled={submittingEditChapter}>
                {submittingEditChapter ? 'Updating...' : 'Update Chapter'}
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Chapter */}
      {showViewChapterModal && viewingChapter && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-lg w-full border border-surface-200 dark:border-surface-800 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-surface-200 dark:border-surface-800 pb-3">
              <div>
                <Badge color="primary">Chapter {viewingChapter.chapterNumber}</Badge>
                <h3 className="font-bold text-lg text-surface-900 dark:text-white mt-1">{viewingChapter.title}</h3>
              </div>
              <button onClick={() => setShowViewChapterModal(false)}><X size={20} className="text-surface-400" /></button>
            </div>
            <div className="overflow-y-auto flex-1 text-sm text-surface-700 dark:text-surface-200 whitespace-pre-wrap leading-relaxed pr-2">
              {viewingChapter.content || 'No content in this chapter.'}
            </div>
            <div className="pt-3 border-t border-surface-200 dark:border-surface-800 flex justify-end">
              <Button variant="secondary" onClick={() => setShowViewChapterModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
