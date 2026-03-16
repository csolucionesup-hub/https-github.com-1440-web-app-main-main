import { Goal, Project, Objective, Activity, WorkSession, UserQuote, AchievementState, Workspace } from "../types";

export interface GoalSlice {
  goals: Goal[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean; message?: string }>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  toggleGoalStatus: (id: string) => Promise<{ success: boolean; message?: string }>;
}

export interface ProductivitySlice {
  projects: Project[];
  objectives: Objective[];
  activities: Activity[];
  workSessions: WorkSession[];
  userSettings: {
    sleepMinutes: number;
    routineMinutes: number;
    routines?: import("../types").RoutineItem[];
  };
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'status' | 'order'>) => Promise<{ success: boolean; message?: string }>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  toggleProjectStatus: (id: string) => Promise<{ success: boolean; message?: string }>;
  addObjective: (objective: Omit<Objective, 'id' | 'createdAt' | 'status' | 'order'>) => Promise<{ success: boolean; message?: string }>;
  updateObjective: (id: string, updates: Partial<Objective>) => Promise<void>;
  removeObjective: (id: string) => Promise<void>;
  toggleObjectiveStatus: (id: string) => Promise<{ success: boolean; message?: string }>;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'status' | 'order' | 'minutesSpentToday'>) => Promise<boolean>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<{ success: boolean; message?: string }>;
  removeActivity: (id: string) => Promise<void>;
  toggleActivityStatus: (id: string) => Promise<void>;
  logActivityExecution: (id: string, minutes: number) => Promise<{ success: boolean; message?: string }>;
  addWorkSession: (session: WorkSession) => void;
  addRoutine: (name: string, minutes: number) => void;
  updateRoutine: (id: string, updates: Partial<{ name: string; minutes: number }>) => void;
  removeRoutine: (id: string) => void;
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

export interface WorkspaceSlice {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  addWorkspace: (workspace: Omit<Workspace, 'id' | 'createdAt'>) => void;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  removeWorkspace: (id: string) => void;
  setActiveWorkspace: (id: string | null) => void;
}

export type AppState = GoalSlice & ProductivitySlice & UISlice & WorkspaceSlice & {
  version: number;
};
