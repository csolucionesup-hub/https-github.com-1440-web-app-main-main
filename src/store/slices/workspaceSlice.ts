import { StateCreator } from "zustand";
import { AppState, WorkspaceSlice } from "../types";
import { Workspace } from "../../types";
import { generateId } from "../../utils/uuid";

export const createWorkspaceSlice: StateCreator<
  AppState,
  [],
  [],
  WorkspaceSlice
> = (set) => ({
  workspaces: [],
  activeWorkspaceId: null,

  addWorkspace: (workspace) => {
    const newWorkspace: Workspace = {
      ...workspace,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    set((state) => {
      const nextActiveId = state.activeWorkspaceId || newWorkspace.id;
      return { 
        workspaces: [...state.workspaces, newWorkspace],
        activeWorkspaceId: nextActiveId
      };
    });
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
