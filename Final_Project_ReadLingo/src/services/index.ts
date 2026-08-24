import type {
  User, Story, Category, VocabularyItem, Flashcard, Quiz, QuizResult, Achievement, LearningSession, Badge, AdminStats, AdminActivity, AdminUser, WordDefinition, BlogPost, LeaderboardEntry
} from '../types';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiUploadFile, getMediaUrl } from './api/client';
import { authService } from './authService';
import { chatService } from './chatService';
import { speakAzerbaijani, speakEnglish } from './ttsService';
import { mockBlogPosts } from '../data/mockData';
import { translateWordToAz, getDictionaryMetadata } from './translationHelper';
import { calculateLevelFromXP } from '../utils/levelUtils';

export { authService, chatService, speakAzerbaijani, speakEnglish, translateWordToAz, getDictionaryMetadata, calculateLevelFromXP };

export const userService = {
  getProfile: async (): Promise<User> => {
    const profile = await apiGet<any>('/profile');
    const avatarPath = profile.profilePictureUrl || profile.avatarUrl || '';
    
    let firstName = profile.firstName || '';
    let lastName = profile.lastName || '';

    if (firstName.includes('@')) {
      firstName = firstName.split('@')[0];
    }
    if (lastName.includes('@')) {
      lastName = lastName.split('@')[0];
    }

    const userName = profile.userName || profile.username || (profile.email ? profile.email.split('@')[0] : '');
    let fullName = userName || `${firstName} ${lastName}`.trim();
    const totalXP = profile.totalXp || profile.totalXP || 0;
    const levelInfo = calculateLevelFromXP(totalXP);

    return {
      id: profile.id || profile.userId || '',
      userName,
      firstName,
      lastName,
      name: fullName,
      email: profile.email || '',
      avatar: getMediaUrl(avatarPath),
      level: levelInfo.level,
      rank: levelInfo.rank,
      totalXP,
      currentStreak: profile.daysStreak || profile.currentStreak || 0,
      longestStreak: profile.longestStreak || 0,
      hearts: typeof profile.hearts === 'number' ? profile.hearts : 5,
      maxHearts: 5,
      plan: profile.plan || 'free',
      nativeLanguage: profile.nativeLanguage || 'Azerbaijani',
      dailyGoalMinutes: profile.dailyGoalMinutes || 15,
      learningLevel: profile.learningLevel || 'A1',
      joinedAt: profile.createdAt || new Date().toISOString(),
      stats: {
        currentLevel: levelInfo.level,
        progressToNextLevel: levelInfo.progressPercent,
        nextLevelXP: levelInfo.nextLevelXP,
        storiesRead: profile.storiesCompleted || profile.storiesReadCount || 0,
        wordsLearned: profile.wordsLearnedCount || 0,
        quizzesCompleted: profile.quizzesCompletedCount || 0,
        averageAccuracy: profile.accuracyPercentage || profile.averageAccuracy || 0,
        totalReadingTime: profile.totalReadingTimeMinutes || 0,
        todayReadingTime: profile.todayReadingMinutes ?? 0,
      },
      badges: profile.badges || [],
    };
  },

  getBadges: async (): Promise<Badge[]> => {
    try {
      return await apiGet<Badge[]>('/profile/badges');
    } catch {
      return [];
    }
  },

  updateProfile: async (data: Partial<User> & { profilePictureUrl?: string; firstName?: string; lastName?: string; userName?: string }): Promise<User> => {
    const payload: any = {};
    if (data.userName !== undefined) payload.userName = data.userName;
    if (data.firstName !== undefined) payload.firstName = data.firstName;
    if (data.lastName !== undefined) payload.lastName = data.lastName;
    if (data.avatar !== undefined) payload.profilePictureUrl = data.avatar;
    if (data.profilePictureUrl !== undefined) payload.profilePictureUrl = data.profilePictureUrl;
    if (data.nativeLanguage !== undefined) payload.nativeLanguage = data.nativeLanguage;
    if (data.dailyGoalMinutes !== undefined) payload.dailyGoalMinutes = data.dailyGoalMinutes;
    if (data.learningLevel !== undefined) payload.learningLevel = data.learningLevel;
    if (data.hearts !== undefined) payload.hearts = data.hearts;
    if (data.plan !== undefined) payload.plan = data.plan;

    await apiPut('/profile', payload);
    return userService.getProfile();
  },

  uploadAvatar: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const imageUrl = await apiUploadFile<string>('/files/images?container=ProfilePictures', formData);
    if (imageUrl) {
      await userService.updateProfile({ profilePictureUrl: imageUrl });
    }
    return getMediaUrl(imageUrl);
  },

  deleteAvatar: async (): Promise<void> => {
    try {
      const profile = await apiGet<any>('/profile');
      const currentAvatar = profile.profilePictureUrl || profile.avatarUrl;
      if (currentAvatar && currentAvatar.includes('/uploads/')) {
        await apiDelete(`/files?fileUrl=${encodeURIComponent(currentAvatar)}`);
      }
    } catch (e) {
      console.warn('File delete warning:', e);
    }
    await userService.updateProfile({ avatar: '' });
  },
};

