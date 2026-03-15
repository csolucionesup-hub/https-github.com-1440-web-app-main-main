import { StateCreator } from "zustand";
import { AppState, ProductivitySlice } from "../types";
import { 
  Project, 
  Objective, 
  Activity, 
  Task, 
  WorkSession, 
  EntityStatus 
} from "../../types";
import { tasksService } from "../../services/tasksService";
import { goalsService } from "../../services/goalsService";
import { profilesService } from "../../services/profilesService";
import { analyticsService } from "../../services/analyticsService";
import { supabase } from "../../lib/supabaseClient";
import { generateId } from "../../utils/uuid";

const MAX_ACTIVE_PROJECTS_PER_OBJECTIVE = 3;
const MAX_TOTAL_PROJECTS_PER_OBJECTIVE = 6;
const MAX_ACTIVE_OBJECTIVES_PER_GOAL = 3;
const MAX_TOTAL_OBJECTIVES_PER_GOAL = 6;
const MAX_ACTIVE_ACTIVITIES = 10;
const MAX_ACTIVE_ACTION_PLANS = 15;

export const createProductivitySlice: StateCreator<
  AppState,
  [],
  [],
  ProductivitySlice
> = (set, get) => ({
  projects: [],
  objectives: [],
  activities: [],
  actionPlans: [],
  workSessions: [],
  userSettings: {
    sleepMinutes: 480,
    routineMinutes: 120,
    routines: [
      { id: 'r1', name: 'Desayuno', minutes: 30 },
      { id: 'r2', name: 'Almuerzo', minutes: 60 },
      { id: 'r3', name: 'Traslado', minutes: 30 },
    ]
  },

  addProject: async (project) => {
    const allInObj = get().projects.filter(p => p.objectiveId === project.objectiveId);
    
    // Deduplicate to ignore store pollution
    const uniqueInObj = Array.from(new Map(allInObj.map(p => [p.id, p])).values());
    
    if (uniqueInObj.length >= MAX_TOTAL_PROJECTS_PER_OBJECTIVE) {
      return { success: false, message: `Has alcanzado el límite de ${MAX_TOTAL_PROJECTS_PER_OBJECTIVE} proyectos para este objetivo.` };
    }

    const activeInObj = uniqueInObj.filter(p => (p.status === "active" || (p.status as string) === "in_progress")).length;
    const tempId = generateId();
    const newProject: Project = {
      ...project,
      id: tempId,
      createdAt: new Date().toISOString(),
      status: activeInObj < MAX_ACTIVE_PROJECTS_PER_OBJECTIVE ? "active" : "pending",
      order: get().projects.length
    };

    set((state) => ({ projects: [...state.projects, newProject] }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try {
        const dbProject = await tasksService.createProject(newProject, session.user.id, project.objectiveId);
        set((state) => ({
          projects: state.projects.map(p => p.id === tempId ? dbProject : p),
          actionPlans: state.actionPlans.map(t => t.activityId === tempId ? { ...t, activityId: dbProject.id } : t)
        }));
      } catch (error) { console.error("Cloud Error (addProject):", error); }
    }
    return { success: true };
  },

  updateProject: async (id, updates) => {
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates, statusUpdatedAt: new Date().toISOString() } : p
      ),
    }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try { await tasksService.updateProject(id, updates); }
      catch (error) { console.error("Cloud Error (updateProject):", error); }
    }
  },

  removeProject: async (id) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      actionPlans: state.actionPlans.filter((t) => t.activityId !== id),
    }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try { await tasksService.deleteProject(id); }
      catch (error) { console.error("Cloud Error (removeProject):", error); }
    }
  },

  toggleProjectStatus: async (id) => {
    const project = get().projects.find((p) => p.id === id);
    if (!project) return { success: false, message: "Proyecto no encontrado" };
    
    let newStatus: EntityStatus;
    if (project.status === "active" || (project.status as string) === "in_progress") {
      newStatus = "paused";
    } else {
      const activeInObj = get().projects.filter(p => 
        p.objectiveId === project.objectiveId && 
        (p.status === "active" || (p.status as string) === "in_progress")
      );
      const activeCount = new Set(activeInObj.map(p => p.id)).size;
      
      if (activeCount >= MAX_ACTIVE_PROJECTS_PER_OBJECTIVE) {
        return { success: false, message: `Ya tienes ${MAX_ACTIVE_PROJECTS_PER_OBJECTIVE} proyectos activos para este objetivo. Pausa uno para activar este.` };
      }
      newStatus = "active";
    }
    
    await get().updateProject(id, { status: newStatus });
    return { success: true };
  },

  addObjective: async (objective) => {
    const allInGoal = get().objectives.filter(o => o.goalId === objective.goalId);
    
    // Deduplicate to ignore store pollution
    const uniqueInGoal = Array.from(new Map(allInGoal.map(o => [o.id, o])).values());
    
    if (uniqueInGoal.length >= MAX_TOTAL_OBJECTIVES_PER_GOAL) {
      return { success: false, message: `Has alcanzado el límite de ${MAX_TOTAL_OBJECTIVES_PER_GOAL} objetivos para esta meta.` };
    }

    const activeInGoal = uniqueInGoal.filter(o => (o.status === "active" || (o.status as string) === "in_progress")).length;
    const tempId = generateId();
    const newObjective: Objective = {
      ...objective,
      id: tempId,
      createdAt: new Date().toISOString(),
      status: activeInGoal < MAX_ACTIVE_OBJECTIVES_PER_GOAL ? "active" : "pending",
      order: get().objectives.length
    };

    set((state) => ({ objectives: [...state.objectives, newObjective] }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try {
        const dbObjective = await tasksService.createObjective(newObjective, session.user.id, objective.goalId);
        set((state) => ({
          objectives: state.objectives.map(o => o.id === tempId ? dbObjective : o),
          projects: state.projects.map(p => p.objectiveId === tempId ? { ...p, objectiveId: dbObjective.id } : p),
          activities: state.activities.map(a => a.objectiveId === tempId ? { ...a, objectiveId: dbObjective.id } : a)
        }));
      } catch (error) { console.error("Cloud Error (addObjective):", error); }
    }
    return { success: true };
  },

  updateObjective: async (id, updates) => {
    set((state) => ({
      objectives: state.objectives.map((o) =>
        o.id === id ? { ...o, ...updates, statusUpdatedAt: new Date().toISOString() } : o
      ),
    }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try { await tasksService.updateObjective(id, updates); }
      catch (error) { console.error("Cloud Error (updateObjective):", error); }
    }
  },

  removeObjective: async (id) => {
    const projects = get().projects.filter(p => p.objectiveId === id).map(p => p.id);
    const activities = get().activities.filter(a => a.objectiveId === id).map(a => a.id);
    const tasks = get().actionPlans.filter(t => activities.includes(t.activityId) || projects.includes(t.activityId)).map(t => t.id);

    set((state) => ({
      objectives: state.objectives.filter((o) => o.id !== id),
      projects: state.projects.filter((p) => p.objectiveId !== id),
      activities: state.activities.filter((a) => a.objectiveId !== id),
      actionPlans: state.actionPlans.filter((t) => !tasks.includes(t.id)),
      workSessions: state.workSessions.filter((w) => !activities.includes(w.activityId)),
    }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try { await tasksService.deleteObjective(id); }
      catch (error) { console.error("Cloud Error (removeObjective):", error); }
    }
  },

  toggleObjectiveStatus: async (id) => {
    const objective = get().objectives.find((o) => o.id === id);
    if (!objective) return { success: false, message: "Objetivo no encontrado" };
    
    let newStatus: EntityStatus;
    if (objective.status === "active" || (objective.status as string) === "in_progress") {
      newStatus = "paused";
    } else {
      const activeInGoal = get().objectives.filter(o => 
        o.goalId === objective.goalId && 
        (o.status === "active" || (o.status as string) === "in_progress")
      );
      // Deduplicate by ID
      const activeCount = new Set(activeInGoal.map(o => o.id)).size;
      
      if (activeCount >= MAX_ACTIVE_OBJECTIVES_PER_GOAL) {
        return { success: false, message: `Ya tienes ${MAX_ACTIVE_OBJECTIVES_PER_GOAL} objetivos activos para esta meta. Pausa uno para activar este.` };
      }
      newStatus = "active";
    }
    
    await get().updateObjective(id, { status: newStatus });
    return { success: true };
  },

  addActivity: async (activity) => {
    const metrics = get().getDailyMetrics();
    const totalWithNew = get().userSettings.sleepMinutes + get().userSettings.routineMinutes + metrics.plannedMinutes + (activity.plannedMinutesPerSession || 0);

    if (totalWithNew > 1440) return false;

    const tempId = generateId();
    const newActivity: Activity = {
      ...activity,
      id: tempId,
      createdAt: new Date().toISOString(),
      status: "active",
      order: get().activities.length,
      minutesSpentToday: 0
    };

    set((state) => ({ activities: [...state.activities, newActivity] }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try {
        const dbActivity = await tasksService.createActivity(newActivity, session.user.id, null, newActivity.objectiveId);
        set((state) => ({
          activities: state.activities.map(a => a.id === tempId ? dbActivity : a),
          actionPlans: state.actionPlans.map(t => t.activityId === tempId ? { ...t, activityId: dbActivity.id } : t)
        }));
      } catch (error) { console.error("Cloud Error (addActivity):", error); }
    }
    return true;
  },

  updateActivity: async (id, updates) => {
    if (updates.plannedMinutesPerSession !== undefined) {
      const state = get();
      const activity = state.activities.find(a => a.id === id);
      if (activity) {
        const otherPlanned = state.getDailyMetrics().plannedMinutes - (activity.plannedMinutesPerSession || 0);
        const totalWithUpdate = state.userSettings.sleepMinutes + state.userSettings.routineMinutes + otherPlanned + updates.plannedMinutesPerSession;
        
        if (totalWithUpdate > 1440) {
          return { success: false, message: "No puedes exceder los 1440 minutos totales del día." };
        }
      }
    }

    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, ...updates, statusUpdatedAt: new Date().toISOString() } : a
      ),
    }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try { await tasksService.updateActivity(id, updates); }
      catch (error) { console.error("Cloud Error (updateActivity):", error); }
    }
    return { success: true };
  },

  removeActivity: async (id) => {
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
      actionPlans: state.actionPlans.filter((t) => t.activityId !== id),
      workSessions: state.workSessions.filter((w) => w.activityId !== id),
    }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try { await tasksService.deleteActivity(id); }
      catch (error) { console.error("Cloud Error (removeActivity):", error); }
    }
  },

  toggleActivityStatus: async (id) => {
    const activity = get().activities.find((a) => a.id === id);
    if (!activity) return;
    const newStatus = activity.status === "active" ? "pending" : "active";
    await get().updateActivity(id, { status: newStatus as EntityStatus });
  },

  logActivityExecution: async (id, minutes) => {
    const activity = get().activities.find(a => a.id === id);
    if (!activity) return { success: false, message: "Actividad no encontrada" };

    const currentSpent = activity.minutesSpentToday || 0;
    const planned = activity.plannedMinutesPerSession || 0;

    if (currentSpent + minutes > planned) {
      return { success: false, message: `No puedes ejecutar más de los ${planned} min planificados.` };
    }

    const updatedActivities = get().activities.map(a => 
      a.id === id ? { ...a, minutesSpentToday: currentSpent + minutes } : a
    );

    set({ activities: updatedActivities });

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try {
        const metrics = get().getDailyMetrics();
        await analyticsService.logTime(session.user.id, id, minutes);
        await analyticsService.updateDailyMinutes(session.user.id, metrics.plannedMinutes, metrics.executedMinutes);
        await (get() as any).updateAchievements(minutes, updatedActivities);
      } catch (error) { console.error("Cloud Error (logActivityExecution):", error); }
    }

    return { success: true };
  },

  addActionPlan: async (plan) => {
    const active = get().actionPlans.filter((p) => p.status === "active").length;
    const tempId = generateId();
    const newPlan: Task = {
      ...plan,
      id: tempId,
      createdAt: new Date().toISOString(),
      status: active < MAX_ACTIVE_ACTION_PLANS ? "active" : "pending",
      order: get().actionPlans.length
    };

    set((state) => ({ actionPlans: [...state.actionPlans, newPlan] }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try {
        const dbPlan = await tasksService.createTask(newPlan, session.user.id, plan.activityId);
        set((state) => ({
          actionPlans: state.actionPlans.map(t => t.id === tempId ? dbPlan : t)
        }));
      } catch (error) { console.error("Cloud Error (addActionPlan):", error); }
    }
  },

  updateActionPlan: async (id, updates) => {
    set((state) => ({
      actionPlans: state.actionPlans.map((t) =>
        t.id === id ? { ...t, ...updates, statusUpdatedAt: new Date().toISOString() } : t
      ),
    }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try { await tasksService.updateTask(id, updates); }
      catch (error) { console.error("Cloud Error (updateActionPlan):", error); }
    }
  },

  removeActionPlan: async (id) => {
    set((state) => ({
      actionPlans: state.actionPlans.filter((t) => t.id !== id),
    }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try { await tasksService.deleteTask(id); }
      catch (error) { console.error("Cloud Error (removeActionPlan):", error); }
    }
  },

  addWorkSession: (session) => {
    set((state) => ({ workSessions: [...state.workSessions, session] }));
  },

  addRoutine: (name, minutes) => {
    const id = generateId();
    const current = get().userSettings;
    const routines = current.routines || [];
    const newRoutines = [...routines, { id, name, minutes }];
    const totalRoutineMinutes = newRoutines.reduce((acc, r) => acc + r.minutes, 0);
    
    set((state) => ({
      userSettings: {
        ...state.userSettings,
        routines: newRoutines,
        routineMinutes: totalRoutineMinutes
      }
    }));
  },

  updateRoutine: (id, updates) => {
    const current = get().userSettings;
    const routines = current.routines || [];
    const newRoutines = routines.map(r => r.id === id ? { ...r, ...updates } : r);
    const totalRoutineMinutes = newRoutines.reduce((acc, r) => acc + r.minutes, 0);
    
    set((state) => ({
      userSettings: {
        ...state.userSettings,
        routines: newRoutines,
        routineMinutes: totalRoutineMinutes
      }
    }));
  },

  removeRoutine: (id) => {
    const current = get().userSettings;
    const routines = current.routines || [];
    const newRoutines = routines.filter(r => r.id !== id);
    const totalRoutineMinutes = newRoutines.reduce((acc, r) => acc + r.minutes, 0);
    
    set((state) => ({
      userSettings: {
        ...state.userSettings,
        routines: newRoutines,
        routineMinutes: totalRoutineMinutes
      }
    }));
  },

  updateSettings: (updates) => {
    const current = get().userSettings;
    const newSleep = updates.sleepMinutes !== undefined ? updates.sleepMinutes : current.sleepMinutes;
    const newRoutine = updates.routineMinutes !== undefined ? updates.routineMinutes : current.routineMinutes;
    
    const planned = get().getDailyMetrics().plannedMinutes;
    if (newSleep + newRoutine + planned > 1440) {
      return { success: false, message: "El tiempo total (Sueño + Rutina + Planeado) excede los 1440 minutos." };
    }

    set((state) => ({
      userSettings: { ...state.userSettings, ...updates }
    }));

    const { data: { session } } = supabase.auth.getSession() as any;
    if (session) {
      profilesService.updateProfile(session.user.id, {
        sleep_minutes: newSleep,
        routine_minutes: newRoutine
      }).catch(err => console.error("Cloud Error (updateSettings):", err));
    }

    return { success: true };
  },

  getDailyMetrics: () => {
    const state = get();
    const activeWorkspaceId = state.activeWorkspaceId;
    
    // Get goals belonging to active workspace
    const workspaceGoalIds = state.goals
      .filter(g => g.workspaceId === activeWorkspaceId)
      .map(g => g.id);

    // Get objectives belonging to those goals
    const workspaceObjectiveIds = state.objectives
      .filter(o => workspaceGoalIds.includes(o.goalId))
      .map(o => o.id);

    // Filter activities that belong to this workspace
    const workspaceActivities = state.activities.filter(a => 
      workspaceObjectiveIds.includes(a.objectiveId)
    );

    const plannedMinutes = workspaceActivities
      .filter(a => a.status === 'active' || (a.status as string) === 'in_progress')
      .reduce((acc, a) => acc + (a.plannedMinutesPerSession || 0), 0);

    const executedMinutes = workspaceActivities.reduce((acc, a) => acc + (a.minutesSpentToday || 0), 0);
    const totalProductiveMinutes = 1440 - state.userSettings.sleepMinutes - state.userSettings.routineMinutes;
    const freeMinutes = totalProductiveMinutes - plannedMinutes;
    const alignmentPercent = plannedMinutes > 0 ? Math.round((executedMinutes / plannedMinutes) * 100) : 0;

    return { freeMinutes, plannedMinutes, executedMinutes, alignmentPercent };
  },

  migrateLocalToSupabase: async (userId) => {
    try {
      const state = get();
      for (const goal of state.goals) {
        await goalsService.create(goal, userId);
      }
      // ... similar for projects, objectives, activities
    } catch (error) { console.error("Migration Error:", error); }
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

      if (goals) {
        set({ goals: goals as any });

        if (objectives) {
          set({ objectives: objectives as any });

          if (projects) {
            set({ projects: projects as any });
          }

          if (activities) {
            set({ activities: activities as any });

            if (tasks) {
              set({ actionPlans: tasks as any });
            }
          }
        }
      }

    } catch (error) { console.error("Error fetching cloud data:", error); }
  }
});
