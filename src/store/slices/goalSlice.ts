import { StateCreator } from "zustand";
import { AppState, GoalSlice } from "../types";
import { Goal, EntityStatus } from "../../types";
import { goalsService } from "../../services/goalsService";
import { supabase } from "../../lib/supabaseClient";
import { generateId } from "../../utils/uuid";

const MAX_ACTIVE_GOALS = 3;
const MAX_TOTAL_GOALS = 20;

export const createGoalSlice: StateCreator<
  AppState,
  [],
  [],
  GoalSlice
> = (set, get) => ({
  goals: [],

  addGoal: async (goal) => {
    const totalGoals = get().goals.length;
    if (totalGoals >= MAX_TOTAL_GOALS) return;
    
    const activeGoals = get().goals.filter((g) => g.status === "active").length;
    const tempId = generateId();
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
});