export const storyService = {
  getStories: async (): Promise<Story[]> => {
    try {
      const [res, favs] = await Promise.all([
        apiGet<any>('/stories'),
        authService.isAuthenticated() ? apiGet<any[]>('/favorites').catch(() => []) : Promise.resolve([]),
      ]);
      const favSet = new Set((favs || []).map((f: any) => (f.storyId || f.id || '').toLowerCase()));
      const items = Array.isArray(res) ? res : res.items || [];
      return items.map((item: any) => ({
        id: item.id,
        title: item.title,
        author: item.author || 'ReadLingo',
        coverImage: item.coverImageUrl || '',
        category: item.storyCategoryName || item.category || 'General',
        difficulty: (item.storyLevelName || item.difficulty || 'A1') as any,
        description: item.description || '',
        wordCount: item.wordCount || 0,
        readingTimeMinutes: item.estimatedMinutes || 5,
        rating: item.averageRating || 5.0,
        readersCount: item.readersCount || 0,
        isBookmarked: favSet.has((item.id || '').toLowerCase()),
        isFeatured: item.isFeatured || false,
        chapters: (item.chapters || []).map((ch: any) => ({
          id: ch.id,
          chapterNumber: ch.order || ch.chapterNumber || 1,
          title: ch.title,
          content: ch.content || '',
          readingTimeMinutes: ch.estimatedMinutes || 3,
          isCompleted: ch.isCompleted || false,
        })),
      }));
    } catch (e) {
      console.error('getStories API error:', e);
      return [];
    }
  },

  getStoryById: async (id: string): Promise<Story | null> => {
    try {
      const [item, favs] = await Promise.all([
        apiGet<any>(`/stories/${id}`),
        authService.isAuthenticated() ? apiGet<any[]>('/favorites').catch(() => []) : Promise.resolve([]),
      ]);
      if (!item) return null;
      const favSet = new Set((favs || []).map((f: any) => (f.storyId || f.id || '').toLowerCase()));
      return {
        id: item.id,
        title: item.title,
        author: item.author || 'ReadLingo',
        coverImage: item.coverImageUrl || '',
        category: item.storyCategoryName || 'General',
        difficulty: (item.storyLevelName || 'A1') as any,
        description: item.description || '',
        wordCount: item.wordCount || 0,
        readingTimeMinutes: item.estimatedMinutes || 5,
        rating: item.averageRating || 5.0,
        readersCount: item.readersCount || 0,
        isBookmarked: favSet.has((item.id || id || '').toLowerCase()),
        isFeatured: item.isFeatured || false,
        chapters: (item.chapters || []).map((ch: any, idx: number) => ({
          id: ch.id,
          chapterNumber: ch.order || idx + 1,
          title: ch.title,
          content: ch.content || '',
          readingTimeMinutes: 3,
          isCompleted: false,
        })),
      };
    } catch {
      return null;
    }
  },

  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await apiGet<any>('/story-categories');
      const items = Array.isArray(res) ? res : res.items || [];
      return items.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        description: cat.description || '',
        icon: cat.icon || 'BookOpen',
        color: cat.color || 'bg-primary-500',
        storyCount: cat.storyCount || 0,
        image: cat.iconUrl || cat.imageUrl || cat.image || '',
        iconUrl: cat.iconUrl || cat.imageUrl || cat.image || '',
      }));
    } catch {
      return [];
    }
  },

  updateProgress: async (storyId: string, chapterIdOrProgress?: string | number, progress: number = 100, isCompleted: boolean = true): Promise<void> => {
    try {
      let chapterId: string | null = null;
      let prog = progress;
      if (typeof chapterIdOrProgress === 'number') {
        prog = chapterIdOrProgress;
      } else if (typeof chapterIdOrProgress === 'string') {
        chapterId = chapterIdOrProgress;
      }

      await apiPost('/progress', {
        storyId,
        chapterId,
        progressPercentage: prog,
        isCompleted,
      });
      if (chapterId) {
        await apiPost('/progress/reading-history', {
          storyId,
          chapterId,
          readingPositionPercentage: prog,
        }).catch(() => {});
      }
      await apiGet('/progress/streak').catch(() => {});
    } catch (e) {
      console.warn('updateProgress API warning:', e);
    }
  },

  toggleBookmark: async (storyId: string, isCurrentlyBookmarked?: boolean): Promise<boolean> => {
    try {
      if (isCurrentlyBookmarked === undefined) {
        const favs = await apiGet<any[]>('/favorites').catch(() => []);
        isCurrentlyBookmarked = (favs || []).some((f: any) => (f.storyId || f.id || '').toLowerCase() === storyId.toLowerCase());
      }

      if (isCurrentlyBookmarked) {
        await apiDelete(`/favorites/${storyId}`);
        return false;
      } else {
        await apiPost('/favorites', { storyId });
        return true;
      }
    } catch (e) {
      console.warn('toggleBookmark API error:', e);
      return !isCurrentlyBookmarked;
    }
  },

  createCategory: async (data: any): Promise<any> => {
    return await apiPost('/story-categories', {
      name: data.name,
      description: data.description || '',
      iconUrl: data.iconUrl || data.image || '',
    });
  },

  updateCategory: async (id: string, data: any): Promise<any> => {
    return await apiPut(`/story-categories/${id}`, {
      name: data.name,
      description: data.description || '',
      iconUrl: data.iconUrl || data.image || '',
    });
  },

  deleteCategory: async (id: string): Promise<any> => {
    return await apiDelete(`/story-categories/${id}`);
  },

  createStory: async (data: any): Promise<any> => {
    return await apiPost('/stories', data);
  },

  updateStory: async (id: string, data: any): Promise<any> => {
    return await apiPut(`/stories/${id}`, data);
  },

  deleteStory: async (id: string): Promise<any> => {
    return await apiDelete(`/stories/${id}`);
  },


  getLevels: async (): Promise<any[]> => {
    try {
      const res = await apiGet<any>('/story-levels');
      return Array.isArray(res) ? res : (res?.items || []);
    } catch {
      return [];
    }
  },

  createChapter: async (data: { storyId: string; title: string; content: string; order?: number }): Promise<any> => {
    return await apiPost('/chapters', data);
  },

  updateChapter: async (id: string, data: { title: string; content: string; order?: number }): Promise<any> => {
    return await apiPut(`/chapters/${id}`, data);
  },

  deleteChapter: async (id: string): Promise<any> => {
    return await apiDelete(`/chapters/${id}`);
  },
};

