import React, { useState, useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { ProjectCard } from "../components/projects/ProjectCard";
import { Plus, FolderKanban } from "lucide-react";

export default function ProjectsView() {
  const { objectives, projects, addProject } = useAppStore();
  
  const [name, setName] = useState("");
  const [objectiveId, setObjectiveId] = useState("");
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'semester'>('monthly');

  const activeProjects = useMemo(
    () => projects.filter((p) => p.status === "active" || p.status === "in_progress"),
    [projects]
  );

  const bankProjects = useMemo(
    () => projects.filter((p) => p.status !== "active" && p.status !== "in_progress"),
    [projects]
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
            Hito / Objetivo Relacionado
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

      <div className="space-y-16">
        <section>
          <h2 className="text-xl font-bold text-white/90 mb-8 flex items-center gap-3">
             <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
             Proyectos Activos
          </h2>
          {activeProjects.length === 0 ? (
            <div className="p-12 glass-card premium-border text-center rounded-[24px]">
              <p className="text-slate-500">No hay proyectos activos esta temporada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeProjects.map(proj => (
                <ProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          )}
        </section>

        {bankProjects.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white/40 mb-8 flex items-center gap-3">
               <div className="w-1.5 h-6 bg-slate-700 rounded-full" />
               Archivo / Pausados
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-70">
              {bankProjects.map(proj => (
                <ProjectCard key={proj.id} project={proj} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );}

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