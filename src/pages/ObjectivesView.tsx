import React, { useState, useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { ObjectiveCard } from "../components/objectives/ObjectiveCard";
import { Plus, Target } from "lucide-react";
import { CreateObjectiveModal } from "../components/objectives/CreateObjectiveModal";
import { Objective } from "../types";

export default function ObjectivesView() {
  const { projects, objectives, addObjective } = useAppStore();
  
  const [name, setName] = useState("");
  const [goalId, setGoalId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [period, setPeriod] = useState<'quarterly' | 'monthly' | 'bimonthly'>('monthly');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState<Objective | undefined>(undefined);
  
  // Filter state
  const [filterGoalId, setFilterGoalId] = useState<string>("");
  const [filterProjectId, setFilterProjectId] = useState<string>("");

  const { goals } = useAppStore();
  const activeGoals = useMemo(() => goals.filter(g => g.status === 'active'), [goals]);

  const activeProjectsForGoal = useMemo(() => {
    if (!filterGoalId) return [];
    return projects.filter(p => p.goalId === filterGoalId && (p.status === 'active' || p.status === 'in_progress'));
  }, [projects, filterGoalId]);

  // Handle default selection and synchronization
  React.useEffect(() => {
    if (activeGoals.length > 0 && !filterGoalId) {
      const firstId = activeGoals[0].id;
      setFilterGoalId(firstId);
      setGoalId(firstId); // Sync form
    }
  }, [activeGoals, filterGoalId]);

  React.useEffect(() => {
    if (activeProjectsForGoal.length > 0 && (!filterProjectId || !activeProjectsForGoal.find(p => p.id === filterProjectId))) {
      const firstProjId = activeProjectsForGoal[0].id;
      setFilterProjectId(firstProjId);
      setProjectId(firstProjId); // Sync form
    }
  }, [activeProjectsForGoal, filterProjectId]);

  const filteredProjects = useMemo(() => {
    if (!goalId) return [];
    return projects.filter(p => p.goalId === goalId);
  }, [projects, goalId]);

  const activeObjectives = useMemo(
    () => {
      let filtered = objectives.filter((o) => o.status === "active" || o.status === "in_progress");
      if (filterProjectId) {
        filtered = filtered.filter(o => o.projectId === filterProjectId);
      }
      return filtered;
    },
    [objectives, filterProjectId]
  );


  function handleAdd() {
    if (!name.trim() || !projectId) return;
    addObjective({
      title: name,
      projectId: projectId,
      period: period
    });
    setName("");
    // We keep goalId and projectId for potential batch entry if user prefers
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-[#020617] text-white">
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 shadow-xl shadow-indigo-900/20">
            <Target className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-extrabold font-heading tracking-tight">
            Objetivos
          </h1>
        </div>
        <p className="text-slate-400 text-lg">Define los hitos estratégicos que desglosarán tus grandes metas.</p>
      </header>

      {/* Add Form */}
      <div className="glass-card premium-border p-8 mb-12 rounded-[24px] flex gap-4 flex-wrap items-end animate-slide-up">
        <div className="flex-1 min-w-[300px]">
          <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3 ml-1">
            Nombre del Objetivo
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Lanzamiento MVP SaaS"
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="w-full md:w-64">
          <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3 ml-1">
            1. Seleccionar Meta
          </label>
          <select
            value={goalId}
            onChange={(e) => {
              setGoalId(e.target.value);
              setProjectId(""); // Reset project when goal changes
            }}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
          >
            <option value="" style={{ background: "#0F172A", color: "#475569" }}>Selecciona una meta</option>
            {goals.map(g => (
              <option key={g.id} value={g.id} style={{ background: "#0F172A", color: "white" }}>{g.title}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-64">
          <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3 ml-1">
            2. Asociar a Proyecto
          </label>
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            disabled={!goalId}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" style={{ background: "#0F172A", color: "#475569" }}>{goalId ? 'Selecciona un proyecto' : 'Primero elige una meta'}</option>
            {filteredProjects.map(p => (
              <option key={p.id} value={p.id} style={{ background: "#0F172A", color: "white" }}>{p.title}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-3 ml-1">
            Período
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
          >
            <option value="monthly" style={{ background: "#0F172A", color: "white" }}>Mensual</option>
            <option value="bimonthly" style={{ background: "#0F172A", color: "white" }}>Bimestral</option>
            <option value="quarterly" style={{ background: "#0F172A", color: "white" }}>Trimestral</option>
          </select>
        </div>

        <button
          onClick={handleAdd}
          disabled={!name.trim() || !projectId}
          className="h-[52px] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-8 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Agregar
        </button>
      </div>

      <div className="flex flex-col gap-6 mb-12 animate-fade-in">
        {/* Goal Filter */}
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

        {/* Project Filter (Conditional) */}
        {filterGoalId && activeProjectsForGoal.length > 0 && (
          <div className="flex flex-wrap gap-2 pl-4 border-l-2 border-indigo-500/20 animate-slide-right">
            {activeProjectsForGoal.map((proj) => (
              <button
                key={proj.id}
                onClick={() => setFilterProjectId(proj.id)}
                className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${
                  filterProjectId === proj.id 
                    ? "bg-sky-500/20 border-sky-500 text-sky-400 shadow-lg shadow-sky-900/20" 
                    : "bg-slate-900/30 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-400"
                }`}
              >
                {proj.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-16">
        <section>
          <h2 className="text-xl font-bold text-white/90 mb-8 flex items-center gap-3">
             <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
             Objetivos Activos
          </h2>
          {activeObjectives.length === 0 ? (
            <div className="p-12 glass-card premium-border text-center rounded-[24px]">
              <p className="text-slate-500">No hay objetivos activos en curso.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeObjectives.map(obj => (
                <ObjectiveCard 
                  key={obj.id} 
                  objective={obj} 
                  onEdit={() => {
                    setSelectedObjective(obj);
                    setIsEditModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </section>

      </div>

      {selectedObjective && (
        <CreateObjectiveModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedObjective(undefined);
          }}
          projectId={selectedObjective.projectId}
          objectiveToEdit={selectedObjective}
        />
      )}
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  background: "#1e293b",
  border: "none",
  color: "#94a3b8",
  padding: 8,
  borderRadius: 8,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s"
};