export const vocabularyService = {
  getVocabulary: async (): Promise<VocabularyItem[]> => {
    try {
      const res = await apiGet<any>('/vocabularies');
      const items = Array.isArray(res) ? res : res.items || res.value || [];
      return items.map((v: any) => {
        const firstDef = v.definitions?.[0] || v.Definitions?.[0];
        const rawWord = (v.word || v.Word || '').trim();
        const cleanWord = rawWord.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
        const meta = getDictionaryMetadata(cleanWord);
        const cachedTrans = localStorage.getItem(`readlingo_trans_${cleanWord}`);
        const translation = v.translation || v.Translation || firstDef?.definitionAz || firstDef?.DefinitionAz || cachedTrans || meta?.translation || firstDef?.definition || firstDef?.Definition || v.meanings?.[0] || '';
        const pronunciation = v.pronunciation || v.Pronunciation || meta?.pronunciation || `/${rawWord}/`;
        const partOfSpeech = v.partOfSpeech || v.PartOfSpeech || meta?.partOfSpeech || firstDef?.partOfSpeech || firstDef?.PartOfSpeech || 'noun';
        const example = v.example || v.Example || meta?.example || firstDef?.exampleSentence || firstDef?.ExampleSentence || '';

        return {
          id: v.id || v.Id,
          word: rawWord,
          translation,
          pronunciation,
          partOfSpeech,
          example,
          storyTitle: v.storyTitle || v.StoryTitle || '',
          masteryLevel: v.masteryLevel || (v.isMastered ? 'Mastered' : ((v.reviewCount || 0) > 0 ? 'Learning' : 'New')),
          reviewCount: v.reviewCount || 0,
          isFavorite: v.isFavorite || false,
          isMastered: v.isMastered || false,
        };
      });
    } catch {
      return [];
    }
  },
};

