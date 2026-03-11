import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  Goal, 
  Project, 
  Objective, 
  Activity, 
  Task as ActionPlan, 
  WorkSession,
  EntityStatus,
  UserQuote,
  AchievementState
} from "../types";
import { achievementRules } from "../config/achievements";

interface AppState {
  version: number;
  goals: Goal[];
  projects: Project[];
  objectives: Objective[];
  activities: Activity[];
  actionPlans: ActionPlan[];
  workSessions: WorkSession[];
  
  // Persistence & Goals
  achievements: {
    stars: number;
    medals: number;
    trophies: number;
    totalMinutesInvested: number;
    unlockedIds: string[];
  };
  rewardNotification: {
    id: string;
    title: string;
    type: "star" | "medal" | "trophy";
  } | null;
  
  // Settings
  userSettings: {
    sleepMinutes: number;
    routineMinutes: number;
  };

  userQuotes: UserQuote[];

  // Actions
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'status' | 'order'>) => void;
  updateGoal: (id: string, updates: Partial<Goal>) => void;
  removeGoal: (id: string) => void;
  toggleGoalStatus: (id: string) => void;

  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'status' | 'order'>) => void;
  addObjective: (objective: Omit<Objective, 'id' | 'createdAt' | 'status' | 'order'>) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'status' | 'order'>) => boolean;
  addActionPlan: (plan: Omit<ActionPlan, 'id' | 'createdAt' | 'status' | 'order'>) => void;
  addWorkSession: (session: WorkSession) => void;
  
  logActivityExecution: (id: string, minutes: number) => { success: boolean, message?: string };
  updateSettings: (updates: Partial<AppState['userSettings']>) => { success: boolean, message?: string };

  addQuote: (text: string) => void;
  updateQuote: (id: string, text: string) => void;
  removeQuote: (id: string) => void;
  clearReward: () => void;

  // Selectors
  getDailyMetrics: () => {
    freeMinutes: number;
    plannedMinutes: number;
    executedMinutes: number;
    alignmentPercent: number;
  };
}

