export interface LevelInfo {
  level: number;
  rank: string;
  currentLevelBaseXP: number;
  nextLevelXP: number;
  xpInCurrentLevel: number;
  xpRequiredForCurrentLevel: number;
  progressPercent: number;
  xpToNextLevel: number;
}

const LEVEL_THRESHOLDS = [
  { level: 1, minXP: 0, rank: 'Novice' },
  { level: 2, minXP: 200, rank: 'Explorer' },
  { level: 3, minXP: 500, rank: 'Apprentice' },
  { level: 4, minXP: 1000, rank: 'Reader' },
  { level: 5, minXP: 1800, rank: 'Bookworm' },
  { level: 6, minXP: 3000, rank: 'Scholar' },
  { level: 7, minXP: 4500, rank: 'Master' },
  { level: 8, minXP: 6500, rank: 'Grandmaster' },
  { level: 9, minXP: 9000, rank: 'Champion' },
  { level: 10, minXP: 12000, rank: 'Legend' },
];

export function calculateLevelFromXP(totalXP: number = 0): LevelInfo {
  const safeXP = Math.max(0, totalXP || 0);

  let currentThreshold = LEVEL_THRESHOLDS[0];
  let nextThreshold = LEVEL_THRESHOLDS[1];

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (safeXP >= LEVEL_THRESHOLDS[i].minXP) {
      currentThreshold = LEVEL_THRESHOLDS[i];
      if (i < LEVEL_THRESHOLDS.length - 1) {
        nextThreshold = LEVEL_THRESHOLDS[i + 1];
      } else {
        // Beyond Level 10 (3000 XP per subsequent level)
        const extraXP = safeXP - LEVEL_THRESHOLDS[i].minXP;
        const extraLevels = Math.floor(extraXP / 3000);
        const level = 10 + extraLevels;
        const currentBase = LEVEL_THRESHOLDS[i].minXP + extraLevels * 3000;
        const nextBase = currentBase + 3000;
        const xpInLevel = safeXP - currentBase;
        const progress = Math.min(100, Math.max(0, Math.round((xpInLevel / 3000) * 100)));

        return {
          level,
          rank: 'Legend',
          currentLevelBaseXP: currentBase,
          nextLevelXP: nextBase,
          xpInCurrentLevel: xpInLevel,
          xpRequiredForCurrentLevel: 3000,
          progressPercent: progress,
          xpToNextLevel: Math.max(0, nextBase - safeXP),
        };
      }
      break;
    }
  }

  const xpRequired = nextThreshold.minXP - currentThreshold.minXP;
  const xpInLevel = Math.max(0, safeXP - currentThreshold.minXP);
  const progress = Math.min(100, Math.max(0, Math.round((xpInLevel / xpRequired) * 100)));

  return {
    level: currentThreshold.level,
    rank: currentThreshold.rank,
    currentLevelBaseXP: currentThreshold.minXP,
    nextLevelXP: nextThreshold.minXP,
    xpInCurrentLevel: xpInLevel,
    xpRequiredForCurrentLevel: xpRequired,
    progressPercent: progress,
    xpToNextLevel: Math.max(0, nextThreshold.minXP - safeXP),
  };
}

export interface DynamicBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isUnlocked: boolean;
  progress: number;
  target: number;
}

export function getDynamicBadges(user: {
  totalXP: number;
  currentStreak: number;
  level: number;
  stats: {
    storiesRead: number;
    wordsLearned: number;
    quizzesCompleted: number;
    averageAccuracy: number;
  };
}): DynamicBadge[] {
  const { totalXP, currentStreak, level, stats } = user;

  return [
    {
      id: 'b1',
      name: 'First Steps',
      description: 'Complete your first story',
      icon: 'Sunrise',
      color: 'primary',
      isUnlocked: stats.storiesRead >= 1,
      progress: Math.min(1, stats.storiesRead),
      target: 1,
    },
    {
      id: 'b2',
      name: 'Word Hunter',
      description: 'Learn at least 10 vocabulary words',
      icon: 'BookOpen',
      color: 'success',
      isUnlocked: stats.wordsLearned >= 10,
      progress: Math.min(10, stats.wordsLearned),
      target: 10,
    },
    {
      id: 'b3',
      name: 'Streak Flame',
      description: 'Keep a 3-day reading streak alive',
      icon: 'Flame',
      color: 'warning',
      isUnlocked: currentStreak >= 3,
      progress: Math.min(3, currentStreak),
      target: 3,
    },
    {
      id: 'b4',
      name: 'Quiz Master',
      description: 'Achieve 80%+ accuracy on quizzes',
      icon: 'Star',
      color: 'amber',
      isUnlocked: stats.quizzesCompleted >= 1 && stats.averageAccuracy >= 80,
      progress: Math.min(80, stats.averageAccuracy),
      target: 80,
    },
    {
      id: 'b5',
      name: 'XP Seeker',
      description: 'Accumulate 500 Total XP',
      icon: 'Zap',
      color: 'primary',
      isUnlocked: totalXP >= 500,
      progress: Math.min(500, totalXP),
      target: 500,
    },
    {
      id: 'b6',
      name: 'Avid Reader',
      description: 'Complete 5 reading stories',
      icon: 'GraduationCap',
      color: 'indigo',
      isUnlocked: stats.storiesRead >= 5,
      progress: Math.min(5, stats.storiesRead),
      target: 5,
    },
    {
      id: 'b7',
      name: 'Explorer',
      description: 'Reach Level 3 in ReadLingo',
      icon: 'Compass',
      color: 'purple',
      isUnlocked: level >= 3,
      progress: Math.min(3, level),
      target: 3,
    },
    {
      id: 'b8',
      name: 'Grand Champion',
      description: 'Earn 2,000+ Total XP',
      icon: 'Moon',
      color: 'pink',
      isUnlocked: totalXP >= 2000,
      progress: Math.min(2000, totalXP),
      target: 2000,
    },
  ];
}
