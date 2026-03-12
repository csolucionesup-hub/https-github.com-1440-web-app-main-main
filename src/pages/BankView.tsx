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

export default function BankView() {
  const { goals, projects, objectives, activities, actionPlans } = useAppStore();
  
  // Selection state for drill-down
  const [filterGoalId, setFilterGoalId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [entityType, setEntityType] = useState<string>("");

  const activeGoals = useMemo(() => goals.filter(g => g.status === "active"), [goals]);
  const otherGoals = useMemo(() => goals.filter(g => g.status !== "active"), [goals]);

  // Sync default selection and handle resets
  useEffect(() => {
    if (!filterGoalId && goals.length > 0) {
      setFilterGoalId(goals[0].id);
    }
  }, [goals, filterGoalId]);

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
    if (!filterGoalId) return [];
    return projects.filter(p => p.goalId === filterGoalId && p.status !== "active" && p.status !== "in_progress" && p.status !== "completed");
  }, [projects, filterGoalId]);

  const displayedObjectives = useMemo(() => {
    if (!selectedProjectId) return [];
    return objectives.filter(o => o.projectId === selectedProjectId && o.status !== "active" && o.status !== "in_progress" && o.status !== "completed");
  }, [objectives, selectedProjectId]);

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
      if (g) list.push({ name: g.title, type: 'goal', color: g.status === 'active' ? 'text-emerald-400' : 'text-orange-400' });
    }
    if (selectedProjectId) {
      const p = projects.find(x => x.id === selectedProjectId);
      if (p) list.push({ name: p.title, type: 'project', color: 'text-sky-400' });
    }
    if (selectedObjectiveId) {
      const o = objectives.find(x => x.id === selectedObjectiveId);
      if (o) list.push({ name: o.title, type: 'objective', color: 'text-violet-400' });
    }
    if (selectedActivityId) {
      const a = activities.find(x => x.id === selectedActivityId);
      if (a) list.push({ name: a.title, type: 'activity', color: 'text-emerald-400' });
    }
    return list;
  }, [filterGoalId, selectedProjectId, selectedObjectiveId, selectedActivityId, goals, projects, objectives, activities]);

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
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 mb-10 overflow-x-auto py-2 no-scrollbar">
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

      {/* Dynamic Levels Render */}
      <div className="animate-fade-in">
        {/* If only Meta selected -> Show level 2: Projects */}
        {!selectedProjectId && filterGoalId && (
          <section>
            <h2 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
              Proyectos de la Meta
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
                No hay proyectos pausados para esta meta.
              </div>
            )}
          </section>
        )}

        {/* Level 3: Objectives */}
        {selectedProjectId && !selectedObjectiveId && (
          <section>
            <h2 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-3">
              <div className="w-1.5 h-6 bg-violet-500 rounded-full" />
              Objetivos del Proyecto
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
                No hay objetivos pausados para este proyecto.
              </div>
            )}
          </section>
        )}

        {/* Level 4: Activities */}
        {selectedObjectiveId && !selectedActivityId && (
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
          goalId={selectedEntity.goalId}
          projectToEdit={selectedEntity}
        />
      )}
      {selectedEntity && entityType === "objective" && (
        <CreateObjectiveModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedEntity(null); }}
          projectId={selectedEntity.projectId}
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
    </div>
  );
}