export const flashcardService = {
  getFlashcards: async (): Promise<Flashcard[]> => {
    try {
      const vocab = await vocabularyService.getVocabulary();
      return vocab.map((v) => ({
        id: v.id,
        word: v.word,
        translation: v.translation,
        pronunciation: v.pronunciation,
        partOfSpeech: v.partOfSpeech,
        definition: v.translation,
        example: v.example,
        category: v.storyTitle || 'General',
        isFavorite: v.isFavorite,
        isLearned: v.isMastered,
      }));
    } catch {
      return [];
    }
  },
  toggleFavorite: async (id: string): Promise<boolean> => {
    try {
      await apiPost(`/vocabularies/interactions`, { vocabularyId: id, isFavorite: true });
      return true;
    } catch {
      return false;
    }
  },
  markLearned: async (id: string): Promise<boolean> => {
    try {
      await apiPost(`/vocabularies/interactions`, { vocabularyId: id, isMastered: true });
      return true;
    } catch {
      return false;
    }
  },
};

export const quizService = {
  getQuiz: async (storyId: string, chapterId?: string): Promise<Quiz | null> => {
    try {
      const url = chapterId ? `/quizzes/story/${storyId}?chapterId=${chapterId}` : `/quizzes/story/${storyId}`;
      const res = await apiGet<any>(url);
      const quiz = res?.items ? res.items[0] : res;
      if (quiz && quiz.questions && quiz.questions.length > 0) {
        return {
          id: quiz.id || quiz.quizAttemptId || 'quiz',
          storyId: quiz.storyId || storyId,
          storyTitle: quiz.title || 'Quiz',
          questions: quiz.questions.map((q: any) => {
            const answers = q.answers || [];
            const correctAnswerText = q.correctAnswer || (answers.find((a: any) => a.isCorrect)?.text) || answers[0]?.text || '';
            const questionText = q.text || 'Question';
            return {
              id: q.id,
              type: 'comprehension',
              question: questionText,
              options: answers.map((a: any) => a.text),
              correctAnswer: correctAnswerText,
              explanation: q.explanation || '',
              explanationAz: q.explanationAz || q.explanation_az || '',
              timeLimit: q.timeLimitSeconds || 15,
            };
          }),
        };
      }
    } catch (err) {
      console.error('getQuiz error:', err);
    }
    return null;
  },

  submitQuiz: async (quizId: string, answers: Record<string, string>): Promise<QuizResult> => {
    const res = await apiPost<any>('/quizzes/submit', { quizId, answers });
    return {
      score: res.score || 0,
      totalQuestions: res.totalQuestions || 0,
      accuracy: res.accuracy || 0,
      xpEarned: res.xpEarned || 0,
      heartsRemaining: res.heartsRemaining || 0,
      correctAnswers: res.correctAnswers || 0,
      incorrectAnswers: res.incorrectAnswers || 0,
    };
  },

  recordQuizResult: async (dto: {
    storyId: string;
    chapterId?: string;
    correctAnswers: number;
    incorrectAnswers: number;
    xpEarned: number;
    remainingHearts: number;
  }): Promise<void> => {
    try {
      await apiPost('/quizzes/record-result', dto);
    } catch (e) {
      console.warn('recordQuizResult API warning:', e);
    }
  },

  createQuiz: async (data: { chapterId: string; title: string; description?: string; passingScore?: number; questions: any[] }): Promise<any> => {
    return await apiPost('/quizzes', data);
  },

  deleteQuiz: async (id: string): Promise<any> => {
    return await apiDelete(`/quizzes/${id}`);
  },
};

export const achievementService = {
  getAchievements: async (): Promise<Achievement[]> => {
    try {
      return await apiGet<Achievement[]>('/progress/achievements');
    } catch {
      return [];
    }
  },
};

export const sessionService = {
  getSessions: async (): Promise<LearningSession[]> => {
    try {
      return await apiGet<LearningSession[]>('/progress/sessions');
    } catch {
      return [];
    }
  },
};

