import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, FolderTree, HelpCircle, Mail,
  BarChart3, Sparkles, Settings, LogOut, Menu, X, Search,
  DollarSign, Trash2, Plus, ArrowLeft, Eye, Edit
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { LoadingState } from '../components/ui/Loading';
import { adminService, storyService, authService } from '../services';
import { apiUploadFile, getMediaUrl } from '../services/api/client';
import type { AdminStats, AdminUser, Story, Category } from '../types';

type TabKey =
  | 'dashboard'
  | 'users'
  | 'stories'
  | 'categories'
  | 'quiz'
  | 'messages'
  | 'statistics'
  | 'ai'
  | 'settings';

const tabs: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'stories', label: 'Stories', icon: BookOpen },
  { key: 'categories', label: 'Categories', icon: FolderTree },
  { key: 'quiz', label: 'Quiz', icon: HelpCircle },
  { key: 'messages', label: 'Contact Messages', icon: Mail },
  { key: 'statistics', label: 'Statistics', icon: BarChart3 },
  { key: 'ai', label: 'AI Stories', icon: Sparkles },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Modals & Form States
  const [showCreateStoryModal, setShowCreateStoryModal] = useState(false);
  const [storyForm, setStoryForm] = useState({
    title: '',
    description: '',
    coverImageUrl: '',
    storyCategoryId: '',
    storyLevelId: '',
    estimatedMinutes: 5,
  });
  const [uploadingCover, setUploadingCover] = useState(false);

  const [showCreateCatModal, setShowCreateCatModal] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '' });



  const handleCoverFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const url = await apiUploadFile<string>('/files/images?container=StoryCovers', formData);
      setStoryForm((prev) => ({ ...prev, coverImageUrl: getMediaUrl(url) }));
    } catch (err: any) {
      alert(err?.message || 'Failed to upload image');
    } finally {
      setUploadingCover(false);
    }
  };

  const loadData = async () => {
    try {
      const [s, u, st, cat, lvl] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        storyService.getStories(),
        storyService.getCategories(),
        storyService.getLevels(),
      ]);
      setStats(s);
      setRecentUsers(u);
      setStories(st);
      setCategories(cat);
      setLevels(lvl);
    } catch (e) {
      console.warn('Error loading admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    sessionStorage.removeItem('adminAuth');
    await authService.logout();
    navigate('/admin-login');
  };

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await storyService.createStory({
        ...storyForm,
        storyCategoryId: storyForm.storyCategoryId || (categories[0]?.id || ''),
        storyLevelId: storyForm.storyLevelId || (levels[0]?.id || ''),
      });
      setShowCreateStoryModal(false);
      setStoryForm({ title: '', description: '', coverImageUrl: '', storyCategoryId: '', storyLevelId: '', estimatedMinutes: 5 });
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to create story.');
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this story?')) return;
    try {
      await storyService.deleteStory(id);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete story.');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await storyService.createCategory(catForm);
      setShowCreateCatModal(false);
      setCatForm({ name: '', description: '' });
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to create category.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await storyService.deleteCategory(id);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete category.');
    }
  };

  const handleToggleUserStatus = async (user: AdminUser) => {
    try {
      await adminService.updateUserStatus(user.id, user.status !== 'active');
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to update user status.');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminService.deleteUser(id);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete user.');
    }
  };

  const filteredUsers = recentUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const currentTabLabel = tabs.find((t) => t.key === activeTab)?.label || 'Dashboard';

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'from-primary-500 to-primary-700', display: (stats?.totalUsers ?? 0).toLocaleString() },
    { label: 'Total Stories', value: stats?.totalStories ?? 0, icon: BookOpen, color: 'from-secondary-500 to-secondary-700', display: (stats?.totalStories ?? 0).toLocaleString() },
    { label: 'Premium Users', value: stats?.premiumUsers ?? 0, icon: Sparkles, color: 'from-success-500 to-success-700', display: (stats?.premiumUsers ?? 0).toLocaleString() },
    { label: 'Revenue', value: stats?.revenue ?? 0, icon: DollarSign, color: 'from-warning-500 to-warning-700', display: `$${(stats?.revenue ?? 0).toLocaleString()}` },
  ];

  const renderSidebar = () => (
    <div className="flex flex-col h-full bg-surface-900 dark:bg-ink-950 w-64">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-surface-800">
        <div className="bg-gradient-primary w-9 h-9 rounded-xl flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">Read<span className="text-primary-400">Lingo</span></h1>
          <p className="text-surface-400 text-xs">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-surface-300 hover:bg-surface-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-surface-800 space-y-1">
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-surface-300 hover:bg-surface-800 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to App
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger-400 hover:bg-danger-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="p-4">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-surface-500 dark:text-surface-400 text-xs font-medium mb-1">{card.label}</p>
              <p className="text-surface-900 dark:text-white text-xl font-bold">{card.display}</p>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h3 className="text-surface-900 dark:text-white font-semibold mb-4">Users Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-surface-500 dark:text-surface-400 border-b border-surface-200 dark:border-surface-700">
                <th className="pb-2 font-medium">User</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((u) => (
                <tr key={u.id} className="border-b border-surface-100 dark:border-surface-800">
                  <td className="py-3 font-medium text-surface-900 dark:text-white">{u.name}</td>
                  <td className="py-3 text-surface-500 dark:text-surface-400">{u.email}</td>
                  <td className="py-3"><Badge color="primary">{u.role}</Badge></td>
                  <td className="py-3"><Badge color={u.status === 'active' ? 'success' : 'danger'}>{u.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search users by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 border border-surface-200 dark:border-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-surface-500 dark:text-surface-400 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/30">
                  <td className="px-4 py-3 font-medium text-surface-900 dark:text-white">{u.name}</td>
                  <td className="px-4 py-3 text-surface-500 dark:text-surface-400">{u.email}</td>
                  <td className="px-4 py-3"><Badge color="primary">{u.role}</Badge></td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleUserStatus(u)}>
                      <Badge color={u.status === 'active' ? 'success' : 'danger'}>{u.status}</Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-surface-400 hover:text-danger-500 transition-colors" title="Delete User">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderStories = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">All Stories</h2>
        <Button onClick={() => setShowCreateStoryModal(true)} className="flex items-center gap-2">
          <Plus size={16} /> Add New Story
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stories.map((s) => (
          <Card key={s.id} className="overflow-hidden cursor-pointer hover:border-primary-500/50 transition-colors" onClick={() => navigate(`/admin/story/${s.id}`)}>
            <div className="relative h-40 bg-surface-800">
              {s.coverImage ? (
                <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-surface-400 font-bold">
                  {s.title}
                </div>
              )}
              <div className="absolute top-2 left-2">
                <Badge color="primary">{s.category}</Badge>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-surface-900 dark:text-white font-semibold mb-1 line-clamp-1">{s.title}</h3>
              <p className="text-surface-500 dark:text-surface-400 text-xs mb-2">{s.description || 'No description'}</p>
              <div className="flex items-center justify-between">
                <Badge color="surface">{s.difficulty}</Badge>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => navigate(`/admin/story/${s.id}`)} className="p-1.5 text-surface-400 hover:text-primary-500 transition-colors" title="Manage Story Page">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => navigate(`/admin/story/${s.id}`)} className="p-1.5 text-surface-400 hover:text-warning-500 transition-colors" title="Edit Story Page">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteStory(s.id)} className="p-1.5 text-surface-400 hover:text-danger-500 transition-colors" title="Delete Story">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">All Categories</h2>
        <Button onClick={() => setShowCreateCatModal(true)} className="flex items-center gap-2">
          <Plus size={16} /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((c) => (
          <Card key={c.id} className="p-5 flex items-center justify-between">
            <div>
              <h3 className="text-surface-900 dark:text-white font-semibold mb-1">{c.name}</h3>
              <p className="text-surface-500 dark:text-surface-400 text-xs">{c.storyCount || 0} stories</p>
            </div>
            <button onClick={() => handleDeleteCategory(c.id)} className="p-1.5 text-surface-400 hover:text-danger-500 transition-colors" title="Delete Category">
              <Trash2 className="w-4 h-4" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderQuiz = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">Quiz Management</h2>
          <p className="text-surface-500 dark:text-surface-400 text-xs">Overview of quizzes attached to story chapters</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.map((s) => (
          <Card key={s.id} className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Badge color="primary">{s.category}</Badge>
              <Badge color="surface">{s.difficulty}</Badge>
            </div>
            <div>
              <h3 className="font-bold text-surface-900 dark:text-white text-base line-clamp-1">{s.title}</h3>
              <p className="text-surface-500 dark:text-surface-400 text-xs">{(s.chapters || []).length} chapters created</p>
            </div>

            <div className="pt-2 border-t border-surface-200 dark:border-surface-800 flex justify-between items-center">
              <span className="text-xs text-success-500 font-medium flex items-center gap-1">
                <Sparkles size={14} /> AI Auto-Quiz Enabled
              </span>
              <Button size="sm" variant="secondary" onClick={() => navigate(`/admin/story/${s.id}`)}>
                Manage Chapters
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-ink-900 flex items-center justify-center">
        <LoadingState message="Loading admin panel..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-ink-900 flex">
      {/* Desktop sidebar */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30">
        {renderSidebar()}
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 lg:hidden flex">
          <div className="relative w-64 h-full">
            {renderSidebar()}
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-surface-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-surface-500">
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-surface-900 dark:text-white text-lg font-semibold">{currentTabLabel}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge color="primary">Admin</Badge>
          </div>
        </header>

        {/* Tab content */}
        <main className="flex-1 p-4 lg:p-6">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'stories' && renderStories()}
          {activeTab === 'categories' && renderCategories()}
          {activeTab === 'quiz' && renderQuiz()}
          {(activeTab !== 'dashboard' && activeTab !== 'users' && activeTab !== 'stories' && activeTab !== 'categories' && activeTab !== 'quiz') && (
            <Card className="p-8 text-center text-surface-500">
              <p>{currentTabLabel} section is dynamically connected to the backend API.</p>
            </Card>
          )}
        </main>

        {/* Modal: Create Story */}
        {showCreateStoryModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-md w-full border border-surface-200 dark:border-surface-800 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-surface-900 dark:text-white">Add New Story</h3>
                <button onClick={() => setShowCreateStoryModal(false)}><X size={20} className="text-surface-400" /></button>
              </div>
              <form onSubmit={handleCreateStory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-surface-600 dark:text-surface-300">Title</label>
                  <input required value={storyForm.title} onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })} className="input text-sm" placeholder="Story Title" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-surface-600 dark:text-surface-300">Description</label>
                  <textarea value={storyForm.description} onChange={(e) => setStoryForm({ ...storyForm, description: e.target.value })} className="input text-sm" rows={3} placeholder="Story Description..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-surface-600 dark:text-surface-300">Cover Image</label>
                  <div className="flex items-center gap-2">
                    <input value={storyForm.coverImageUrl} onChange={(e) => setStoryForm({ ...storyForm, coverImageUrl: e.target.value })} className="input text-sm flex-1" placeholder="Image URL or upload file" />
                    <label className="px-3 py-2 rounded-lg bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-800 dark:text-white text-xs font-medium cursor-pointer shrink-0">
                      {uploadingCover ? 'Uploading...' : 'Upload'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleCoverFileUpload} disabled={uploadingCover} />
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-surface-600 dark:text-surface-300">Category</label>
                    <select value={storyForm.storyCategoryId} onChange={(e) => setStoryForm({ ...storyForm, storyCategoryId: e.target.value })} className="input text-sm">
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-surface-600 dark:text-surface-300">Level</label>
                    <select value={storyForm.storyLevelId} onChange={(e) => setStoryForm({ ...storyForm, storyLevelId: e.target.value })} className="input text-sm">
                      {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                </div>
                <Button type="submit" fullWidth>Create Story</Button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Category */}
        {showCreateCatModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-md w-full border border-surface-200 dark:border-surface-800 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-surface-900 dark:text-white">Add New Category</h3>
                <button onClick={() => setShowCreateCatModal(false)}><X size={20} className="text-surface-400" /></button>
              </div>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-surface-600 dark:text-surface-300">Category Name</label>
                  <input required value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="input text-sm" placeholder="Adventure" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-surface-600 dark:text-surface-300">Description</label>
                  <input value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} className="input text-sm" placeholder="Category description..." />
                </div>
                <Button type="submit" fullWidth>Create Category</Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
