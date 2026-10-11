import fs from 'fs';
import path from 'path';
import { Project, UserProfile } from '../types';
import { DEMO_PROJECTS } from '../data/demoProjects';

const DB_FILE = path.join(process.cwd(), 'researchmind_db.json');

interface DatabaseSchema {
  projects: Project[];
  user: UserProfile;
  aiUsage: {
    totalTokens: number;
    requestsCount: number;
    estimatedCostUsd: number;
    history: { timestamp: string; endpoint: string; tokens: number }[];
  };
  errorLogs: { timestamp: string; error: string; context?: string }[];
}

const defaultUser: UserProfile = {
  id: 'usr-001',
  name: 'Akhilesh Kumar',
  email: 'akhileshkumarghritlahare@gmail.com',
  institution: 'National Institute of Technology',
  role: 'PhD Scholar',
  tokenUsage: 14250,
};

function loadDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      // Merge with demo projects if empty
      if (!parsed.projects || parsed.projects.length === 0) {
        parsed.projects = [...DEMO_PROJECTS];
      }
      return parsed;
    }
  } catch (err) {
    console.error('Error loading database, initializing with defaults:', err);
  }

  const initialDb: DatabaseSchema = {
    projects: [...DEMO_PROJECTS],
    user: defaultUser,
    aiUsage: {
      totalTokens: 14250,
      requestsCount: 38,
      estimatedCostUsd: 0.021,
      history: [
        { timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), endpoint: '/api/research/paper-wizard', tokens: 3200 },
        { timestamp: new Date(Date.now() - 3600000).toISOString(), endpoint: '/api/paraphrase', tokens: 450 },
      ],
    },
    errorLogs: [],
  };
  saveDatabase(initialDb);
  return initialDb;
}

let dbInstance: DatabaseSchema = loadDatabase();

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error persisting database to disk:', err);
  }
}

export const DataStore = {
  getProjects(): Project[] {
    return dbInstance.projects;
  },
  getProjectById(id: string): Project | undefined {
    return dbInstance.projects.find((p) => p.id === id);
  },
  createProject(project: Project): Project {
    dbInstance.projects.unshift(project);
    saveDatabase(dbInstance);
    return project;
  },
  updateProject(id: string, updates: Partial<Project>): Project | null {
    const index = dbInstance.projects.findIndex((p) => p.id === id);
    if (index === -1) return null;
    dbInstance.projects[index] = {
      ...dbInstance.projects[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDatabase(dbInstance);
    return dbInstance.projects[index];
  },
  deleteProject(id: string): boolean {
    const prevLen = dbInstance.projects.length;
    dbInstance.projects = dbInstance.projects.filter((p) => p.id !== id);
    if (dbInstance.projects.length !== prevLen) {
      saveDatabase(dbInstance);
      return true;
    }
    return false;
  },
  getUser(): UserProfile {
    return dbInstance.user;
  },
  updateUser(updates: Partial<UserProfile>): UserProfile {
    dbInstance.user = { ...dbInstance.user, ...updates };
    saveDatabase(dbInstance);
    return dbInstance.user;
  },
  recordAiUsage(endpoint: string, tokens: number) {
    dbInstance.aiUsage.totalTokens += tokens;
    dbInstance.aiUsage.requestsCount += 1;
    // Estimated cost approx $0.15 per million tokens for Gemini Flash
    const costIncrement = (tokens / 1_000_000) * 0.15;
    dbInstance.aiUsage.estimatedCostUsd += costIncrement;
    dbInstance.aiUsage.history.unshift({
      timestamp: new Date().toISOString(),
      endpoint,
      tokens,
    });
    if (dbInstance.aiUsage.history.length > 100) {
      dbInstance.aiUsage.history.pop();
    }
    saveDatabase(dbInstance);
  },
  getAiStats() {
    return dbInstance.aiUsage;
  },
  logError(error: string, context?: string) {
    dbInstance.errorLogs.unshift({
      timestamp: new Date().toISOString(),
      error,
      context,
    });
    if (dbInstance.errorLogs.length > 50) {
      dbInstance.errorLogs.pop();
    }
    saveDatabase(dbInstance);
  },
  getErrorLogs() {
    return dbInstance.errorLogs;
  },
};
