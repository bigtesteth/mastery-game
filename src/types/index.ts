export type Phase = 'apprentice' | 'creative' | 'master';

export type SessionType = 'deliberate' | 'observational' | 'passive';

export type Domain =
  | 'music'
  | 'coding'
  | 'writing'
  | 'chess'
  | 'martial_arts'
  | 'art'
  | 'science'
  | 'business'
  | 'language'
  | 'other';

export interface User {
  id: string;
  name: string;
  createdAt: string; // ISO date string
  onboardingComplete: boolean;
}

export interface LifeTask {
  id: string;
  userId: string;
  domain: Domain;
  customName: string; // e.g. "Guitar", "Python", "Brazilian Jiu-Jitsu"
  totalMinutes: number;
  phase: Phase;
  startedAt: string;
}

export interface PracticeSession {
  id: string;
  lifeTaskId: string;
  date: string; // ISO date string
  durationMinutes: number;
  quality: 1 | 2 | 3 | 4 | 5;
  type: SessionType;
  notes: string;
  createdAt: string;
}

export interface Project {
  id: string;
  lifeTaskId: string;
  title: string;
  description: string;
  deadline: string | null; // ISO date string
  isCompleted: boolean;
  completedAt: string | null;
  xpReward: number;
  createdAt: string;
}

export interface Mentor {
  id: string;
  lifeTaskId: string;
  name: string;
  domain: string;
  isHistorical: boolean; // true = historical figure from the book
  notes: string;
  relationshipLevel: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
}

export interface MasteryKey {
  id: string;
  title: string;
  quote: string;
  author: string; // person the insight is attributed to
  unlockedAtMinutes: number; // total minutes required to unlock
}

export interface MasteryProgress {
  lifeTaskId: string;
  focus: number;       // 0-100: depth of concentration in sessions
  discipline: number;  // 0-100: consistency / streak-based
  creativity: number;  // 0-100: unlocked through observational sessions
  intuition: number;   // 0-100: locked until creative phase
  socialIntelligence: number; // 0-100: mentor relationship based
  currentStreak: number;      // days
  longestStreak: number;
  totalXp: number;
  unlockedKeyIds: string[];
}
