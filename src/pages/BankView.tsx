import React from "react";
import { useAppStore } from "../store/useAppStore";
import { GoalCard } from "../components/goals/GoalCard";
import { Archive } from "lucide-react";

export default function BankView() {
  const goals = useAppStore((state) => state.goals);

  const bankGoals = React.useMemo(
    () => goals.filter((goal) => goal.status !== "active" && goal.status !== "in_progress"),
    [goals]
  );

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-[#020617]">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-3">
          <div className="p-3 rounded-2xl bg-slate-800/50 border border-white/10 shadow-xl shadow-slate-900/50">
            <Archive className="w-8 h-8 text-slate-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white font-heading tracking-tight">
            Banco de Metas
          </h1>
        </div>
        <p className="text-slate-400 text-lg">Metas pausadas, archivadas o sin empezar que esperan su momento.</p>
      </header>

      {bankGoals.length === 0 ? (
        <div className="glass-card premium-border p-16 text-center rounded-[32px]">
          <div className="w-20 h-20 bg-slate-800/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
             <Archive className="w-10 h-10 text-slate-600" />
          </div>
          <p className="text-slate-400 text-xl font-medium mb-2">Tu banco está vacío.</p>
          <p className="text-slate-500 max-w-md mx-auto">Cuando pausas una meta o terminas una, aparecerán aquí para tu registro histórico o reactivación futura.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-fade-in">
          {bankGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}
    </div>
  );
}