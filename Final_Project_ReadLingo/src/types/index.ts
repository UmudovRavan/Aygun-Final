export type DifficultyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface User {
  id: string; name: string; userName?: string; firstName?: string; lastName?: string; email: string; avatar: string;
  level: number; rank: string; totalXP: number;
  currentStreak: number; longestStreak: number;
  hearts: number; maxHearts: number;
  plan: 'free' | 'pro' | 'premium';
  isAnonymousInLeaderboard?: boolean;
  nativeLanguage: string; dailyGoalMinutes: number; learningLevel?: string; joinedAt: string;
  stats: {
    currentLevel: number; progressToNextLevel: number; nextLevelXP: number;
    storiesRead: number; wordsLearned: number; quizzesCompleted: number;
    averageAccuracy: number; totalReadingTime: number;
  };
  badges: Badge[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  level: string;
  totalXp: number;
  storiesReadCount: number;
  wordsLearnedCount: number;
  quizzesCompletedCount: number;
  accuracyPercentage: number;
  isCurrentUser: boolean;
  isAnonymous: boolean;
}

export interface Badge { id: string; name: string; icon: string; color: string; description: string; }

export interface Story {
  id: string; title: string; author: string; coverImage: string;
  category: string; difficulty: DifficultyLevel; description: string;
  wordCount: number; readingTimeMinutes: number; rating: number; readersCount: number;
  isBookmarked: boolean; isFeatured: boolean; chapters: StoryChapter[];
}

export interface StoryChapter { id: string; chapterNumber: number; title: string; content: string; readingTimeMinutes: number; isCompleted: boolean; }
export interface Category { id: string; name: string; icon?: string; color?: string; description?: string; storyCount: number; image: string; iconUrl?: string; }

export interface VocabularyItem {
  id: string; word: string; translation: string; pronunciation: string;
  partOfSpeech: string; example: string; storyTitle: string;
  masteryLevel: 'New' | 'Learning' | 'Mastered'; reviewCount: number;
  isFavorite: boolean; isMastered: boolean;
}

export interface Flashcard {
  id: string;
  word: string;
  translation: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  category?: string;
  isFavorite: boolean;
  isLearned: boolean;
}

export interface Quiz { id: string; storyId: string; storyTitle: string; questions: QuizQuestion[]; }
export interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'match' | 'comprehension';
  question: string;
  word?: string;
  contextSentence?: string;
  options?: string[];
  pairs?: { left: string; right: string }[];
  correctAnswer: string;
  explanation?: string;
  timeLimit?: number;
}
export interface QuizResult { score: number; totalQuestions: number; accuracy: number; xpEarned: number; heartsRemaining: number; correctAnswers: number; incorrectAnswers: number; }

export interface Achievement { id: string; title: string; description: string; icon: string; xpReward: number; progress: number; target: number; isCompleted: boolean; }
export interface LearningSession { id: string; activity: string; date: string; duration: number; xp: number; wordsLearned: number; storiesRead: number; }
export interface WordDefinition {
  word: string;
  lemma?: string;
  pronunciation: string;
  partOfSpeech: string;
  definition: string;
  definitionEn?: string;
  definitionAz?: string;
  translation: string;
  example: string;
  contextSentence?: string;
  isSaved: boolean;
  isFavorite: boolean;
  isLearned: boolean;
}

export interface BlogPost { id: string; title: string; excerpt: string; content: string; coverImage: string; category: string; author: string; date: string; readTime: number; }

export interface AdminStats { totalUsers: number; totalStories: number; premiumUsers: number; revenue: number; dailyActiveUsers: number; monthlyActiveUsers: number; }
export interface AdminActivity { id: string; user: string; action: string; target: string; avatar: string; timestamp: string; }
export interface AdminUser { id: string; name: string; email: string; avatar: string; role?: string; plan: 'free' | 'pro' | 'premium'; level: number; status: 'active' | 'suspended'; joinedAt: string; }
export interface ContactMessage { id: string; name: string; email: string; subject: string; message: string; date: string; read: boolean; }

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'lingo';
  text: string;
  createdAt?: string;
}

