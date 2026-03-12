import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import Card from "../components/ui/Card";
import { useShallow } from "zustand/react/shallow";
import MotivationalQuote from "../components/ui/MotivationalQuote";

export default function ActivitiesView() {
  const { activities, actionPlans, projects, addActivity, logActivityExecution, userSettings } = useAppStore();
  const { sleepMinutes, routineMinutes } = userSettings;
  const { plannedMinutes } = useAppStore(useShallow((state) => state.getDailyMetrics()));
  
  const [newTitle, setNewTitle] = useState("");
  const [newMinutes, setNewMinutes] = useState(30);
  const [taskId, setTaskId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const availableForMetas = 1440 - sleepMinutes - routineMinutes;
  const remainingMinutes = availableForMetas - plannedMinutes;

  const handleAdd = async () => {
    setError(null);
    if (!newTitle) {
      setError("El título es obligatorio");
      return;
    }
    if (!taskId) {
      setError("Debes vincular esta actividad a una tarea del Plan de Acción");
      return;
    }
    
    // Find objectiveId from task -> project -> objective
    const task = actionPlans.find(t => t.id === taskId);
    const project = projects.find(p => p.id === task?.projectId);
    const objectiveId = project?.objectiveId || "system-root";

    const success = await addActivity({
      title: newTitle,
      plannedMinutesPerSession: newMinutes,
      taskId: taskId, 
      objectiveId: objectiveId, 
      period: 'daily',
    });

    if (success) {
      setNewTitle("");
      setNewMinutes(30);
      setTaskId("");
    } else {
      setError("No tienes suficientes minutos libres (límite 1440 excedido)");
    }
  };

  const handleLogExecution = async (id: string, mins: number) => {
    const result = await logActivityExecution(id, mins);
    if (!result.success) {
      alert(result.message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top left, rgba(79,70,229,0.08), transparent 25%), #0B1220",
        color: "#F8FAFC",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 14, color: "#94A3B8", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Motor 1440
          </div>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Gestión de Actividades</h1>
          <p style={{ marginTop: 12, fontSize: 16, color: "#CBD5E1", maxWidth: 700 }}>
            Administra cómo distribuyes tus {availableForMetas} minutos disponibles hoy. 
            Actualmente tienes <strong>{remainingMinutes} minutos libres</strong>.
          </p>
          <div style={{ marginTop: 20 }}>
            <MotivationalQuote strategy="random" category="action" />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 24 }}>
          {/* Formulario */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <Card title="Nueva Actividad" subtitle="Planifica tu tiempo">
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>Título</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ej: Lectura técnica"
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      padding: "10px 12px",
                      color: "white",
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>Vincular a Tarea (Plan de Acción)</label>
                  <select
                    value={taskId}
                    onChange={(e) => setTaskId(e.target.value)}
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      padding: "10px 12px",
                      color: "white",
                      outline: "none",
                    }}
                  >
                    <option value="">Selecciona una tarea...</option>
                    {actionPlans.map(task => (
                      <option key={task.id} value={task.id}>{task.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>Minutos planificados</label>
                  <input
                    type="number"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(parseInt(e.target.value) || 0)}
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      padding: "10px 12px",
                      color: "white",
                      outline: "none",
                    }}
                  />
                </div>
                
                {error && <div style={{ color: "#EF4444", fontSize: 13 }}>{error}</div>}

                <button
                  onClick={handleAdd}
                  style={{
                    marginTop: 8,
                    padding: "12px",
                    background: "#4F46E5",
                    color: "white",
                    border: "none",
                    borderRadius: 10,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Agregar a mi día
                </button>
              </div>
            </Card>
          </div>

          {/* Lista de Actividades */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {activities.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#64748B", background: "rgba(255,255,255,0.02)", borderRadius: 18, border: "1px dashed rgba(255,255,255,0.1)" }}>
                No hay actividades planificadas para hoy.
              </div>
            ) : (
              activities.map((activity) => (
                <div 
                  key={activity.id}
                  style={{
                    background: "#111827",
                    borderRadius: 18,
                    padding: 20,
                    border: "1px solid rgba(255,255,255,0.06)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600 }}>{activity.title}</h3>
                    <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>
                      {activity.minutesSpentToday || 0} / {activity.plannedMinutesPerSession} min ejecutados
                    </div>
                    {/* Barra de progreso mini */}
                    <div style={{ width: 120, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginTop: 8, overflow: "hidden" }}>
                      <div 
                        style={{ 
                          width: `${Math.min(100, ((activity.minutesSpentToday || 0) / (activity.plannedMinutesPerSession || 1)) * 100)}%`, 
                          height: "100%", 
                          background: "#10B981" 
                        }} 
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: 8 }}>
                    <button 
                      onClick={() => handleLogExecution(activity.id, 15)}
                      disabled={(activity.minutesSpentToday || 0) >= (activity.plannedMinutesPerSession || 0)}
                      style={{ 
                        padding: "6px 12px", 
                        fontSize: 12, 
                        background: (activity.minutesSpentToday || 0) >= (activity.plannedMinutesPerSession || 0) ? "rgba(255,255,255,0.05)" : "rgba(16,185,129,0.1)", 
                        color: (activity.minutesSpentToday || 0) >= (activity.plannedMinutesPerSession || 0) ? "#475569" : "#10B981", 
                        border: "none", 
                        borderRadius: 6, 
                        cursor: (activity.minutesSpentToday || 0) >= (activity.plannedMinutesPerSession || 0) ? "default" : "pointer" 
                      }}
                    >
                      +15 min
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}