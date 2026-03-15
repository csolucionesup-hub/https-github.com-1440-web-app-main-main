import { useAppStore } from "../store/useAppStore";

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

  // 1.5 Migrate orphaned goals to Personal workspace
  const personalWorkspace = workspacesToKeep.find(w => w.name === 'Personal');
  if (personalWorkspace) {
    state.goals.forEach(goal => {
      if (!goal.workspaceId) {
        console.log(`📌 [Migration] Assigning goal "${goal.title}" to Personal workspace`);
        state.updateGoal(goal.id, { workspaceId: personalWorkspace.id });
      }
    });
  }

  console.log("✨ Cleanup finished (preserved all user goals).");
};
