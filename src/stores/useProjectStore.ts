import { create } from 'zustand';
import { getDatabase } from '../db/database';
import { Project } from '../types';

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  load: (lifeTaskId: string) => Promise<void>;
  addProject: (
    lifeTaskId: string,
    title: string,
    description: string,
    deadline: string | null
  ) => Promise<Project>;
  completeProject: (id: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: true,

  load: async (lifeTaskId: string) => {
    const db = await getDatabase();
    const rows = await db.getAllAsync<Project>(
      'SELECT * FROM projects WHERE lifeTaskId = ? ORDER BY createdAt DESC',
      [lifeTaskId]
    );
    set({
      projects: rows.map((r) => ({
        ...r,
        isCompleted: Boolean(r.isCompleted),
      })),
      isLoading: false,
    });
  },

  addProject: async (lifeTaskId, title, description, deadline) => {
    const db = await getDatabase();
    const project: Project = {
      id: generateId(),
      lifeTaskId,
      title,
      description,
      deadline,
      isCompleted: false,
      completedAt: null,
      xpReward: 100 + Math.floor(Math.random() * 150),
      createdAt: new Date().toISOString(),
    };
    await db.runAsync(
      'INSERT INTO projects (id, lifeTaskId, title, description, deadline, isCompleted, completedAt, xpReward, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [project.id, project.lifeTaskId, project.title, project.description, project.deadline, 0, null, project.xpReward, project.createdAt]
    );
    set({ projects: [project, ...get().projects] });
    return project;
  },

  completeProject: async (id: string) => {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE projects SET isCompleted = 1, completedAt = ? WHERE id = ?',
      [now, id]
    );
    set({
      projects: get().projects.map((p) =>
        p.id === id ? { ...p, isCompleted: true, completedAt: now } : p
      ),
    });
  },

  deleteProject: async (id: string) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM projects WHERE id = ?', [id]);
    set({ projects: get().projects.filter((p) => p.id !== id) });
  },
}));