export const adminService = {
  getStats: async (): Promise<AdminStats> => {
    try {
      const res = await apiGet<any>('/admin/dashboard');
      return {
        totalUsers: res.totalUsers || 0,
        totalStories: res.totalStories || 0,
        premiumUsers: res.activeSubscriptions || 0,
        revenue: res.totalRevenue || 0,
        dailyActiveUsers: res.totalUsers || 0,
        monthlyActiveUsers: res.totalUsers || 0,
      };
    } catch {
      return { totalUsers: 0, totalStories: 0, premiumUsers: 0, revenue: 0, dailyActiveUsers: 0, monthlyActiveUsers: 0 };
    }
  },
  getActivities: async (): Promise<AdminActivity[]> => {
    return [];
  },
  getUsers: async (): Promise<AdminUser[]> => {
    try {
      const res = await apiGet<any>('/admin/users');
      const items = Array.isArray(res) ? res : (res?.items || []);
      return items.map((u: any) => ({
        id: u.id,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
        email: u.email,
        avatar: u.profilePictureUrl || '',
        role: u.roles?.[0] || 'User',
        status: u.isActive ? 'active' : 'suspended',
        joinedAt: u.createdAt || new Date().toISOString(),
        lastActive: u.lastLoginAt || new Date().toISOString(),
        plan: u.roles?.includes('Admin') ? 'premium' : 'free',
      }));
    } catch {
      return [];
    }
  },
  updateUserStatus: async (id: string, isActive: boolean): Promise<any> => {
    return await apiPatch(`/admin/users/${id}/status`, { isActive });
  },
  deleteUser: async (id: string): Promise<any> => {
    return await apiDelete(`/admin/users/${id}`);
  },
};

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'Open' | 'InProgress' | 'Resolved' | 'Closed';
  adminResponse?: string;
  createdAt: string;
}

