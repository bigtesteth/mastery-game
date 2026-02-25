import { create } from 'zustand';
import { getDatabase } from '../db/database';
import { User, LifeTask, Domain } from '../types';
import { PHASE_THRESHOLDS } from '../constants/masteryKeys';

interface UserState {
  user: User | null;
  lifeTask: LifeTask | null;
  isLoading: boolean;
  load: () => Promise<void>;
  createUser: (name: string) => Promise<User>;
  setLifeTask: (domain: Domain, customName: string) => Promise<LifeTask>;
  completeOnboarding: () => Promise<void>;
  addMinutes: (minutes: number) => Promise<void>;
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function getPhase(totalMinutes: number): LifeTask['phase'] {
  if (totalMinutes >= PHASE_THRESHOLDS.master) return 'master';
  if (totalMinutes >= PHASE_THRESHOLDS.creative) return 'creative';
  return 'apprentice';
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  lifeTask: null,
  isLoading: true,

  load: async () => {
    const db = await getDatabase();
    const user = await db.getFirstAsync<User>('SELECT * FROM users LIMIT 1');
    if (!user) {
      set({ user: null, lifeTask: null, isLoading: false });
      return;
    }
    const lifeTask = await db.getFirstAsync<LifeTask>(
      'SELECT * FROM life_tasks WHERE userId = ? LIMIT 1',
      [user.id]
    );
    set({
      user: { ...user, onboardingComplete: Boolean(user.onboardingComplete) },
      lifeTask: lifeTask ?? null,
      isLoading: false,
    });
  },

  createUser: async (name: string) => {
    const db = await getDatabase();
    const user: User = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
      onboardingComplete: false,
    };
    await db.runAsync(
      'INSERT INTO users (id, name, createdAt, onboardingComplete) VALUES (?, ?, ?, ?)',
      [user.id, user.name, user.createdAt, 0]
    );
    set({ user });
    return user;
  },

  setLifeTask: async (domain: Domain, customName: string) => {
    const db = await getDatabase();
    const { user } = get();
    if (!user) throw new Error('No user found');

    const lifeTask: LifeTask = {
      id: generateId(),
      userId: user.id,
      domain,
      customName,
      totalMinutes: 0,
      phase: 'apprentice',
      startedAt: new Date().toISOString(),
    };
    await db.runAsync(
      'INSERT INTO life_tasks (id, userId, domain, customName, totalMinutes, phase, startedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [lifeTask.id, lifeTask.userId, lifeTask.domain, lifeTask.customName, 0, 'apprentice', lifeTask.startedAt]
    );
    // initialize progress row
    await db.runAsync(
      'INSERT OR IGNORE INTO mastery_progress (lifeTaskId) VALUES (?)',
      [lifeTask.id]
    );
    set({ lifeTask });
    return lifeTask;
  },

  completeOnboarding: async () => {
    const db = await getDatabase();
    const { user } = get();
    if (!user) return;
    await db.runAsync('UPDATE users SET onboardingComplete = 1 WHERE id = ?', [user.id]);
    set({ user: { ...user, onboardingComplete: true } });
  },

  addMinutes: async (minutes: number) => {
    const db = await getDatabase();
    const { lifeTask } = get();
    if (!lifeTask) return;
    const newTotal = lifeTask.totalMinutes + minutes;
    const newPhase = getPhase(newTotal);
    await db.runAsync(
      'UPDATE life_tasks SET totalMinutes = ?, phase = ? WHERE id = ?',
      [newTotal, newPhase, lifeTask.id]
    );
    set({ lifeTask: { ...lifeTask, totalMinutes: newTotal, phase: newPhase } });
  },
}));
