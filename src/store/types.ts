import { Goal, Project, Objective, Activity, Task, WorkSession, UserQuote, AchievementState } from "../types";

export interface GoalSlice {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  toggleGoalStatus: (id: string) => Promise<void>;
}

export interface ProductivitySlice {
  projects: Project[];
  objectives: Objective[];
  activities: Activity[];
  actionPlans: Task[];
  workSessions: WorkSession[];
  userSettings: {
    sleepMinutes: number;
    routineMinutes: number;
  };
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'status' | 'order'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  toggleProjectStatus: (id: string) => Promise<void>;
  addObjective: (objective: Omit<Objective, 'id' | 'createdAt' | 'status' | 'order'>) => Promise<void>;
  updateObjective: (id: string, updates: Partial<Objective>) => Promise<void>;
  removeObjective: (id: string) => Promise<void>;
  toggleObjectiveStatus: (id: string) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'status' | 'order'>) => Promise<boolean>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  removeActivity: (id: string) => Promise<void>;
  toggleActivityStatus: (id: string) => Promise<void>;
  logActivityExecution: (id: string, minutes: number) => Promise<{ success: boolean; message?: string }>;
  addActionPlan: (plan: Omit<Task, 'id' | 'createdAt' | 'status' | 'order'>) => Promise<void>;
  updateActionPlan: (id: string, updates: Partial<Task>) => Promise<void>;
  removeActionPlan: (id: string) => Promise<void>;
  addWorkSession: (session: WorkSession) => void;
  updateSettings: (updates: Partial<{ sleepMinutes: number; routineMinutes: number }>) => { success: boolean; message?: string };
  getDailyMetrics: () => {
    freeMinutes: number;
    plannedMinutes: number;
    executedMinutes: number;
    alignmentPercent: number;
  };
  migrateLocalToSupabase: (userId: string) => Promise<void>;
  fetchUserCloudData: (userId: string) => Promise<void>;
}

export interface UISlice {
  userQuotes: UserQuote[];
  achievements: AchievementState;
  rewardNotification: {
    id: string;
    title: string;
    type: "star" | "medal" | "trophy";
  } | null;
  addQuote: (text: string) => void;
  updateQuote: (id: string, text: string) => void;
  removeQuote: (id: string) => void;
  clearReward: () => void;
  updateAchievements: (minutes: number, updatedActivities: Activity[]) => Promise<void>;
}

export type AppState = GoalSlice & ProductivitySlice & UISlice & {
  version: number;
};
