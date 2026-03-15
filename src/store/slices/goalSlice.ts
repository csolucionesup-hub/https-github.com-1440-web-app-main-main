import { StateCreator } from "zustand";
import { AppState, GoalSlice } from "../types";
import { Goal, EntityStatus } from "../../types";
import { goalsService } from "../../services/goalsService";
import { supabase } from "../../lib/supabaseClient";
import { generateId } from "../../utils/uuid";

const MAX_ACTIVE_GOALS = 3;
const MAX_TOTAL_GOALS = 6;

export const createGoalSlice: StateCreator<
  AppState,
  [],
  [],
  GoalSlice
> = (set, get) => ({
  goals: [],

  addGoal: async (goal) => {
    const activeWorkspaceId = get().activeWorkspaceId;
    const isNegocioArea = goal.category === 'Negocio';
    
    // Total goals check: Strictly 6 global
    const totalCount = new Set(get().goals.map(g => g.id)).size;
    if (totalCount >= MAX_TOTAL_GOALS) {
      return { success: false, message: `Has alcanzado el límite global de ${MAX_TOTAL_GOALS} metas.` };
    }

    // Calculate total unique goals in the logical area (as seen in UI)
    const areaGoals = get().goals.filter(g => {
      // If goal has a workspace, check if it's the current one
      if (activeWorkspaceId && g.workspaceId === activeWorkspaceId) return true;
      
      // OR if it's an orphan, check if its category matches the logical area of the current view
      if (!g.workspaceId) {
        const gIsNegocio = g.category === 'Negocio';
        return isNegocioArea === gIsNegocio;
      }
      
      return false;
    });
    
    const uniqueAreaGoals = Array.from(new Map(areaGoals.map(g => [g.id, g])).values());
    
    const activeGoalsInArea = uniqueAreaGoals.filter(g => g.status === "active").length;

    const tempId = generateId();
    const newGoal: Goal = {
      ...goal,
      id: tempId,
      workspaceId: activeWorkspaceId || goal.workspaceId,
      createdAt: new Date().toISOString(),
      category: goal.category || 'General',
      status: activeGoalsInArea < MAX_ACTIVE_GOALS ? "active" : "pending",
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
    return { success: true };
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
    const state = get();
    const objectivesToRemove = state.objectives.filter(o => o.goalId === id);
    const objectiveIdsToRemove = objectivesToRemove.map(o => o.id);

    const projectsToRemove = state.projects.filter(p => objectiveIdsToRemove.includes(p.objectiveId));
    const projectIdsToRemove = projectsToRemove.map(p => p.id);
    
    const activitiesToRemove = state.activities.filter(a => objectiveIdsToRemove.includes(a.objectiveId));
    const activityIdsToRemove = activitiesToRemove.map(a => a.id);

    const actionPlansToRemove = state.actionPlans.filter(t => activityIdsToRemove.includes(t.activityId));
    const actionPlanIdsToRemove = actionPlansToRemove.map(t => t.id);

    set((state) => ({
      goals: state.goals.filter((g) => g.id !== id),
      objectives: state.objectives.filter((o) => o.goalId !== id),
      projects: state.projects.filter((p) => !objectiveIdsToRemove.includes(p.objectiveId)),
      activities: state.activities.filter((a) => !objectiveIdsToRemove.includes(a.objectiveId)),
      actionPlans: state.actionPlans.filter((t) => !activityIdsToRemove.includes(t.activityId)),
      workSessions: state.workSessions.filter((w) => !activityIdsToRemove.includes(w.activityId)),
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
    if (!goal) return { success: false, message: "Meta no encontrada" };

    const isNegocioArea = goal.category === 'Negocio';
    const areaActiveGoals = state.goals.filter(g => {
      if (g.status !== "active") return false;
      
      // Count goals in the target workspace (if any)
      if (goal.workspaceId && g.workspaceId === goal.workspaceId) return true;
      
      // Count orphans that map to the same logical area
      if (!g.workspaceId) {
        const gIsNegocio = g.category === 'Negocio';
        return isNegocioArea === gIsNegocio;
      }
      
      return false;
    });
    const activeGoalsCount = new Set(areaActiveGoals.map(g => g.id)).size;

    let newStatus: EntityStatus = goal.status;
    
    if (goal.status === "active") {
      newStatus = "paused";
    } else if (goal.status === "paused" || goal.status === "pending") {
      if (activeGoalsCount >= MAX_ACTIVE_GOALS) {
        return { success: false, message: `Ya tienes ${MAX_ACTIVE_GOALS} metas activas en esta área. Pausa una para activar esta.` };
      }
      newStatus = "active";
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
    return { success: true };
  },
});
