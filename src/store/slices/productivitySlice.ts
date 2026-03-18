import { StateCreator } from "zustand";
import { AppState, ProductivitySlice } from "../types";
import { 
  Project, 
  Objective, 
  Activity, 
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

export const createProductivitySlice: StateCreator<
  AppState,
  [],
  [],
  ProductivitySlice
> = (set, get) => ({
  projects: [],
  objectives: [],
  activities: [],
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
    const uniqueIds = new Set(allInObj.map(p => p.id));
    
    if (uniqueIds.size >= MAX_TOTAL_PROJECTS_PER_OBJECTIVE) {
      return { success: false, message: `Has alcanzado el límite de ${MAX_TOTAL_PROJECTS_PER_OBJECTIVE} proyectos para este objetivo.` };
    }

    const activeInObjCount = new Set(allInObj
      .filter(p => p.status === "active" || (p.status as string) === "in_progress")
      .map(p => p.id)
    ).size;

    const tempId = generateId();
    const newProject: Project = {
      ...project,
      id: tempId,
      workspaceId: get().activeWorkspaceId || undefined,
      createdAt: new Date().toISOString(),
      status: activeInObjCount < MAX_ACTIVE_PROJECTS_PER_OBJECTIVE ? "active" : "pending",
      order: get().projects.length
    };

    set((state) => ({ projects: [...state.projects, newProject] }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try {
        const dbProject = await tasksService.createProject(newProject, session.user.id, project.objectiveId);
        set((state) => ({
          projects: state.projects.map(p => p.id === tempId ? dbProject : p),
        }));
      } catch (error) { 
        console.error("Cloud Error (addProject):", error); 
        // Keep optimistic project
      }
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
    const uniqueIds = new Set(allInGoal.map(o => o.id));
    
    if (uniqueIds.size >= MAX_TOTAL_OBJECTIVES_PER_GOAL) {
      return { success: false, message: `Has alcanzado el límite de ${MAX_TOTAL_OBJECTIVES_PER_GOAL} objetivos para esta meta.` };
    }

    const activeInGoalCount = new Set(allInGoal
      .filter(o => o.status === "active" || (o.status as string) === "in_progress")
      .map(o => o.id)
    ).size;

    const tempId = generateId();
    const newObjective: Objective = {
      ...objective,
      id: tempId,
      workspaceId: get().activeWorkspaceId || undefined,
      createdAt: new Date().toISOString(),
      status: activeInGoalCount < MAX_ACTIVE_OBJECTIVES_PER_GOAL ? "active" : "pending",
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
      } catch (error) { 
        console.error("Cloud Error (addObjective):", error); 
        // Keep optimistic objective
      }
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
    const activities = get().activities.filter(a => a.objectiveId === id).map(a => a.id);

    set((state) => ({
      objectives: state.objectives.filter((o) => o.id !== id),
      projects: state.projects.filter((p) => p.objectiveId !== id),
      activities: state.activities.filter((a) => a.objectiveId !== id),
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
        const dbActivity = await tasksService.createActivity(newActivity, session.user.id, null, newActivity.objectiveId, newActivity.projectId);
        set((state) => ({
          activities: state.activities.map(a => a.id === tempId ? dbActivity : a),
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
    const activityToDelete = get().activities.find(a => a.id === id);
    if (!activityToDelete) return;

    // Save previous state for rollback
    const previousActivities = get().activities;
    const previousSessions = get().workSessions;

    // Optimistic UI removal
    set((state) => ({
      activities: state.activities.filter((a) => a.id !== id),
      workSessions: state.workSessions.filter((w) => w.activityId !== id),
    }));

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try { 
        await tasksService.deleteActivity(id); 
      }
      catch (error: any) { 
        console.error("Cloud Error (removeActivity):", error);
        // Rollback state if backend fails
        set({ 
          activities: previousActivities,
          workSessions: previousSessions
        });
        
        if (error.code === '23503') {
          alert("No se puede borrar: Esta actividad tiene registros de tiempo o planes asociados. Aplica el script SQL de 'Borrado en Cascada' para solucionar esto.");
        } else {
          alert("Error al sincronizar con la nube: La actividad ha vuelto a la lista.");
        }
      }
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
    const workspaceId = state.activeWorkspaceId;
    const activeWorkspace = state.workspaces.find(w => w.id === workspaceId);
    const isNegocioArea = activeWorkspace?.name === 'Negocios';
    
    // Get goals belonging to active workspace OR orphans in this category area
    const workspaceGoalIds = state.goals
      .filter(g => {
        if (g.workspaceId === workspaceId) return true;
        if (!g.workspaceId) {
          const gIsNegocio = g.category === 'Negocio';
          return isNegocioArea === gIsNegocio;
        }
        return false;
      })
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
      const [profile, goals, objectives, projects, activities] = await Promise.all([
        profilesService.getProfile(userId),
        goalsService.getAll(),
        tasksService.getObjectives(),
        tasksService.getProjects(),
        tasksService.getActivities()
      ]);

      set((state) => {
        const newState: any = {};
        
        // Cautious Merge: Cloud data wins for existing IDs or Titles
        // This helps clean up "temp" local items that failed to sync but are actually in the cloud
        if (goals && goals.length > 0) {
          const cloudMap = new Map();
          goals.forEach(g => {
            cloudMap.set(g.id, g);
            cloudMap.set(g.title.toLowerCase(), g);
          });
          
          newState.goals = goals;
        }
        
        if (objectives && objectives.length > 0) newState.objectives = objectives;
        if (projects && projects.length > 0) newState.projects = projects;
        if (activities && activities.length > 0) newState.activities = activities;
        
        return Object.keys(newState).length > 0 ? newState : state;
      });

    } catch (error) { console.error("Error fetching cloud data:", error); }
  }
});
