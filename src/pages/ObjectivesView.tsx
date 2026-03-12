import React, { useState, useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { ObjectiveCard } from "../components/objectives/ObjectiveCard";
import { Plus, Target } from "lucide-react";

export default function ObjectivesView() {
  const { goals, objectives, addObjective } = useAppStore();
  
  const [name, setName] = useState("");
  const [goalId, setGoalId] = useState("");
  const [period, setPeriod] = useState<'quarterly' | 'monthly' | 'bimonthly'>('monthly');

  const activeObjectives = useMemo(
    () => objectives.filter((o) => o.status === "active" || o.status === "in_progress"),
    [objectives]
  );

  const bankObjectives = useMemo(
    () => objectives.filter((o) => o.status !== "active" && o.status !== "in_progress"),
    [objectives]
  );

  function handleAdd() {
    if (!name.trim() || !goalId) return;
    addObjective({
      title: name,
      goalId: goalId,
      period: period
    });
    setName("");
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
            Asociar a Meta
          </label>
          <select
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-3.5 text-white focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
          >
            <option value="">Selecciona una meta</option>
            {goals.map(g => (
              <option key={g.id} value={g.id}>{g.title}</option>
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
            <option value="monthly">Mensual</option>
            <option value="bimonthly">Bimestral</option>
            <option value="quarterly">Trimestral</option>
          </select>
        </div>

        <button
          onClick={handleAdd}
          disabled={!name.trim() || !goalId}
          className="h-[52px] bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold px-8 rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Agregar
        </button>
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
                <ObjectiveCard key={obj.id} objective={obj} />
              ))}
            </div>
          )}
        </section>

        {bankObjectives.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white/40 mb-8 flex items-center gap-3">
               <div className="w-1.5 h-6 bg-slate-700 rounded-full" />
               Banco / Concluidos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 opacity-70">
              {bankObjectives.map(obj => (
                <ObjectiveCard key={obj.id} objective={obj} />
              ))}
            </div>
          </section>
        )}
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