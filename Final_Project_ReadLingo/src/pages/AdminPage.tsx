import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, FolderTree, HelpCircle, Mail,
  Sparkles, LogOut, Menu, X, Search,
  Trash2, Plus, ArrowLeft, Eye, Edit, CheckCircle2, MessageSquare, Clock
} from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { LoadingState } from '../components/ui/Loading';
import { adminService, storyService, authService, contactService, type ContactMessage } from '../services';
import { apiUploadFile, getMediaUrl } from '../services/api/client';
import type { AdminStats, AdminUser, Story, Category } from '../types';

type TabKey =
  | 'dashboard'
  | 'users'
  | 'stories'
  | 'categories'
  | 'quiz'
  | 'messages';

const tabs: { key: TabKey; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'stories', label: 'Stories', icon: BookOpen },
  { key: 'categories', label: 'Categories', icon: FolderTree },
  { key: 'quiz', label: 'Quiz', icon: HelpCircle },
  { key: 'messages', label: 'Contact Messages', icon: Mail },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<AdminUser[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [messageFilter, setMessageFilter] = useState<'all' | 'Open' | 'Resolved'>('all');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

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
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catForm, setCatForm] = useState({ name: '', description: '', iconUrl: '' });
  const [uploadingCatCover, setUploadingCatCover] = useState(false);

  const handleCatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCatCover(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const url = await apiUploadFile<string>('/files/images?container=CategoryImages', formData);
      setCatForm((prev) => ({ ...prev, iconUrl: getMediaUrl(url) }));
    } catch (err: any) {
      alert(err?.message || 'Failed to upload category image');
    } finally {
      setUploadingCatCover(false);
    }
  };

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
      const [s, u, st, cat, lvl, msg] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        storyService.getStories(),
        storyService.getCategories(),
        storyService.getLevels(),
        contactService.getMessages(),
      ]);
      setStats(s);
      setRecentUsers(u);
      setStories(st);
      setCategories(cat);
      setLevels(lvl);
      setMessages(msg);
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

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCat) {
        await storyService.updateCategory(editingCat.id, catForm);
      } else {
        await storyService.createCategory(catForm);
      }
      setShowCreateCatModal(false);
      setEditingCat(null);
      setCatForm({ name: '', description: '', iconUrl: '' });
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Failed to save category.');
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

  const handleToggleMessageStatus = async (msg: ContactMessage) => {
    const nextStatus = msg.status === 'Resolved' ? 'Open' : 'Resolved';
    try {
      await contactService.updateStatus(msg.id, nextStatus);
      setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, status: nextStatus } : m)));
      if (selectedMessage?.id === msg.id) {
        setSelectedMessage((prev) => prev ? { ...prev, status: nextStatus } : null);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update message status');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await contactService.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to delete message');
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage) return;
    setSavingStatus(true);
    try {
      await contactService.updateStatus(selectedMessage.id, 'Resolved', replyText);
      setMessages((prev) => prev.map((m) => (m.id === selectedMessage.id ? { ...m, status: 'Resolved', adminResponse: replyText } : m)));
      setSelectedMessage((prev) => prev ? { ...prev, status: 'Resolved', adminResponse: replyText } : null);
      setReplyText('');
    } catch (err: any) {
      alert(err?.message || 'Failed to update response');
    } finally {
      setSavingStatus(false);
    }
  };

  const filteredUsers = recentUsers.filter(
    (u) =>
      u.role?.toLowerCase() !== 'admin' &&
      u.email?.toLowerCase() !== 'admin@lingo.app' &&
      (u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const filteredMessages = messages.filter((m) => {
    const query = messageSearch.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(query) ||
      m.email.toLowerCase().includes(query) ||
      m.subject.toLowerCase().includes(query) ||
      m.message.toLowerCase().includes(query);
    if (!matchesSearch) return false;
    if (messageFilter === 'all') return true;
    return m.status === messageFilter;
  });

  const openMessagesCount = messages.filter((m) => m.status === 'Open' || m.status === 'InProgress').length;

  const currentTabLabel = tabs.find((t) => t.key === activeTab)?.label || 'Dashboard';

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers ?? 0, icon: Users, color: 'from-primary-500 to-primary-700', display: (stats?.totalUsers ?? 0).toLocaleString() },
    { label: 'Total Stories', value: stats?.totalStories ?? 0, icon: BookOpen, color: 'from-secondary-500 to-secondary-700', display: (stats?.totalStories ?? 0).toLocaleString() },
    { label: 'Premium Users', value: stats?.premiumUsers ?? 0, icon: Sparkles, color: 'from-success-500 to-success-700', display: (stats?.premiumUsers ?? 0).toLocaleString() },
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
          const badgeCount = tab.key === 'messages' ? openMessagesCount : 0;
          return (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-surface-300 hover:bg-surface-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </div>
              {badgeCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-danger-500 text-white animate-pulse">
                  {badgeCount}
                </span>
              )}
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              {recentUsers.filter((u) => u.role?.toLowerCase() !== 'admin' && u.email?.toLowerCase() !== 'admin@lingo.app').map((u) => (
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
        <div>
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">All Categories</h2>
          <p className="text-surface-500 dark:text-surface-400 text-xs">Manage story categories and cover images</p>
        </div>
        <Button
          onClick={() => {
            setEditingCat(null);
            setCatForm({ name: '', description: '', iconUrl: '' });
            setShowCreateCatModal(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={16} /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {categories.map((c) => (
          <Card key={c.id} className="overflow-hidden p-0 border border-surface-200 dark:border-surface-800 hover:border-primary-500/50 transition-all group">
            <div className="relative h-36 bg-surface-800 overflow-hidden">
              {c.image || c.iconUrl ? (
                <img
                  src={c.image || c.iconUrl}
                  alt={c.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-900/60 to-surface-900 text-surface-300 font-bold text-sm">
                  {c.name}
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-white">
                <span className="font-bold text-sm truncate">{c.name}</span>
                <span className="text-xs bg-white/20 backdrop-blur px-2 py-0.5 rounded-full font-medium">
                  {c.storyCount || 0} stories
                </span>
              </div>
            </div>
            <div className="p-3 flex items-center justify-between">
              <p className="text-xs text-surface-500 dark:text-surface-400 truncate flex-1 mr-2">
                {c.description || 'No description'}
              </p>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => {
                    setEditingCat(c);
                    setCatForm({
                      name: c.name,
                      description: c.description || '',
                      iconUrl: c.image || c.iconUrl || '',
                    });
                    setShowCreateCatModal(true);
                  }}
                  className="p-1.5 text-surface-400 hover:text-warning-500 transition-colors"
                  title="Edit Category"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(c.id)}
                  className="p-1.5 text-surface-400 hover:text-danger-500 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
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

  const renderMessages = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">Contact Messages & Inquiries</h2>
          <p className="text-surface-500 dark:text-surface-400 text-xs">Messages and support tickets submitted from the contact form</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={messageFilter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setMessageFilter('all')}
          >
            All ({messages.length})
          </Button>
          <Button
            size="sm"
            variant={messageFilter === 'Open' ? 'primary' : 'secondary'}
            onClick={() => setMessageFilter('Open')}
          >
            Open ({openMessagesCount})
          </Button>
          <Button
            size="sm"
            variant={messageFilter === 'Resolved' ? 'primary' : 'secondary'}
            onClick={() => setMessageFilter('Resolved')}
          >
            Resolved ({messages.filter((m) => m.status === 'Resolved').length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-surface-400 text-xs">Total Inquiries</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{messages.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning-500/10 text-warning-500 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-surface-400 text-xs">Pending / Open</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">{openMessagesCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success-500/10 text-success-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-surface-400 text-xs">Resolved</p>
              <p className="text-xl font-bold text-surface-900 dark:text-white">
                {messages.filter((m) => m.status === 'Resolved').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input
            type="text"
            value={messageSearch}
            onChange={(e) => setMessageSearch(e.target.value)}
            placeholder="Search by sender, email, subject, text..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-900 dark:text-white placeholder-surface-400 border border-surface-200 dark:border-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        {filteredMessages.length === 0 ? (
          <div className="p-12 text-center text-surface-400">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-base font-semibold">No contact messages found</p>
            <p className="text-xs text-surface-500 mt-1">When users fill out the contact form, messages will appear here in real time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-surface-500 dark:text-surface-400 border-b border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800/50">
                  <th className="px-4 py-3 font-medium">Sender</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Message Preview</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedMessage(m)}
                    className="border-b border-surface-100 dark:border-surface-800 hover:bg-surface-50 dark:hover:bg-surface-800/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-surface-900 dark:text-white">{m.name}</div>
                      <div className="text-xs text-surface-400">{m.email || 'No email'}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-surface-800 dark:text-surface-200 max-w-[180px] truncate">
                      {m.subject}
                    </td>
                    <td className="px-4 py-3 text-surface-500 dark:text-surface-400 max-w-[280px] truncate">
                      {m.message}
                    </td>
                    <td className="px-4 py-3 text-xs text-surface-400 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={m.status === 'Resolved' ? 'success' : 'warning'}>
                        {m.status === 'Resolved' ? 'Resolved' : 'Open'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedMessage(m)}
                          className="p-1.5 text-surface-400 hover:text-primary-500 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleMessageStatus(m)}
                          className={`p-1.5 transition-colors ${m.status === 'Resolved' ? 'text-success-500 hover:text-warning-500' : 'text-surface-400 hover:text-success-500'}`}
                          title={m.status === 'Resolved' ? 'Mark as Open' : 'Mark as Resolved'}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(m.id)}
                          className="p-1.5 text-surface-400 hover:text-danger-500 transition-colors"
                          title="Delete Message"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
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
          {activeTab === 'messages' && renderMessages()}
        </main>

        {/* Modal: View Message Details */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-lg w-full border border-surface-200 dark:border-surface-800 shadow-2xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge color={selectedMessage.status === 'Resolved' ? 'success' : 'warning'}>
                      {selectedMessage.status === 'Resolved' ? 'Resolved' : 'Open'}
                    </Badge>
                    <span className="text-xs text-surface-400">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-surface-900 dark:text-white">{selectedMessage.subject}</h3>
                </div>
                <button onClick={() => setSelectedMessage(null)}>
                  <X size={20} className="text-surface-400 hover:text-surface-900 dark:hover:text-white" />
                </button>
              </div>

              <div className="bg-surface-50 dark:bg-surface-800/60 p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-xs text-surface-500 dark:text-surface-400 border-b border-surface-200 dark:border-surface-700 pb-2">
                  <span>From: <strong className="text-surface-900 dark:text-white">{selectedMessage.name}</strong></span>
                  <span>Email: <a href={`mailto:${selectedMessage.email}`} className="text-primary-500 underline font-medium">{selectedMessage.email || 'N/A'}</a></span>
                </div>
                <div className="pt-2 text-sm text-surface-800 dark:text-surface-200 whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </div>
              </div>

              {selectedMessage.adminResponse && (
                <div className="bg-primary-50/50 dark:bg-primary-950/30 border border-primary-200 dark:border-primary-800/40 p-3.5 rounded-xl text-xs">
                  <span className="font-bold text-primary-600 dark:text-primary-400 block mb-1">Admin Response / Note:</span>
                  <p className="text-surface-700 dark:text-surface-300">{selectedMessage.adminResponse}</p>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-surface-200 dark:border-surface-800">
                <label className="block text-xs font-semibold text-surface-600 dark:text-surface-300">
                  Update Admin Note / Resolution
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="e.g. Replied via email on Aug 23..."
                    className="input text-sm flex-1"
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={savingStatus || !replyText.trim()}
                    onClick={handleSendReply}
                  >
                    Save Note
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-surface-200 dark:border-surface-800">
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                >
                  <Trash2 size={14} className="mr-1" /> Delete
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={selectedMessage.status === 'Resolved' ? 'secondary' : 'primary'}
                    onClick={() => handleToggleMessageStatus(selectedMessage)}
                  >
                    <CheckCircle2 size={14} className="mr-1" />
                    {selectedMessage.status === 'Resolved' ? 'Reopen Inquiry' : 'Mark as Resolved'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelectedMessage(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Modal: Create/Edit Category */}
        {showCreateCatModal && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-surface-900 rounded-2xl p-6 max-w-md w-full border border-surface-200 dark:border-surface-800 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-surface-900 dark:text-white">
                  {editingCat ? 'Edit Category' : 'Add New Category'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateCatModal(false);
                    setEditingCat(null);
                  }}
                >
                  <X size={20} className="text-surface-400" />
                </button>
              </div>
              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-surface-600 dark:text-surface-300">Category Name</label>
                  <input
                    required
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    className="input text-sm"
                    placeholder="e.g. Technology, Adventure, Science"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-surface-600 dark:text-surface-300">Description</label>
                  <input
                    value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    className="input text-sm"
                    placeholder="Short description of this category..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-surface-600 dark:text-surface-300">Category Cover Image</label>
                  <div className="flex items-center gap-2">
                    <input
                      value={catForm.iconUrl}
                      onChange={(e) => setCatForm({ ...catForm, iconUrl: e.target.value })}
                      className="input text-sm flex-1"
                      placeholder="Image URL or upload file"
                    />
                    <label className="px-3 py-2 rounded-lg bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 text-surface-800 dark:text-white text-xs font-medium cursor-pointer shrink-0">
                      {uploadingCatCover ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCatFileUpload}
                        disabled={uploadingCatCover}
                      />
                    </label>
                  </div>
                  {catForm.iconUrl && (
                    <div className="mt-2 relative h-28 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700">
                      <img src={catForm.iconUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => {
                      setShowCreateCatModal(false);
                      setEditingCat(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingCat ? 'Save Changes' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
