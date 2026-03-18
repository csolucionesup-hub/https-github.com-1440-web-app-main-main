import { StateCreator } from "zustand";
import { AppState, WorkspaceSlice } from "../types";
import { Workspace } from "../../types";
import { generateId } from "../../utils/uuid";
import { workspaceService } from "../../services/workspaceService";
import { supabase } from "../../lib/supabaseClient";

export const createWorkspaceSlice: StateCreator<
  AppState,
  [],
  [],
  WorkspaceSlice
> = (set) => ({
  workspaces: [],
  activeWorkspaceId: null,

  addWorkspace: async (workspace) => {
    const tempId = generateId();
    const newWorkspace: Workspace = {
      ...workspace,
      id: tempId,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => {
      const nextActiveId = state.activeWorkspaceId || newWorkspace.id;
      return { 
        workspaces: [...state.workspaces, newWorkspace],
        activeWorkspaceId: nextActiveId
      };
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      try {
        const dbWorkspace = await workspaceService.create(newWorkspace, session.user.id);
        set((state) => ({
          workspaces: state.workspaces.map(w => w.id === tempId ? dbWorkspace : w),
          activeWorkspaceId: state.activeWorkspaceId === tempId ? dbWorkspace.id : state.activeWorkspaceId,
          goals: state.goals.map(g => g.workspaceId === tempId ? { ...g, workspaceId: dbWorkspace.id } : g),
          objectives: state.objectives.map(o => o.workspaceId === tempId ? { ...o, workspaceId: dbWorkspace.id } : o),
          projects: state.projects.map(p => p.workspaceId === tempId ? { ...p, workspaceId: dbWorkspace.id } : p),
        }));
      } catch (error) {
        console.error("❌ Error syncing workspace to cloud:", error);
      }
    }
  },

  updateWorkspace: (id, updates) => {
    set((state) => ({
      workspaces: state.workspaces.map((w) =>
        w.id === id ? { ...w, ...updates } : w
      ),
    }));
  },

  removeWorkspace: (id) => {
    set((state) => ({
      workspaces: state.workspaces.filter((w) => w.id !== id),
      activeWorkspaceId: state.activeWorkspaceId === id ? null : state.activeWorkspaceId,
    }));
  },

  setActiveWorkspace: (id) => {
    set({ activeWorkspaceId: id });
  },
});