const MAX_ACTIVE_GOALS = 3;
const MAX_ACTIVE_PROJECTS = 3;
const MAX_ACTIVE_OBJECTIVES = 6;
const MAX_ACTIVE_ACTIVITIES = 10;
const MAX_ACTIVE_ACTION_PLANS = 15;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      version: 5,
      goals: [],
      projects: [],
      objectives: [],
      activities: [],
      actionPlans: [],
      workSessions: [],

      userSettings: {
        sleepMinutes: 480,
        routineMinutes: 180,
      },

      userQuotes: [],

      achievements: {
        stars: 0,
        medals: 0,
        trophies: 0,
        totalMinutesInvested: 0,
        unlockedIds: [],
      },

      rewardNotification: null,

      clearReward: () => set({ rewardNotification: null }),

      getDailyMetrics: () => {
        const { activities, userSettings } = get();
        
        const plannedMinutes = activities.reduce(
          (sum, a) => sum + (a.plannedMinutesPerSession || 0),
          0
        );

        const executedMinutes = activities.reduce(
          (sum, a) => sum + (a.minutesSpentToday || 0),
          0
        );

        const availableMinutes = 1440 - userSettings.sleepMinutes - userSettings.routineMinutes;
        const freeMinutes = Math.max(0, availableMinutes - plannedMinutes);
        
        const alignmentPercent = availableMinutes > 0 
          ? Math.round((plannedMinutes / availableMinutes) * 100)
          : 0;

        return {
          freeMinutes,
          plannedMinutes,
          executedMinutes,
          alignmentPercent
        };
      },

      updateSettings: (updates) => {
        const newState = { ...get().userSettings, ...updates };
        
        if (newState.sleepMinutes + newState.routineMinutes > 1440) {
          return { 
            success: false, 
            message: "La suma de sueño y rutina no puede exceder los 1440 minutos." 
          };
        }

        set({ userSettings: newState });
        return { success: true };
      },

      addGoal: (goal) => {
        const activeGoals = get().goals.filter((g) => g.status === "active").length;
        const newGoal: Goal = {
          ...goal,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          category: goal.category || 'General',
          status: activeGoals < MAX_ACTIVE_GOALS ? "active" : "pending",
          priority: goal.priority || 'medium',
          color: goal.color || '#06b6d4',
        };

        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updates, statusUpdatedAt: new Date().toISOString() } : goal
          ),
        }));
      },

      removeGoal: (id) => {
        const projects = get().projects.filter((p) => p.goalId === id).map((p) => p.id);
        const objectives = get().objectives
          .filter((o) => projects.includes(o.projectId))
          .map((o) => o.id);
        const activities = get().activities
          .filter((a) => objectives.includes(a.objectiveId))
          .map((a) => a.id);
        const plans = get().actionPlans
          .filter((p) => activities.includes(p.activityId))
          .map((p) => p.id);

        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
          projects: state.projects.filter((p) => !projects.includes(p.id)),
          objectives: state.objectives.filter((o) => !objectives.includes(o.id)),
          activities: state.activities.filter((a) => !activities.includes(a.id)),
          actionPlans: state.actionPlans.filter((p) => !plans.includes(p.id)),
          workSessions: state.workSessions.filter(
            (w) => !activities.includes(w.activityId)
          ),
        }));
      },

      toggleGoalStatus: (id) => {
        const state = get();
        const activeGoalsCount = state.goals.filter((g) => g.status === "active").length;

        set((current) => ({
          goals: current.goals.map((goal) => {
            if (goal.id !== id) return goal;

            let newStatus: EntityStatus = goal.status;
            if (goal.status === "active") {
              newStatus = "paused";
            } else if (goal.status === "paused" || goal.status === "pending") {
              newStatus = activeGoalsCount >= MAX_ACTIVE_GOALS ? "pending" : "active";
            }

            return { 
              ...goal, 
              status: newStatus,
              statusUpdatedAt: new Date().toISOString()
            };
          }),
        }));
      },

      addProject: (project) => {
        const active = get().projects.filter((p) => p.status === "active").length;
        const newProject: Project = {
          ...project,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          order: get().projects.filter(p => p.goalId === project.goalId).length,
          status: active < MAX_ACTIVE_PROJECTS ? "active" : "pending",
        };

        set((state) => ({
          projects: [...state.projects, newProject],
        }));
      },

      addObjective: (objective) => {
        const active = get().objectives.filter((o) => o.status === "active").length;
        const newObjective: Objective = {
          ...objective,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          order: get().objectives.filter(o => o.projectId === objective.projectId).length,
          status: active < MAX_ACTIVE_OBJECTIVES ? "active" : "pending",
        };

        set((state) => ({
          objectives: [...state.objectives, newObjective],
        }));
      },

      addActivity: (activity) => {
        const state = get();
        const active = state.activities.filter((a) => a.status === "active").length;
        
        // 1440 Validation
        const metrics = state.getDailyMetrics();
        const totalWithNew = state.userSettings.sleepMinutes + state.userSettings.routineMinutes + metrics.plannedMinutes + (activity.plannedMinutesPerSession || 0);
        
        if (totalWithNew > 1440) {
          return false;
        }

        const newActivity: Activity = {
          ...activity,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          order: state.activities.filter(a => a.objectiveId === activity.objectiveId).length,
          status: active < MAX_ACTIVE_ACTIVITIES ? "active" : "pending",
          minutesSpentToday: 0,
        };

        set((state) => ({
          activities: [...state.activities, newActivity],
        }));
        return true;
      },

      logActivityExecution: (id, minutes) => {
        const state = get();
        const activity = state.activities.find(a => a.id === id);
        
        if (!activity) return { success: false, message: "Actividad no encontrada" };
        
        const currentSpent = activity.minutesSpentToday || 0;
        const planned = activity.plannedMinutesPerSession || 0;
        
        if (currentSpent + minutes > planned) {
          return { 
            success: false, 
            message: `No puedes ejecutar más de los ${planned} min planificados.` 
          };
        }

        const newMinutesSpent = currentSpent + minutes;
        const updatedActivities = state.activities.map(a => 
          a.id === id ? { ...a, minutesSpentToday: newMinutesSpent } : a
        );

        // Achievement Logic
        const newTotalMinutes = state.achievements.totalMinutesInvested + minutes;
        const completedCount = updatedActivities.filter(a => (a.minutesSpentToday || 0) >= (a.plannedMinutesPerSession || 0)).length;

        let rewardNotification = null;
        let newUnlockedIds = [...state.achievements.unlockedIds];
        let newStars = state.achievements.stars;
        let newMedals = state.achievements.medals;
        let newTrophies = state.achievements.trophies;

        achievementRules.forEach((rule) => {
          if (newUnlockedIds.includes(rule.id)) return;

          let unlocked = false;
          if (rule.condition.type === "activity_count" && completedCount >= (rule.condition.threshold || 0)) {
            unlocked = true;
          } else if (rule.condition.type === "total_minutes" && newTotalMinutes >= (rule.condition.threshold || 0)) {
            unlocked = true;
          }

          if (unlocked) {
            newUnlockedIds.push(rule.id);
            if (rule.rewardType === "star") newStars++;
            if (rule.rewardType === "medal") newMedals++;
            if (rule.rewardType === "trophy") newTrophies++;
            rewardNotification = { id: rule.id, title: rule.title, type: rule.rewardType };
          }
        });

        set({ 
          activities: updatedActivities,
          achievements: {
            ...state.achievements,
            totalMinutesInvested: newTotalMinutes,
            unlockedIds: newUnlockedIds,
            stars: newStars,
            medals: newMedals,
            trophies: newTrophies
          },
          rewardNotification: rewardNotification || state.rewardNotification
        });

        return { success: true };
      },

      addActionPlan: (plan) => {
        const active = get().actionPlans.filter((p) => p.status === "active").length;
        const newPlan: ActionPlan = {
          ...plan,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          order: get().actionPlans.filter(p => p.activityId === plan.activityId).length,
          status: active < MAX_ACTIVE_ACTION_PLANS ? "active" : "pending",
        };

        set((state) => ({
          actionPlans: [...state.actionPlans, newPlan],
        }));
      },

      addWorkSession: (session) => {
        set((state) => ({
          workSessions: [...state.workSessions, session],
        }));
      },

      addQuote: (text) => {
        const newQuote: UserQuote = {
          id: crypto.randomUUID(),
          text,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ userQuotes: [...state.userQuotes, newQuote] }));
      },

      updateQuote: (id, text) => {
        set((state) => ({
          userQuotes: state.userQuotes.map((q) => 
            q.id === id ? { ...q, text } : q
          ),
        }));
      },

      removeQuote: (id) => {
        set((state) => ({
          userQuotes: state.userQuotes.filter((q) => q.id !== id),
        }));
      },
    }),
    {
      name: "1440-storage",
      version: 5,
    }
  )
);