export const contactService = {
  sendMessage: async (data: { name: string; email: string; subject: string; message: string }): Promise<any> => {
    const formattedSubject = `[${data.name.trim()} | ${data.email.trim()}] ${data.subject.trim()}`;
    let result: any = null;
    try {
      result = await apiPost('/support-tickets', {
        subject: formattedSubject,
        message: data.message,
        priority: 2,
      });
    } catch (e) {
      console.warn('API error sending support ticket, saving locally:', e);
    }

    // Persist in localStorage so admin always has complete real-time record
    try {
      const local = JSON.parse(localStorage.getItem('readlingo_contact_messages') || '[]');
      const newMsg: ContactMessage = {
        id: result?.id || result?.data?.id || `msg_${Date.now()}`,
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: 'Open',
        createdAt: new Date().toISOString(),
      };
      local.unshift(newMsg);
      localStorage.setItem('readlingo_contact_messages', JSON.stringify(local));
    } catch {}

    return result || { success: true };
  },

  getMessages: async (): Promise<ContactMessage[]> => {
    let apiItems: ContactMessage[] = [];
    try {
      const res = await apiGet<any>('/support-tickets?pageSize=100');
      const items = Array.isArray(res) ? res : (res?.items || []);
      apiItems = items.map((item: any) => {
        let name = item.userEmail || 'Guest User';
        let email = item.userEmail || '';
        let subject = item.subject || '';

        const match = subject.match(/^\[(.*?)\s*\|\s*(.*?)\]\s*(.*)$/);
        if (match) {
          name = match[1];
          email = match[2];
          subject = match[3];
        }

        const statusMap: Record<number, 'Open' | 'InProgress' | 'Resolved' | 'Closed'> = {
          1: 'Open',
          2: 'InProgress',
          3: 'Resolved',
          4: 'Closed',
        };
        const statusStr = typeof item.status === 'number' ? (statusMap[item.status] || 'Open') : (item.status || 'Open');

        return {
          id: String(item.id),
          name,
          email,
          subject,
          message: item.message,
          status: statusStr,
          adminResponse: item.adminResponse,
          createdAt: item.createdAt || new Date().toISOString(),
        };
      });
    } catch (e) {
      console.warn('Could not fetch support tickets from API:', e);
    }

    try {
      const local: ContactMessage[] = JSON.parse(localStorage.getItem('readlingo_contact_messages') || '[]');
      const mergedMap = new Map<string, ContactMessage>();
      apiItems.forEach((m) => mergedMap.set(m.id, m));
      local.forEach((m) => {
        if (!mergedMap.has(m.id)) {
          mergedMap.set(m.id, m);
        } else {
          mergedMap.set(m.id, { ...mergedMap.get(m.id)!, ...m });
        }
      });
      return Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch {
      return apiItems;
    }
  },

  updateStatus: async (id: string, status: 'Open' | 'Resolved', adminResponse?: string): Promise<any> => {
    const statusCode = status === 'Resolved' ? 3 : 1;
    try {
      await apiPut(`/support-tickets/${id}`, {
        status: statusCode,
        priority: 2,
        adminResponse: adminResponse || 'Reviewed by Admin',
      });
    } catch (e) {
      console.warn('API updateStatus warning:', e);
    }

    try {
      const local: ContactMessage[] = JSON.parse(localStorage.getItem('readlingo_contact_messages') || '[]');
      const updated = local.map((m) => (m.id === id ? { ...m, status, adminResponse } : m));
      localStorage.setItem('readlingo_contact_messages', JSON.stringify(updated));
    } catch {}
  },

  deleteMessage: async (id: string): Promise<any> => {
    try {
      await apiDelete(`/support-tickets/${id}`);
    } catch (e) {
      console.warn('API deleteMessage warning:', e);
    }

    try {
      const local: ContactMessage[] = JSON.parse(localStorage.getItem('readlingo_contact_messages') || '[]');
      const filtered = local.filter((m) => m.id !== id);
      localStorage.setItem('readlingo_contact_messages', JSON.stringify(filtered));
    } catch {}
  },
};

export const blogService = {
  getPosts: async (): Promise<BlogPost[]> => {
    try {
      const res = await apiGet<BlogPost[]>('/blog');
      return res && res.length > 0 ? res : mockBlogPosts;
    } catch {
      return mockBlogPosts;
    }
  },
  getPostById: async (id: string): Promise<BlogPost | null> => {
    try {
      const res = await apiGet<BlogPost>(`/blog/${id}`);
      if (res && res.id) return res;
    } catch {
      // fallback
    }
    return mockBlogPosts.find((p) => String(p.id) === String(id)) || null;
  },
};

export const leaderboardService = {
  getLeaderboard: async (category: string = 'xp'): Promise<LeaderboardEntry[]> => {
    try {
      const res = await apiGet<any>(`/leaderboard?category=${category}`);
      const items = Array.isArray(res) ? res : res.items || [];
      return items.map((e: any) => ({
        rank: e.rank,
        userId: e.userId,
        userName: e.userName,
        firstName: e.firstName,
        lastName: e.lastName,
        profilePictureUrl: getMediaUrl(e.profilePictureUrl),
        level: e.level || 'A1',
        totalXp: e.totalXp || 0,
        storiesReadCount: e.storiesReadCount || 0,
        wordsLearnedCount: e.wordsLearnedCount || 0,
        quizzesCompletedCount: e.quizzesCompletedCount || 0,
        accuracyPercentage: e.accuracyPercentage || 0,
        isCurrentUser: e.isCurrentUser || false,
        isAnonymous: e.isAnonymous || false,
      }));
    } catch {
      return [];
    }
  },

  togglePrivacy: async (isAnonymous: boolean): Promise<void> => {
    await apiPatch(`/leaderboard/privacy?isAnonymous=${isAnonymous}`);
  },
};

export async function getWordDefinition(rawWord: string, contextSentence?: string): Promise<WordDefinition> {
  const word = rawWord.replace(/[^\w]/g, '').toLowerCase();
  if (!word) {
    return {
      word: '',
      pronunciation: '',
      partOfSpeech: '',
      definition: '',
      translation: '',
      example: '',
      contextSentence: contextSentence || '',
      isSaved: false,
      isFavorite: false,
      isLearned: false,
    };
  }

  let translation = '';
  let partOfSpeech = '';
  let pronunciation = `/${word}/`;
  let definition = '';
  let definitionEn = '';
  let definitionAz = '';
  let example = '';
  let lemma: string | undefined = undefined;

  // 1. Try Backend API with contextual sentence (/translations/translate)
  try {
    const res = await apiPost<any>('/translations/translate', {
      word,
      contextSentence: contextSentence || undefined,
      targetLanguage: 'az',
    });
    const resTranslation = res?.translation || res?.Translation || res?.translatedText || res?.result;
    const resLemma = res?.lemma || res?.Lemma;
    const resPos = res?.partOfSpeech || res?.PartOfSpeech;
    const resDefEn = res?.definitionEn || res?.DefinitionEn || res?.definition || res?.Definition;
    const resDefAz = res?.definitionAz || res?.DefinitionAz;

    if (resTranslation && resTranslation.toLowerCase() !== word) {
      translation = resTranslation;
    }
    if (resLemma && resLemma.toLowerCase() !== word.toLowerCase()) {
      lemma = resLemma;
    }
    if (resPos && resPos !== 'word') {
      partOfSpeech = resPos;
    }
    if (res?.pronunciation) {
      pronunciation = res.pronunciation;
    }
    if (resDefEn) {
      definitionEn = resDefEn;
      definition = resDefEn;
    }
    if (resDefAz) {
      definitionAz = resDefAz;
    }
  } catch (err) {
    console.warn('Backend translation failed, trying fallback:', err);
  }

  // 2. Fetch Dictionary details (phonetics, partOfSpeech, definition) if missing
  if (!definitionEn || !partOfSpeech || pronunciation === `/${word}/`) {
    try {
      const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      if (dictRes.ok) {
        const dictData = await dictRes.json();
        if (Array.isArray(dictData) && dictData.length > 0) {
          const item = dictData[0];
          if (item.phonetic && pronunciation === `/${word}/`) {
            pronunciation = item.phonetic;
          } else if (item.phonetics && item.phonetics.length > 0 && pronunciation === `/${word}/`) {
            const p = item.phonetics.find((ph: any) => ph.text);
            if (p?.text) pronunciation = p.text;
          }
          if (!partOfSpeech && item.meanings && item.meanings.length > 0) {
            partOfSpeech = item.meanings[0].partOfSpeech || '';
          }
          if (!definitionEn && item.meanings?.[0]?.definitions?.[0]?.definition) {
            definitionEn = item.meanings[0].definitions[0].definition;
            definition = definitionEn;
          }
          if (!example && item.meanings?.[0]?.definitions?.[0]?.example) {
            example = item.meanings[0].definitions[0].example;
          }
        }
      }
    } catch {
      // ignore dictionary error
    }
  }

  // 3. Fallback translation if not yet translated
  if (!translation || translation.toLowerCase() === word) {
    try {
      const fallbackRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|az`);
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        const azText = data?.responseData?.translatedText;
        if (azText && azText.toLowerCase() !== word) {
          translation = azText;
        }
      }
    } catch {
      // fallback error ignored
    }
  }

  return {
    word,
    lemma,
    pronunciation,
    partOfSpeech: partOfSpeech || 'word',
    definition: definition || definitionEn,
    definitionEn: definitionEn || undefined,
    definitionAz: definitionAz || undefined,
    translation: translation || word,
    example,
    contextSentence: contextSentence || '',
    isSaved: false,
    isFavorite: false,
    isLearned: false,
  };
}

export const subscriptionService = {
  getActive: async (): Promise<any> => {
    try {
      return await apiGet('/subscriptions/active');
    } catch {
      return null;
    }
  },
  subscribe: async (planName: string, price: number = 0): Promise<any> => {
    return await apiPost('/subscriptions', {
      planName,
      planType: 1,
      autoRenew: true,
      price,
      currency: 'USD',
      paymentMethod: 1,
    });
  },
};

export const paymentService = {
  createCheckoutSession: async (tier: number): Promise<{ checkoutUrl: string; sessionId: string }> => {
    const successUrl = `${window.location.origin}/pricing?payment=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${window.location.origin}/pricing?payment=cancelled`;
    const res = await apiPost<any>('/payments/checkout', {
      tier,
      successUrl,
      cancelUrl,
    });
    return res?.data || res;
  },
  getCurrent: async (): Promise<any> => {
    try {
      const res = await apiGet<any>('/payments/current');
      return res?.data || res;
    } catch {
      return null;
    }
  },
  cancel: async (): Promise<any> => {
    return await apiPost('/payments/cancel', {});
  },
  verifySession: async (sessionId: string): Promise<any> => {
    const res = await apiPost<any>(`/payments/verify?sessionId=${encodeURIComponent(sessionId)}`, {});
    return res?.data || res;
  },
};

export const getMockWordDefinition = getWordDefinition;
