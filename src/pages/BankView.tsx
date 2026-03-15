import React, { useState, useMemo, useEffect } from "react";
import { useAppStore } from "../store/useAppStore";
import { GoalCard } from "../components/goals/GoalCard";
import { ProjectCard } from "../components/projects/ProjectCard";
import { ObjectiveCard } from "../components/objectives/ObjectiveCard";
import { ActivityCard } from "../components/activities/ActivityCard";
import { TaskCard } from "../components/tasks/TaskCard";
import { Archive, ChevronRight, LayoutGrid } from "lucide-react";
import { CreateGoalModal } from "../components/goals/CreateGoalModal";
import { CreateProjectModal } from "../components/projects/CreateProjectModal";
import { CreateObjectiveModal } from "../components/objectives/CreateObjectiveModal";
import { CreateActivityModal } from "../components/activities/CreateActivityModal";
import { Edit2, Play, Pause, Trash2, AlertCircle } from "lucide-react";
import { ConfirmDeleteModal } from "../components/ui/ConfirmDeleteModal";

export default function BankView() {
  const { 
    goals, projects, objectives, activities, actionPlans, 
    activeWorkspaceId, workspaces,
    toggleGoalStatus, toggleObjectiveStatus, toggleProjectStatus, toggleActivityStatus,
    removeGoal, removeObjective, removeProject, removeActivity
  } = useAppStore();
  
  // Selection state for drill-down
  const [filterGoalId, setFilterGoalId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [entityType, setEntityType] = useState<string>("");

  const filteredGoals = useMemo(() => {
    if (!activeWorkspaceId) return goals;
    const personalWorkspace = workspaces.find(w => w.name === 'Personal');
    const negociosWorkspace = workspaces.find(w => w.name === 'Negocios');

    const result = goals.filter(g => {
      if (g.workspaceId) return g.workspaceId === activeWorkspaceId;
      
      // Orphan logic: intelligent mapping by category
      if (activeWorkspaceId === negociosWorkspace?.id) {
        return g.category === 'Negocio';
      }
      if (activeWorkspaceId === personalWorkspace?.id) {
        return g.category !== 'Negocio';
      }
      
      return false;
    });

    // Ensure uniqueness by ID to avoid visual duplicates
    return Array.from(new Map(result.map(g => [g.id, g])).values());
  }, [goals, activeWorkspaceId, workspaces]);

  const activeGoals = useMemo(() => filteredGoals.filter(g => g.status === "active"), [filteredGoals]);
  const otherGoals = useMemo(() => filteredGoals.filter(g => g.status !== "active"), [filteredGoals]);

  // Sync default selection and handle resets
  useEffect(() => {
    if (!filterGoalId && filteredGoals.length > 0) {
      setFilterGoalId(filteredGoals[0].id);
    } else if (filterGoalId && !filteredGoals.find(g => g.id === filterGoalId)) {
      // If the selected goal is not in the current workspace, reset selection
      setFilterGoalId(filteredGoals[0]?.id || "");
      setSelectedProjectId(null);
      setSelectedObjectiveId(null);
      setSelectedActivityId(null);
    }
  }, [filteredGoals, filterGoalId]);

  const handleGoalChange = (id: string) => {
    setFilterGoalId(id);
    setSelectedProjectId(null);
    setSelectedObjectiveId(null);
    setSelectedActivityId(null);
  };

  const handleProjectSelect = (id: string) => {
    setSelectedProjectId(id);
    setSelectedObjectiveId(null);
    setSelectedActivityId(null);
  };

  const handleObjectiveSelect = (id: string) => {
    setSelectedObjectiveId(id);
    setSelectedActivityId(null);
  };

  const handleActivitySelect = (id: string) => {
    setSelectedActivityId(id);
  };

  // Memoized filtered lists for the current drill-down level
  const displayedProjects = useMemo(() => {
    if (!selectedObjectiveId) return []; // In the new hierarchy, projects belong to objectives?
    // Wait, let's re-verify hierarchy: Goal -> Objective -> {Project, Activity}
    // So displayedProjects should depend on selectedObjectiveId
    return projects.filter(p => p.objectiveId === selectedObjectiveId && p.status !== "active" && p.status !== "in_progress" && p.status !== "completed");
  }, [projects, selectedObjectiveId]);

  const displayedObjectives = useMemo(() => {
    if (!filterGoalId) return [];
    return objectives.filter(o => o.goalId === filterGoalId && o.status !== "active" && o.status !== "in_progress" && o.status !== "completed");
  }, [objectives, filterGoalId]);

  const displayedActivities = useMemo(() => {
    if (!selectedObjectiveId) return [];
    return activities.filter(a => a.objectiveId === selectedObjectiveId && a.status !== "active" && a.status !== "in_progress" && a.status !== "completed");
  }, [activities, selectedObjectiveId]);

  const displayedTasks = useMemo(() => {
    if (!selectedActivityId) return [];
    return actionPlans.filter(t => t.activityId === selectedActivityId && t.status !== "active" && t.status !== "in_progress" && t.status !== "completed");
  }, [actionPlans, selectedActivityId]);

  const breadcrumbs = useMemo(() => {
    const list = [];
    if (filterGoalId) {
      const g = goals.find(x => x.id === filterGoalId);
      if (g) list.push({ name: g.title, type: 'goal', color: g.status === 'active' ? 'text-emerald-400' : 'text-orange-400', entity: g });
    }
    if (selectedObjectiveId) {
      const o = objectives.find(x => x.id === selectedObjectiveId);
      if (o) list.push({ name: o.title, type: 'objective', color: 'text-violet-400', entity: o });
    }
    if (selectedProjectId) {
      const p = projects.find(x => x.id === selectedProjectId);
      if (p) list.push({ name: p.title, type: 'project', color: 'text-sky-400', entity: p });
    }
    if (selectedActivityId) {
      const a = activities.find(x => x.id === selectedActivityId);
      if (a) list.push({ name: a.title, type: 'activity', color: 'text-emerald-400', entity: a });
    }
    return list;
  }, [filterGoalId, selectedProjectId, selectedObjectiveId, selectedActivityId, goals, projects, objectives, activities]);

  const currentLevelEntity = useMemo(() => {
    if (breadcrumbs.length === 0) return null;
    return breadcrumbs[breadcrumbs.length - 1];
  }, [breadcrumbs]);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);

  const handleToggleCurrent = async () => {
    if (!currentLevelEntity) return;
    const { id } = currentLevelEntity.entity;
    
    let result: { success: boolean; message?: string } | undefined;

    switch (currentLevelEntity.type) {
      case 'goal': 
        result = await toggleGoalStatus(id); 
        break;
      case 'objective': 
        result = await toggleObjectiveStatus(id); 
        break;
      case 'project': 
        result = await toggleProjectStatus(id); 
        break;
      case 'activity': 
        await toggleActivityStatus(id); 
        result = { success: true };
        break;
    }

    if (result && !result.success && result.message) {
      setLimitWarning(result.message);
      setTimeout(() => setLimitWarning(null), 3000);
    }
  };

  const handleDeleteCurrent = async () => {
    if (!currentLevelEntity) return;
    const { id } = currentLevelEntity.entity;
    switch (currentLevelEntity.type) {
      case 'goal': await removeGoal(id); setFilterGoalId(""); break;
      case 'objective': await removeObjective(id); setSelectedObjectiveId(null); break;
      case 'project': await removeProject(id); setSelectedProjectId(null); break;
      case 'activity': await removeActivity(id); setSelectedActivityId(null); break;
    }
    setIsDeleteConfirmOpen(false);
  };

  const handleEditCurrent = () => {
    if (!currentLevelEntity) return;
    setSelectedEntity(currentLevelEntity.entity);
    setEntityType(currentLevelEntity.type);
    setIsEditModalOpen(true);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-[#020617]">
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-white/10 shadow-xl shadow-slate-900/50">
            <Archive className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-white font-heading tracking-tight">
              Banco de Gestión
            </h1>
            <p className="text-slate-400 mt-1">Navega y gestiona tu backlog jerárquicamente.</p>
          </div>
        </div>
      </header>

      {/* Goal Selectors (Roots) */}
      <div className="space-y-6 mb-8 animate-fade-in">
        {activeGoals.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] ml-1">Metas Activas (Enfoque)</p>
            <div className="flex flex-wrap gap-2">
              {activeGoals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalChange(goal.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    filterGoalId === goal.id 
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-900/20" 
                      : "bg-slate-900/40 border-white/5 text-slate-500 hover:border-emerald-500/30 hover:text-emerald-400"
                  }`}
                >
                  {goal.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {otherGoals.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-[0.2em] ml-1">Otras Metas (Banco)</p>
            <div className="flex flex-wrap gap-2">
              {otherGoals.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalChange(goal.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                    filterGoalId === goal.id 
                      ? "bg-orange-500/20 border-orange-500 text-orange-400 shadow-lg shadow-orange-900/20" 
                      : "bg-slate-900/40 border-white/5 text-slate-500 hover:border-orange-500/30 hover:text-orange-400"
                  }`}
                >
                  {goal.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Breadcrumbs Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <LayoutGrid className="w-3.5 h-3.5" />
              Ruta
            </div>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                <button 
                  onClick={() => {
                    if (crumb.type === 'goal') { setSelectedProjectId(null); setSelectedObjectiveId(null); setSelectedActivityId(null); }
                    else if (crumb.type === 'project') { setSelectedObjectiveId(null); setSelectedActivityId(null); }
                    else if (crumb.type === 'objective') { setSelectedActivityId(null); }
                  }}
                  className={`px-3 py-1.5 rounded-lg bg-slate-800/40 border border-white/5 text-xs font-semibold whitespace-nowrap transition-colors hover:bg-slate-800 ${crumb.color}`}
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Dynamic Management Panel */}
        {currentLevelEntity && (
          <div className="flex items-center gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="px-4 py-2 border-r border-white/10 hidden sm:block">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Gestionar {currentLevelEntity.type === 'goal' ? 'Meta' : currentLevelEntity.type === 'objective' ? 'Objetivo' : currentLevelEntity.type === 'project' ? 'Proyecto' : 'Actividad'}</p>
              <p className="text-xs font-semibold text-white truncate max-w-[150px]">{currentLevelEntity.name}</p>
            </div>
            
            <div className="flex items-center gap-1 px-1">
              <button
                onClick={handleToggleCurrent}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentLevelEntity.entity.status === 'active' || currentLevelEntity.entity.status === 'in_progress'
                    ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30"
                    : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
                }`}
              >
                {currentLevelEntity.entity.status === 'active' || currentLevelEntity.entity.status === 'in_progress' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {currentLevelEntity.entity.status === 'active' || currentLevelEntity.entity.status === 'in_progress' ? 'Pausar' : 'Activar'}
              </button>

              <button
                onClick={handleEditCurrent}
                className="p-2.5 rounded-xl bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors border border-white/5"
                title="Editar"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsDeleteConfirmOpen(true)}
                className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors border border-red-500/20"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Limit Warning Notification */}
      {limitWarning && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top duration-300 pointer-events-none">
          <div className="bg-orange-500/20 text-orange-400 border border-orange-500/30 px-6 py-3 rounded-2xl backdrop-blur-md flex items-center gap-3 shadow-2xl">
            <AlertCircle className="w-5 h-5" />
            <p className="font-bold text-sm tracking-wide uppercase">{limitWarning}</p>
          </div>
        </div>
      )}

      {/* Dynamic Levels Render */}
      <div className="animate-fade-in">
        {/* Level 3: Objectives */}
        {!selectedObjectiveId && filterGoalId && (
          <section>
            <h2 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-violet-500 rounded-full" />
              Objetivos de la Meta
            </h2>
            {displayedObjectives.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedObjectives.map((obj) => (
                  <ObjectiveCard 
                    key={obj.id}
                    objective={obj} 
                    onClick={() => handleObjectiveSelect(obj.id)}
                    onEdit={() => {
                      setSelectedEntity(obj);
                      setEntityType("objective");
                      setIsEditModalOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/10 text-slate-500">
                No hay objetivos pausados para esta meta.
              </div>
            )}
          </section>
        )}

        {/* Level 4: Projects & Activities */}
        {selectedObjectiveId && !selectedActivityId && (
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
                Proyectos del Objetivo
              </h2>
              {displayedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedProjects.map((proj) => (
                    <ProjectCard 
                      key={proj.id}
                      project={proj} 
                      onClick={() => handleProjectSelect(proj.id)}
                      onEdit={() => {
                        setSelectedEntity(proj);
                        setEntityType("project");
                        setIsEditModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/10 text-slate-500">
                  No hay proyectos pausados para este objetivo.
                </div>
              )}
            </section>

            <section>
              <h2 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-3">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                Actividades del Objetivo
              </h2>
              {displayedActivities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {displayedActivities.map((act) => (
                    <ActivityCard 
                      key={act.id}
                      activity={act} 
                      onClick={() => handleActivitySelect(act.id)}
                      onEdit={() => {
                        setSelectedEntity(act);
                        setEntityType("activity");
                        setIsEditModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/10 text-slate-500">
                  No hay actividades de banco para este objetivo.
                </div>
              )}
            </section>
          </div>
        )}

        {/* Level 5: Tasks */}
        {selectedActivityId && (
          <section>
            <h2 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
              Tareas del Plan de Acción
            </h2>
            {displayedTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                  />
                ))}
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl bg-white/5 border border-dashed border-white/10 text-slate-500">
                No hay tareas pausadas para esta actividad.
              </div>
            )}
          </section>
        )}
      </div>

      {/* Edit Modals */}
      {selectedEntity && entityType === "project" && (
        <CreateProjectModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedEntity(null); }}
          objectiveId={selectedEntity.objectiveId}
          projectToEdit={selectedEntity}
        />
      )}
      {selectedEntity && entityType === "objective" && (
        <CreateObjectiveModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedEntity(null); }}
          goalId={selectedEntity.goalId}
          objectiveToEdit={selectedEntity}
        />
      )}
      {selectedEntity && entityType === "activity" && (
        <CreateActivityModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedEntity(null); }}
          objectiveId={selectedEntity.objectiveId}
          activityToEdit={selectedEntity}
        />
      )}

      {currentLevelEntity && (
        <ConfirmDeleteModal
          isOpen={isDeleteConfirmOpen}
          onClose={() => setIsDeleteConfirmOpen(false)}
          onConfirm={handleDeleteCurrent}
          title={`Eliminar ${currentLevelEntity.type === 'goal' ? 'Meta' : currentLevelEntity.type === 'objective' ? 'Objetivo' : currentLevelEntity.type === 'project' ? 'Proyecto' : 'Actividad'}`}
          description={`¿Estás seguro de que deseas eliminar "${currentLevelEntity.name}"? Esta acción no se puede deshacer.`}
        />
      )}
    </div>
  );
}