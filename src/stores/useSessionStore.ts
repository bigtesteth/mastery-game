import { create } from 'zustand';
import { getDatabase } from '../db/database';
import { PracticeSession, SessionType } from '../types';

interface SessionState {
  sessions: PracticeSession[];
  isLoading: boolean;
  load: (lifeTaskId: string) => Promise<void>;
  addSession: (
    lifeTaskId: string,
    durationMinutes: number,
    quality: PracticeSession['quality'],
    type: SessionType,
    notes: string
  ) => Promise<PracticeSession>;
  deleteSession: (id: string) => Promise<void>;
  getTodaySessions: () => PracticeSession[];
  getTodayMinutes: () => number;
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  isLoading: true,

  load: async (lifeTaskId: string) => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<PracticeSession>(
      'SELECT * FROM practice_sessions WHERE lifeTaskId = ? ORDER BY createdAt DESC',
      [lifeTaskId]
    );
    set({ sessions: rows, isLoading: false });
  },

  addSession: async (lifeTaskId, durationMinutes, quality, type, notes) => {
    const db = await getDatabase();
    const session: PracticeSession = {
      id: generateId(),
      lifeTaskId,
      date: todayString(),
      durationMinutes,
      quality,
      type,
      notes,
      createdAt: new Date().toISOString(),
    };
    await db.runAsync(
      'INSERT INTO practice_sessions (id, lifeTaskId, date, durationMinutes, quality, type, notes, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [session.id, session.lifeTaskId, session.date, session.durationMinutes, session.quality, session.type, session.notes, session.createdAt]
    );
    set({ sessions: [session, ...get().sessions] });
    return session;
  },

  deleteSession: async (id: string) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM practice_sessions WHERE id = ?', [id]);
    set({ sessions: get().sessions.filter((s) => s.id !== id) });
  },

  getTodaySessions: () => {
    const today = todayString();
    return get().sessions.filter((s) => s.date === today);
  },

  getTodayMinutes: () => {
    return get()
      .getTodaySessions()
      .reduce((sum, s) => sum + s.durationMinutes, 0);
  },
}));
