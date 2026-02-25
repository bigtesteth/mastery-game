import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('mastery.db');
  await initializeSchema(db);
  return db;
}

async function initializeSchema(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      onboardingComplete INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS life_tasks (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      domain TEXT NOT NULL,
      customName TEXT NOT NULL,
      totalMinutes INTEGER NOT NULL DEFAULT 0,
      phase TEXT NOT NULL DEFAULT 'apprentice',
      startedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS practice_sessions (
      id TEXT PRIMARY KEY,
      lifeTaskId TEXT NOT NULL,
      date TEXT NOT NULL,
      durationMinutes INTEGER NOT NULL,
      quality INTEGER NOT NULL,
      type TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      FOREIGN KEY (lifeTaskId) REFERENCES life_tasks(id)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      lifeTaskId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      deadline TEXT,
      isCompleted INTEGER NOT NULL DEFAULT 0,
      completedAt TEXT,
      xpReward INTEGER NOT NULL DEFAULT 100,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (lifeTaskId) REFERENCES life_tasks(id)
    );

    CREATE TABLE IF NOT EXISTS mentors (
      id TEXT PRIMARY KEY,
      lifeTaskId TEXT NOT NULL,
      name TEXT NOT NULL,
      domain TEXT NOT NULL DEFAULT '',
      isHistorical INTEGER NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      relationshipLevel INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (lifeTaskId) REFERENCES life_tasks(id)
    );

    CREATE TABLE IF NOT EXISTS mastery_progress (
      lifeTaskId TEXT PRIMARY KEY,
      focus INTEGER NOT NULL DEFAULT 0,
      discipline INTEGER NOT NULL DEFAULT 0,
      creativity INTEGER NOT NULL DEFAULT 0,
      intuition INTEGER NOT NULL DEFAULT 0,
      socialIntelligence INTEGER NOT NULL DEFAULT 0,
      currentStreak INTEGER NOT NULL DEFAULT 0,
      longestStreak INTEGER NOT NULL DEFAULT 0,
      totalXp INTEGER NOT NULL DEFAULT 0,
      unlockedKeyIds TEXT NOT NULL DEFAULT '[]',
      FOREIGN KEY (lifeTaskId) REFERENCES life_tasks(id)
    );
  `);
}
