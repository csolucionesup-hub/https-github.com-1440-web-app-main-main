import { useAppStore } from "../store/useAppStore";
import { workspaceService } from "../services/workspaceService";
import { supabase } from "../lib/supabaseClient";

const names = ['Personal', 'Negocios'];

// Prevents multiple runs in the same session
let isCleaning = false;

export const performDataCleanup = async () => {
  if (isCleaning) return;
  
  const state = useAppStore.getState();
  
  // 1. Deduplicate Workspaces (keep only one Personal and one Negocios)
  const allWorkspaces = state.workspaces;
  
  let workspacesToKeep = [...allWorkspaces];
  let workspacesToRemove: string[] = [];
  
  names.forEach(name => {
    const matches = allWorkspaces.filter(w => w.name === name);
    if (matches.length > 1) {
      const parent = matches[0];
      const duplicates = matches.slice(1);
      
      duplicates.forEach(dup => {
        workspacesToRemove.push(dup.id);
        // Reassign goals from duplicate to parent
        state.goals.forEach(goal => {
          if (goal.workspaceId === dup.id) {
            state.updateGoal(goal.id, { workspaceId: parent.id });
          }
        });
      });
      
      workspacesToKeep = workspacesToKeep.filter(w => !workspacesToRemove.includes(w.id));
    }
  });

  if (workspacesToRemove.length > 0) {
    console.log("🧹 [Cleanup] Removing duplicate workspaces:", workspacesToRemove);
    useAppStore.setState({ workspaces: workspacesToKeep });
    if (state.activeWorkspaceId && workspacesToRemove.includes(state.activeWorkspaceId)) {
        state.setActiveWorkspace(workspacesToKeep[0]?.id || null);
    }
  }

  // 2. Sync Workspaces to Cloud
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    for (const name of names) {
      try {
        const local = allWorkspaces.find(w => w.name === name);
        const defaults = local ? { color: local.color, description: local.description } : {};
        const cloud = await workspaceService.createOrGetByName(name, session.user.id, defaults);
        
        // If local doesn't match cloud ID, update local state
        if (local && local.id !== cloud.id) {
          console.log(`🔄 [Sync] Mapping local workspace "${name}" to cloud ID: ${cloud.id}`);
          useAppStore.setState(s => ({
            workspaces: s.workspaces.map(w => w.id === local.id ? cloud : w),
            activeWorkspaceId: s.activeWorkspaceId === local.id ? cloud.id : s.activeWorkspaceId,
            goals: s.goals.map(g => g.workspaceId === local.id ? { ...g, workspaceId: cloud.id } : g),
          }));
        } else if (!local) {
            // Local missing but Cloud exists or was just created
            console.log(`➕ [Sync] Adding cloud workspace "${name}" to local state`);
            useAppStore.setState(s => ({ workspaces: [...s.workspaces, cloud] }));
        }
      } catch (e) {
        console.error(`❌ [Sync] Error syncing workspace "${name}":`, e);
      }
    }
  }

  console.log("✨ Cleanup and sync finished.");
};
