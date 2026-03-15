import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createGoalSlice } from "./slices/goalSlice";
import { createProductivitySlice } from "./slices/productivitySlice";
import { createUISlice } from "./slices/uiSlice";
import { createWorkspaceSlice } from "./slices/workspaceSlice";
import { AppState } from "./types";

export const useAppStore = create<AppState>()(
  persist(
    (set, get, api) => ({
      version: 6,
      ...createGoalSlice(set, get, api),
      ...createProductivitySlice(set, get, api),
      ...createUISlice(set, get, api),
      ...createWorkspaceSlice(set, get, api),
    }),
    {
      name: "1440-storage",
      version: 6,
    }
  )
);

// Inject into window for AuthContext access without circular dependencies if needed
if (typeof window !== 'undefined') {
  (window as any).useAppStore = useAppStore;
}