import React, { useState, useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { ProjectCard } from "../components/projects/ProjectCard";
import { Plus, FolderKanban } from "lucide-react";
import { CreateProjectModal } from "../components/projects/CreateProjectModal";
import { Project, Objective } from "../types";

export default function ProjectsView() {
  const { goals, objectives, projects, addProject } = useAppStore();
  
  const [name, setName] = useState("");
  const [objectiveId, setObjectiveId] = useState("");
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'semester'>('monthly');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  
  // Filter state
  const [filterGoalId, setFilterGoalId] = useState<string>("");
  const [filterObjectiveId, setFilterObjectiveId] = useState<string>("");

  const activeGoals = useMemo(() => goals.filter(g => g.status === 'active' || g.status === 'pending'), [goals]);

  const objectivesForGoal = useMemo(() => {
    if (!filterGoalId) return [];
    return objectives.filter(o => o.goalId === filterGoalId);
  }, [objectives, filterGoalId]);

  // Handle default selections
  React.useEffect(() => {
    if (activeGoals.length > 0 && !filterGoalId) {
      setFilterGoalId(activeGoals[0].id);
    }
  }, [activeGoals, filterGoalId]);

  React.useEffect(() => {
    if (objectivesForGoal.length > 0 && (!filterObjectiveId || !objectivesForGoal.find(o => o.id === filterObjectiveId))) {
      const firstId = objectivesForGoal[0].id;
      setFilterObjectiveId(firstId);
      setObjectiveId(firstId);
    }
  }, [objectivesForGoal, filterObjectiveId]);

  const activeProjects = useMemo(
    () => {
      let filtered = projects.filter((p) => p.status === "active" || p.status === "in_progress" || p.status === "pending");
      if (filterObjectiveId) {
        filtered = filtered.filter(p => p.objectiveId === filterObjectiveId);
      }
      return filtered;
    },
    [projects, filterObjectiveId]
  );

  function handleAdd() {
    if (!name.trim() || !objectiveId) return;
    addProject({
      title: name,
      objectiveId: objectiveId,
      period: period
    });
    setName("");
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-[#020617] text-white">
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 shadow-xl shadow-sky-900/20">
            <FolderKanban className="w-8 h-8 text-sky-400" />
          </div>
          <h1 className="text-4xl font-extrabold font-heading tracking-tight">
            Proyectos
          </h1>
        </div>
        <p className="text-slate-400 text-lg">Gestiona las iniciativas concretas que componen tus objetivos estratégicos.</p>
      </header>

      {/* Add Form */}
      <div className="glass-card premium-border p-8 mb-12 rounded-[24px] flex gap-4 flex-wrap items-end animate-slide-up">
        <div className="flex-1 min-w-[300px]">
          <label className="block text-[10px] font-bold text-sky-400 uppercase tracking-[0.2em] mb-3 ml-1">
            Nombre del Proyecto
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Desarrollo de Plataforma V2"
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="w-full md:w-64">
          <label className="block text-[10px] font-bold text-sky-400 uppercase tracking-[0.2em] mb-3 ml-1">
            Asociar a Objetivo
          </label>
          <select
            value={objectiveId}
            onChange={(e) => setObjectiveId(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-sky-500/50 transition-all cursor-pointer"
          >
            <option value="">Selecciona un objetivo</option>
            {objectives.map(o => (
              <option key={o.id} value={o.id}>{o.title}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-[10px] font-bold text-sky-400 uppercase tracking-[0.2em] mb-3 ml-1">
            Período
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-sky-500/50 transition-all cursor-pointer"
          >
            <option value="monthly">Mensual</option>
            <option value="quarterly">Trimestral</option>
            <option value="semester">Semestral</option>
          </select>
        </div>

        <button
          onClick={handleAdd}
          disabled={!name.trim() || !objectiveId}
          className="h-[52px] bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold px-8 rounded-xl transition-all shadow-lg shadow-sky-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Agregar
        </button>
      </div>

      <div className="flex flex-col gap-6 mb-12 animate-fade-in">
        <div className="flex flex-wrap gap-2">
          {activeGoals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => setFilterGoalId(goal.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                filterGoalId === goal.id 
                  ? "bg-indigo-500/20 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-900/20" 
                  : "bg-slate-900/40 border-white/5 text-slate-500 hover:border-white/20 hover:text-slate-300"
              }`}
            >
              {goal.title}
            </button>
          ))}
        </div>

        {filterGoalId && objectivesForGoal.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-4 border-l-2 border-indigo-500/20 animate-slide-right">
            {objectivesForGoal.map((obj) => (
              <button
                key={obj.id}
                onClick={() => setFilterObjectiveId(obj.id)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                  filterObjectiveId === obj.id 
                    ? "bg-sky-500/20 border-sky-500 text-sky-400 shadow-lg shadow-sky-900/20" 
                    : "bg-slate-900/30 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-400"
                }`}
              >
                {obj.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-16">
        <section>
          <h2 className="text-xl font-bold text-white/90 mb-8 flex items-center gap-3">
             <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
             Proyectos Activos
          </h2>
          {activeProjects.length === 0 ? (
            <div className="p-12 glass-card premium-border text-center rounded-[24px]">
              <p className="text-slate-500">No hay proyectos activos para este objetivo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeProjects.map(proj => (
                <ProjectCard 
                  key={proj.id} 
                  project={proj} 
                  onEdit={() => {
                    setSelectedProject(proj);
                    setIsEditModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedProject && (
        <CreateProjectModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProject(undefined);
          }}
          objectiveId={selectedProject.objectiveId}
          projectToEdit={selectedProject}
        />
      )}
    </div>
  );
}