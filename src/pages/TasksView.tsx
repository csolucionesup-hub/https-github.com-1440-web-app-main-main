import React, { useState, useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { TaskCard } from "../components/tasks/TaskCard";
import { Plus, CheckSquare } from "lucide-react";

export default function TasksView() {
  const { activities, actionPlans, addActionPlan } = useAppStore();
  
  const [title, setTitle] = useState("");
  const [activityId, setActivityId] = useState("");
  const [period, setPeriod] = useState<'daily' | 'weekly'>('daily');

  const activeTasks = useMemo(
    () => actionPlans.filter((t) => t.status === "active" || t.status === "in_progress"),
    [actionPlans]
  );


  function handleAdd() {
    if (!title.trim() || !activityId) return;
    addActionPlan({
      title: title,
      activityId: activityId,
      period: period
    });
    setTitle("");
  }

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-[#020617] text-white">
      <header className="mb-10">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 shadow-xl shadow-cyan-900/20">
            <CheckSquare className="w-8 h-8 text-cyan-400" />
          </div>
          <h1 className="text-4xl font-extrabold font-heading tracking-tight">
            Plan de Acción
          </h1>
        </div>
        <p className="text-slate-400 text-lg">Define las tareas tácticas y recurrentes para ejecutar tus proyectos.</p>
      </header>

      {/* Add Form */}
      <div className="glass-card premium-border p-8 mb-12 rounded-[24px] flex gap-4 flex-wrap items-end animate-slide-up">
        <div className="flex-1 min-w-[300px]">
          <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-3 ml-1">
            Nombre de la Tarea
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Auditoría de seguridad trimestral"
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="w-full md:w-64">
          <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-3 ml-1">
            Actividad Relacionada
          </label>
          <select
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
          >
            <option value="">Selecciona una actividad</option>
            {activities.map(act => (
              <option key={act.id} value={act.id}>{act.title}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-3 ml-1">
            Frecuencia
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer"
          >
            <option value="daily">Diaria</option>
            <option value="weekly">Semanal</option>
          </select>
        </div>

        <button
          onClick={handleAdd}
          disabled={!title.trim() || !activityId}
          className="h-[52px] bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold px-8 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Agregar
        </button>
      </div>

      <div className="space-y-16">
        <section>
          <h2 className="text-xl font-bold text-white/90 mb-8 flex items-center gap-3">
             <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
             Tareas en Ejecución
          </h2>
          {activeTasks.length === 0 ? (
            <div className="p-12 glass-card premium-border text-center rounded-[24px]">
              <p className="text-slate-500">No hay tareas tácticas activas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>

      </div>
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
