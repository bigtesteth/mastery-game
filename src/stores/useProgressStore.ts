import { create } from 'zustand';
import { getDatabase } from '../db/database';
import { MasteryProgress, PracticeSession } from '../types';
import { MASTERY_KEYS } from '../constants/masteryKeys';

interface ProgressState {
  progress: MasteryProgress | null;
  isLoading: boolean;
  load: (lifeTaskId: string) => Promise<void>;
  recalculate: (
    lifeTaskId: string,
    sessions: PracticeSession[],
    totalMinutes: number,
    mentorCount: number,
    maxRelationshipLevel: number
  ) => Promise<void>;
  addXp: (lifeTaskId: string, amount: number) => Promise<void>;
  checkUnlocks: (lifeTaskId: string, totalMinutes: number) => Promise<string[]>;
}

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function calculateStreak(sessions: PracticeSession[]): { current: number; longest: number } {
  if (sessions.length === 0) return { current: 0, longest: 0 };

  const dates = [...new Set(sessions.map((s) => s.date))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);

  let current = 0;
  let longest = 0;
  let streak = 0;
  let expectedDate = today;

  for (const date of dates) {
    if (date === expectedDate) {
      streak++;
      const prev = new Date(expectedDate);
      prev.setDate(prev.getDate() - 1);
      expectedDate = prev.toISOString().slice(0, 10);
    } else {
      if (current === 0) current = streak;
      longest = Math.max(longest, streak);
      streak = 1;
      const d = new Date(date);
      d.setDate(d.getDate() - 1);
      expectedDate = d.toISOString().slice(0, 10);
    }
  }

  if (current === 0) current = streak;
  longest = Math.max(longest, streak);

  return { current, longest };
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: null,
  isLoading: true,

  load: async (lifeTaskId: string) => {
    const db = await getDatabase();
    const row = await db.getFirstAsync<MasteryProgress & { unlockedKeyIds: string }>(
      'SELECT * FROM mastery_progress WHERE lifeTaskId = ?',
      [lifeTaskId]
    );
    if (!row) {
      set({ progress: null, isLoading: false });
      return;
    }
    set({
      progress: {
        ...row,
        unlockedKeyIds: JSON.parse(row.unlockedKeyIds || '[]'),
      },
      isLoading: false,
    });
  },

  recalculate: async (lifeTaskId, sessions, totalMinutes, mentorCount, maxRelationshipLevel) => {
    const db = await getDatabase();
    const { current, longest } = calculateStreak(sessions);

    // Focus: average quality of deliberate sessions (0-100)
    const deliberate = sessions.filter((s) => s.type === 'deliberate');
    const avgQuality = deliberate.length > 0
      ? deliberate.reduce((sum, s) => sum + s.quality, 0) / deliberate.length
      : 0;
    const focus = clamp(Math.round((avgQuality / 5) * 100));

    // Discipline: streak-based (streak of 30+ = 100)
    const discipline = clamp(Math.round((current / 30) * 100));

    // Creativity: observational sessions ratio
    const observational = sessions.filter((s) => s.type === 'observational').length;
    const creativity = clamp(Math.round((observational / Math.max(sessions.length, 1)) * 200));

    // Intuition: unlocks at creative phase (500h), grows with total time
    const intuition = totalMinutes >= 500 * 60
      ? clamp(Math.round(((totalMinutes - 500 * 60) / (4500 * 60)) * 100))
      : 0;

    // Social Intelligence: mentor relationships
    const socialIntelligence = clamp(
      Math.round((mentorCount * 10 + maxRelationshipLevel * 10))
    );

    await db.runAsync(
      `UPDATE mastery_progress SET
        focus = ?, discipline = ?, creativity = ?,
        intuition = ?, socialIntelligence = ?,
        currentStreak = ?, longestStreak = ?
       WHERE lifeTaskId = ?`,
      [focus, discipline, creativity, intuition, socialIntelligence, current, longest, lifeTaskId]
    );

    const existing = get().progress;
    set({
      progress: existing
        ? { ...existing, focus, discipline, creativity, intuition, socialIntelligence, currentStreak: current, longestStreak: longest }
        : null,
    });
  },

  addXp: async (lifeTaskId, amount) => {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE mastery_progress SET totalXp = totalXp + ? WHERE lifeTaskId = ?',
      [amount, lifeTaskId]
    );
    const existing = get().progress;
    if (existing) {
      set({ progress: { ...existing, totalXp: existing.totalXp + amount } });
    }
  },

  checkUnlocks: async (lifeTaskId, totalMinutes) => {
    const db = await getDatabase();
    const existing = get().progress;
    if (!existing) return [];

    const newlyUnlocked: string[] = [];
    const currentIds = new Set(existing.unlockedKeyIds);

    for (const key of MASTERY_KEYS) {
      if (!currentIds.has(key.id) && totalMinutes >= key.unlockedAtMinutes) {
        currentIds.add(key.id);
        newlyUnlocked.push(key.id);
      }
    }

    if (newlyUnlocked.length > 0) {
      const updated = [...currentIds];
      await db.runAsync(
        'UPDATE mastery_progress SET unlockedKeyIds = ? WHERE lifeTaskId = ?',
        [JSON.stringify(updated), lifeTaskId]
      );
      set({ progress: { ...existing, unlockedKeyIds: updated } });
    }

    return newlyUnlocked;
  },
}));
