import { create } from 'zustand';
import { getDatabase } from '../db/database';
import { Mentor } from '../types';

interface MentorState {
  mentors: Mentor[];
  isLoading: boolean;
  load: (lifeTaskId: string) => Promise<void>;
  addMentor: (
    lifeTaskId: string,
    name: string,
    domain: string,
    isHistorical: boolean,
    notes: string
  ) => Promise<Mentor>;
  updateRelationship: (id: string, level: Mentor['relationshipLevel']) => Promise<void>;
  updateNotes: (id: string, notes: string) => Promise<void>;
  deleteMentor: (id: string) => Promise<void>;
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useMentorStore = create<MentorState>((set, get) => ({
  mentors: [],
  isLoading: true,

  load: async (lifeTaskId: string) => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<Mentor>(
      'SELECT * FROM mentors WHERE lifeTaskId = ? ORDER BY createdAt DESC',
      [lifeTaskId]
    );
    set({
      mentors: rows.map((r) => ({ ...r, isHistorical: Boolean(r.isHistorical) })),
      isLoading: false,
    });
  },

  addMentor: async (lifeTaskId, name, domain, isHistorical, notes) => {
    const db = await getDatabase();
    const mentor: Mentor = {
      id: generateId(),
      lifeTaskId,
      name,
      domain,
      isHistorical,
      notes,
      relationshipLevel: 1,
      createdAt: new Date().toISOString(),
    };
    await db.runAsync(
      'INSERT INTO mentors (id, lifeTaskId, name, domain, isHistorical, notes, relationshipLevel, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [mentor.id, mentor.lifeTaskId, mentor.name, mentor.domain, isHistorical ? 1 : 0, mentor.notes, 1, mentor.createdAt]
    );
    set({ mentors: [mentor, ...get().mentors] });
    return mentor;
  },

  updateRelationship: async (id, level) => {
    const db = await getDatabase();
    await db.runAsync('UPDATE mentors SET relationshipLevel = ? WHERE id = ?', [level, id]);
    set({ mentors: get().mentors.map((m) => (m.id === id ? { ...m, relationshipLevel: level } : m)) });
  },

  updateNotes: async (id, notes) => {
    const db = await getDatabase();
    await db.runAsync('UPDATE mentors SET notes = ? WHERE id = ?', [notes, id]);
    set({ mentors: get().mentors.map((m) => (m.id === id ? { ...m, notes } : m)) });
  },

  deleteMentor: async (id: string) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM mentors WHERE id = ?', [id]);
    set({ mentors: get().mentors.filter((m) => m.id !== id) });
  },
}));
