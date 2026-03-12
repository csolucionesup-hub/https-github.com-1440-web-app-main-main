import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  Goal, 
  Project, 
  Objective, 
  Activity, 
  Task, 
  WorkSession,
  EntityStatus,
  UserQuote,
  AchievementState
} from "../types";
import { achievementRules } from "../config/achievements";
import { goalsService } from "../services/goalsService";
import { tasksService } from "../services/tasksService";
import { profilesService } from "../services/profilesService";
import { analyticsService } from "../services/analyticsService";
import { supabase } from "../lib/supabaseClient";

interface AppState {
  version: number;
  goals: Goal[];
  projects: Project[];
  objectives: Objective[];
  activities: Activity[];
  actionPlans: Task[];
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
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  removeGoal: (id: string) => Promise<void>;
  toggleGoalStatus: (id: string) => Promise<void>;

  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'status' | 'order'>) => Promise<void>;
  addObjective: (objective: Omit<Objective, 'id' | 'createdAt' | 'status' | 'order'>) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'status' | 'order'>) => Promise<boolean>;
  addActionPlan: (plan: Omit<Task, 'id' | 'createdAt' | 'status' | 'order'>) => Promise<void>;
  addWorkSession: (session: WorkSession) => void;
  
  logActivityExecution: (id: string, minutes: number) => Promise<{ success: boolean, message?: string }>;
  updateSettings: (updates: Partial<AppState['userSettings']>) => { success: boolean, message?: string };

  updateObjective: (id: string, updates: Partial<Objective>) => Promise<void>;
  removeObjective: (id: string) => Promise<void>;
  toggleObjectiveStatus: (id: string) => Promise<void>;

  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  removeProject: (id: string) => Promise<void>;
  toggleProjectStatus: (id: string) => Promise<void>;

  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  removeActivity: (id: string) => Promise<void>;
  toggleActivityStatus: (id: string) => Promise<void>;

  updateActionPlan: (id: string, updates: Partial<Task>) => Promise<void>;
  removeActionPlan: (id: string) => Promise<void>;

  addQuote: (text: string) => void;
  updateQuote: (id: string, text: string) => void;
  removeQuote: (id: string) => void;
  clearReward: () => void;
  
  // Cloud Sync
  migrateLocalToSupabase: (userId: string) => Promise<void>;
  fetchUserCloudData: (userId: string) => Promise<void>;

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

      addGoal: async (goal) => {
        const activeGoals = get().goals.filter((g) => g.status === "active").length;
        const tempId = crypto.randomUUID();
        const newGoal: Goal = {
          ...goal,
          id: tempId,
          createdAt: new Date().toISOString(),
          category: goal.category || 'General',
          status: activeGoals < MAX_ACTIVE_GOALS ? "active" : "pending",
          priority: goal.priority || 'medium',
          color: goal.color || '#06b6d4',
        };

        set((state) => ({
          goals: [...state.goals, newGoal],
        }));

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            const dbGoal = await goalsService.create(newGoal, session.user.id);
            set((state) => ({
              goals: state.goals.map(g => g.id === tempId ? dbGoal : g),
              objectives: state.objectives.map(o => o.goalId === tempId ? { ...o, goalId: dbGoal.id } : o)
            }));
          } catch (error) {
            console.error("Cloud Error (addGoal):", error);
          }
        }
      },

      updateGoal: async (id, updates) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === id ? { ...goal, ...updates, statusUpdatedAt: new Date().toISOString() } : goal
          ),
        }));

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            await goalsService.update(id, updates);
          } catch (error) {
            console.error("Cloud Error (updateGoal):", error);
          }
        }
      },

      removeGoal: async (id) => {
        // Cascade removal following new hierarchy: Goal -> Objective -> Project -> Task -> Activity
        const objectives = get().objectives.filter(o => o.goalId === id).map(o => o.id);
        const projects = get().projects.filter(p => objectives.includes(p.objectiveId)).map(p => p.id);
        const tasks = get().actionPlans.filter(t => projects.includes(t.projectId)).map(t => t.id);
        const activities = get().activities.filter(a => tasks.includes(a.taskId)).map(a => a.id);

        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
          objectives: state.objectives.filter((o) => !objectives.includes(o.id)),
          projects: state.projects.filter((p) => !projects.includes(p.id)),
          actionPlans: state.actionPlans.filter((t) => !tasks.includes(t.id)),
          activities: state.activities.filter((a) => !activities.includes(a.id)),
          workSessions: state.workSessions.filter((w) => !activities.includes(w.activityId)),
        }));

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            await goalsService.delete(id);
          } catch (error) {
            console.error("Cloud Error (removeGoal):", error);
          }
        }
      },

      toggleGoalStatus: async (id) => {
        const state = get();
        const goal = state.goals.find(g => g.id === id);
        if (!goal) return;

        const activeGoalsCount = state.goals.filter((g) => g.status === "active").length;
        let newStatus: EntityStatus = goal.status;
        
        if (goal.status === "active") {
          newStatus = "paused";
        } else if (goal.status === "paused" || goal.status === "pending") {
          newStatus = activeGoalsCount >= MAX_ACTIVE_GOALS ? "pending" : "active";
        }

        const updates = { 
          status: newStatus,
          statusUpdatedAt: new Date().toISOString()
        };

        set((current) => ({
          goals: current.goals.map((g) =>
            g.id === id ? { ...g, ...updates } : g
          ),
        }));

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            await goalsService.update(id, updates);
          } catch (error) {
            console.error("Cloud Error (toggleGoalStatus):", error);
          }
        }
      },

      addProject: async (project) => {
        const active = get().projects.filter((p) => p.status === "active").length;
        const tempId = crypto.randomUUID();
        const newProject: Project = {
          ...project,
          id: tempId,
          createdAt: new Date().toISOString(),
          order: get().projects.filter(p => p.objectiveId === project.objectiveId).length,
          status: active < MAX_ACTIVE_PROJECTS ? "active" : "pending",
        };

        set((state) => ({
          projects: [...state.projects, newProject],
        }));

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            const dbProject = await tasksService.createProject(newProject, session.user.id, newProject.objectiveId);
            set((state) => ({
              projects: state.projects.map(p => p.id === tempId ? dbProject : p),
              actionPlans: state.actionPlans.map(t => t.projectId === tempId ? { ...t, projectId: dbProject.id } : t)
            }));
          } catch (error) {
            console.error("Cloud Error (addProject):", error);
          }
        }
      },

      addObjective: async (objective) => {
        const active = get().objectives.filter((o) => o.status === "active").length;
        const tempId = crypto.randomUUID();
        const newObjective: Objective = {
          ...objective,
          id: tempId,
          createdAt: new Date().toISOString(),
          order: get().objectives.filter(o => o.goalId === objective.goalId).length,
          status: active < MAX_ACTIVE_OBJECTIVES ? "active" : "pending",
        };

        set((state) => ({
          objectives: [...state.objectives, newObjective],
        }));

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            const dbObj = await tasksService.createObjective(newObjective, session.user.id, newObjective.goalId);
            set((state) => ({
              objectives: state.objectives.map(o => o.id === tempId ? dbObj : o),
              projects: state.projects.map(p => p.objectiveId === tempId ? { ...p, objectiveId: dbObj.id } : p),
              activities: state.activities.map(a => a.objectiveId === tempId ? { ...a, objectiveId: dbObj.id } : a)
            }));
          } catch (error) {
            console.error("Cloud Error (addObjective):", error);
          }
        }
      },

      addActivity: async (activity) => {
        const state = get();
        const active = state.activities.filter((a) => a.status === "active").length;
        
        // 1440 Validation
        const metrics = state.getDailyMetrics();
        const totalWithNew = state.userSettings.sleepMinutes + state.userSettings.routineMinutes + metrics.plannedMinutes + (activity.plannedMinutesPerSession || 0);
        
        if (totalWithNew > 1440) {
          return false;
        }

        const tempId = crypto.randomUUID();
        const newActivity: Activity = {
          ...activity,
          id: tempId,
          createdAt: new Date().toISOString(),
          order: state.activities.filter(a => a.taskId === activity.taskId).length,
          status: active < MAX_ACTIVE_ACTIVITIES ? "active" : "pending",
          minutesSpentToday: 0,
        };

        set((state) => ({
          activities: [...state.activities, newActivity],
        }));

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            // Find objectiveId from task hierarchy if not directly provided
            let objId = newActivity.objectiveId;
            if (!objId && newActivity.taskId) {
              const task = state.actionPlans.find(t => t.id === newActivity.taskId);
              if (task) {
                const project = state.projects.find(p => p.id === task.projectId);
                if (project) {
                  objId = project.objectiveId;
                }
              }
            }

            const dbActivity = await tasksService.createActivity(newActivity, session.user.id, newActivity.taskId, objId);
            set((state) => ({
              activities: state.activities.map(a => a.id === tempId ? dbActivity : a)
            }));
          } catch (error) {
            console.error("Cloud Error (addActivity):", error);
          }
        }

        return true;
      },

      logActivityExecution: async (id, minutes) => {
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

        // Update local state first for responsiveness
        set({ activities: updatedActivities });

        // PERSISTENCE: Check for user session
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            // 1. Log to time_logs
            await analyticsService.logTime(session.user.id, id, minutes);
            
            // 2. Update daily snapshot
            const metrics = state.getDailyMetrics();
            const availableMinutes = 1440 - state.userSettings.sleepMinutes - state.userSettings.routineMinutes;
            await analyticsService.updateDailyMinutes(
              session.user.id, 
              availableMinutes,
              metrics.executedMinutes + minutes
            );
          } catch (error) {
            console.error("Cloud logging error:", error);
          }
        }

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

        // 3. Sync Achievements to Profile
        if (session) {
          try {
            await profilesService.updateProfile(session.user.id, {
              stars: newStars,
              medals: newMedals,
              trophies: newTrophies,
              total_minutes_invested: newTotalMinutes,
              unlocked_ids: newUnlockedIds
            });
          } catch (error) {
            console.error("Cloud Achievement Sync Error:", error);
          }
        }

        return { success: true };
      },

      addActionPlan: async (plan) => {
        const active = get().actionPlans.filter((p) => p.status === "active").length;
        const tempId = crypto.randomUUID();
        const newPlan: Task = {
          projectId: plan.projectId,
          title: plan.title,
          description: plan.description,
          period: plan.period,
          status: active < MAX_ACTIVE_ACTION_PLANS ? "active" : "pending",
          order: get().actionPlans.filter(p => p.projectId === plan.projectId).length,
          id: tempId,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          actionPlans: [...state.actionPlans, newPlan],
        }));

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            const dbTask = await tasksService.createTask(newPlan, session.user.id, newPlan.projectId);
            set((state) => ({
              actionPlans: state.actionPlans.map(t => t.id === tempId ? dbTask : t),
              activities: state.activities.map(a => a.taskId === tempId ? { ...a, taskId: dbTask.id } : a)
            }));
          } catch (error) {
            console.error("Cloud Error (addActionPlan):", error);
          }
        }
      },

      updateObjective: async (id, updates) => {
        set((state) => ({
          objectives: state.objectives.map((obj) => obj.id === id ? { ...obj, ...updates } : obj),
        }));
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            await tasksService.updateObjective(id, updates);
          } catch (error) {
            console.error("Cloud Error (updateObjective):", error);
          }
        }
      },

      removeObjective: async (id) => {
        const state = get();
        const projects = state.projects.filter(p => p.objectiveId === id).map(p => p.id);
        const tasks = state.actionPlans.filter(t => projects.includes(t.projectId)).map(t => t.id);
        const activities = state.activities.filter(a => tasks.includes(a.taskId)).map(a => a.id);

        set((state) => ({
          objectives: state.objectives.filter((o) => o.id !== id),
          projects: state.projects.filter((p) => !projects.includes(p.id)),
          actionPlans: state.actionPlans.filter((t) => !tasks.includes(t.id)),
          activities: state.activities.filter((a) => !activities.includes(a.id)),
        }));

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            await tasksService.deleteObjective(id);
          } catch (error) {
            console.error("Cloud Error (removeObjective):", error);
          }
        }
      },

      toggleObjectiveStatus: async (id) => {
        const obj = get().objectives.find(o => o.id === id);
        if (!obj) return;
        const active = get().objectives.filter(o => o.status === 'active').length;
        const newStatus = obj.status === 'active' ? 'paused' : (active < MAX_ACTIVE_OBJECTIVES ? 'active' : 'pending');
        await get().updateObjective(id, { status: newStatus as EntityStatus });
      },

      updateProject: async (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => p.id === id ? { ...p, ...updates } : p),
        }));
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            await tasksService.updateProject(id, updates);
          } catch (error) {
            console.error("Cloud Error (updateProject):", error);
          }
        }
      },

      removeProject: async (id) => {
        const state = get();
        const tasks = state.actionPlans.filter(t => t.projectId === id).map(t => t.id);
        const activities = state.activities.filter(a => tasks.includes(a.taskId)).map(a => a.id);

        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          actionPlans: state.actionPlans.filter((t) => !tasks.includes(t.id)),
          activities: state.activities.filter((a) => !activities.includes(a.id)),
        }));

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            await tasksService.deleteProject(id);
          } catch (error) {
            console.error("Cloud Error (removeProject):", error);
          }
        }
      },

      toggleProjectStatus: async (id) => {
        const proj = get().projects.find(p => p.id === id);
        if (!proj) return;
        const active = get().projects.filter(p => p.status === 'active').length;
        const newStatus = proj.status === 'active' ? 'paused' : (active < MAX_ACTIVE_PROJECTS ? 'active' : 'pending');
        await get().updateProject(id, { status: newStatus as EntityStatus });
      },

      addWorkSession: (session) => {
        set((state) => ({
          workSessions: [...state.workSessions, session],
        }));
      },

      updateActivity: async (id, updates) => {
        set((state) => ({
          activities: state.activities.map((a) => a.id === id ? { ...a, ...updates } : a),
        }));
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            await tasksService.updateActivity(id, updates);
          } catch (error) {
            console.error("Cloud Error (updateActivity):", error);
          }
        }
      },

      removeActivity: async (id) => {
        set((state) => ({
          activities: state.activities.filter((a) => a.id !== id),
        }));
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            await tasksService.deleteActivity(id);
          } catch (error) {
            console.error("Cloud Error (removeActivity):", error);
          }
        }
      },

      toggleActivityStatus: async (id) => {
        const act = get().activities.find(a => a.id === id);
        if (!act) return;
        const active = get().activities.filter(a => a.status === 'active').length;
        const newStatus = act.status === 'active' ? 'paused' : (active < MAX_ACTIVE_ACTIVITIES ? 'active' : 'pending');
        await get().updateActivity(id, { status: newStatus as EntityStatus });
      },

      updateActionPlan: async (id, updates) => {
        set((state) => ({
          actionPlans: state.actionPlans.map((t) => t.id === id ? { ...t, ...updates } : t),
        }));
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            await tasksService.updateTask(id, updates);
          } catch (error) {
            console.error("Cloud Error (updateActionPlan):", error);
          }
        }
      },

      removeActionPlan: async (id) => {
        const state = get();
        const activities = state.activities.filter(a => a.taskId === id).map(a => a.id);
        set((state) => ({
          actionPlans: state.actionPlans.filter((t) => t.id !== id),
          activities: state.activities.filter((a) => !activities.includes(a.id)),
        }));
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          try {
            await tasksService.deleteTask(id);
          } catch (error) {
            console.error("Cloud Error (removeActionPlan):", error);
          }
        }
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

      fetchUserCloudData: async (userId) => {
        try {
          const [profile, goals, objectives, projects, tasks, activities] = await Promise.all([
            profilesService.getProfile(userId),
            goalsService.getAll(),
            tasksService.getObjectives(),
            tasksService.getProjects(),
            tasksService.getTasks(),
            tasksService.getActivities()
          ]);

          if (profile) {
            set({
              userSettings: {
                sleepMinutes: profile.sleep_minutes,
                routineMinutes: profile.routine_minutes
              },
              achievements: {
                stars: profile.stars,
                medals: profile.medals,
                trophies: profile.trophies,
                totalMinutesInvested: profile.total_minutes_invested,
                unlockedIds: profile.unlocked_ids
              }
            });
          }

          if (goals) set({ goals });
          if (objectives) set({ objectives: objectives as any });
          if (projects) set({ projects: projects as any });
          if (tasks) set({ actionPlans: tasks as any });
          if (activities) set({ activities: activities as any });
          
        } catch (error) {
          console.error("Error fetching cloud data:", error);
        }
      },

      migrateLocalToSupabase: async (userId) => {
        const state = get();
        
        try {
          // 1. Ensure profile exists
          let profile = await profilesService.getProfile(userId);
          if (!profile) {
            await profilesService.createProfile(userId);
          }

          // 2. Hierarchical Migration (Waterfall)
          // We need to loop through the local data and create them in Supabase, 
          // keeping track of the NEW IDs generated by the DB to maintain relationships.

          for (const goal of state.goals) {
            const dbGoal = await goalsService.create(goal, userId);
            
            // Objectives for this goal
            const goalObjectives = state.objectives.filter(o => o.goalId === goal.id);
            for (const obj of goalObjectives) {
              const dbObj = await tasksService.createObjective(obj, userId, dbGoal.id);
              
              // Projects for this objective
              const objProjects = state.projects.filter(p => p.objectiveId === obj.id);
              for (const proj of objProjects) {
                const dbProj = await tasksService.createProject(proj, userId, dbObj.id);
                
                // Tasks for this project
                const projTasks = state.actionPlans.filter(t => t.projectId === proj.id);
                for (const taskItem of projTasks) {
                  const dbTask = await tasksService.createTask(taskItem, userId, dbProj.id);
                  
                  // Activities for this task
                  const taskActivities = state.activities.filter(a => a.taskId === taskItem.id);
                  for (const act of taskActivities) {
                    await tasksService.createActivity(act, userId, dbTask.id, dbObj.id);
                  }
                }
              }
            }
          }

          // 3. Update Profile Settings & Totals
          await profilesService.updateProfile(userId, {
            sleep_minutes: state.userSettings.sleepMinutes,
            routine_minutes: state.userSettings.routineMinutes,
            stars: state.achievements.stars,
            medals: state.achievements.medals,
            trophies: state.achievements.trophies,
            total_minutes_invested: state.achievements.totalMinutesInvested,
            unlocked_ids: state.achievements.unlockedIds
          });

          // 4. Final sync (Fetch fresh state with DB IDs)
          await state.fetchUserCloudData(userId);
          
          console.log("Migration hierarchical complete!");
        } catch (error) {
          console.error("Migration failed:", error);
        }
      }
    }),
    {
      name: "1440-storage",
      version: 5,
    }
  )
);