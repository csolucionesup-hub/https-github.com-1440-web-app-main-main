import React, { useMemo, useState } from "react";
import { useAppStore } from "../store/useAppStore";
import { Goal } from "../types";
import { GoalCard } from "../components/goals/GoalCard";
import MotivationalQuote from "../components/ui/MotivationalQuote";

export default function GoalsView() {
  const goals = useAppStore((state) => state.goals);
  const addGoal = useAppStore((state) => state.addGoal);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Negocio");

  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.status === "active"),
    [goals]
  );

  const inactiveGoals = useMemo(
    () => goals.filter((goal) => goal.status !== "active"),
    [goals]
  );

  function handleAddGoal() {
    if (!name.trim()) return;

    addGoal({
      title: name.trim(),
      category: category,
      period: 'annual',
      priority: 'medium',
      color: '#06b6d4',
    });

    setName("");
    setCategory("Negocio");
  }

  return (
    <div style={{ padding: 40, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 className="text-4xl font-extrabold text-white mb-2 font-heading tracking-tight">
          Mis Metas
        </h1>
        <p className="text-slate-400 text-lg">Define y gestiona los pilares de tu vida de 1440 minutos.</p>
      </div>

      <div style={{ marginBottom: 40 }}>
        <MotivationalQuote strategy="random" category="goals" />
      </div>

      <div
        className="glass-card premium-border p-8 mb-12"
        style={{
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          borderRadius: 24,
          alignItems: 'center'
        }}
      >
        <input
          placeholder="¿Qué nueva meta quieres conquistar?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-[300px] bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-500"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all cursor-pointer"
        >
          <option>Negocio</option>
          <option>Salud</option>
          <option>Espiritual</option>
          <option>Personal</option>
        </select>

        <button
          onClick={handleAddGoal}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 active:scale-[0.98]"
        >
          Crear Meta Principal
        </button>
      </div>

      {activeGoals.length === 0 && inactiveGoals.length === 0 ? (
        <div className="glass-card premium-border p-12 text-center rounded-3xl">
          <p className="text-slate-400 text-xl font-medium mb-2">No tienes metas creadas todavía.</p>
          <p className="text-slate-500">Comienza definiendo una meta de Negocio, Salud o lo que sea hoy prioritario.</p>
        </div>
      ) : (
        <div className="space-y-12">
          {activeGoals.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
                Metas Activas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {activeGoals.map((goal) => (
                   <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          )}
          
          {inactiveGoals.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-white/60 mb-6 flex items-center gap-3">
                <div className="w-2 h-8 bg-slate-600 rounded-full"></div>
                Otras Metas (Banco / Pausadas)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {inactiveGoals.map((goal) => (
                  <GoalCard key={goal.id} goal={goal} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
