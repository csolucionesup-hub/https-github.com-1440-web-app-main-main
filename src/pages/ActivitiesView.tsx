import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import Card from "../components/ui/Card";
import { useShallow } from "zustand/react/shallow";
import MotivationalQuote from "../components/ui/MotivationalQuote";

export default function ActivitiesView() {
  const activities = useAppStore(state => state.activities);
  const objectives = useAppStore(state => state.objectives);
  const goals = useAppStore(state => state.goals);
  const projects = useAppStore(state => state.projects);
  const addActivity = useAppStore(state => state.addActivity);
  const removeActivity = useAppStore(state => state.removeActivity);
  const logActivityExecution = useAppStore(state => state.logActivityExecution);
  const userSettings = useAppStore(state => state.userSettings);
  
  const { sleepMinutes, routineMinutes } = userSettings;
  const { plannedMinutes } = useAppStore(useShallow((state) => state.getDailyMetrics()));
  
  const [newTitle, setNewTitle] = useState("");
  const [newMinutes, setNewMinutes] = useState(30);
  const [goalId, setGoalId] = useState("");
  const [objectiveId, setObjectiveId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [filterGoalId, setFilterGoalId] = useState("");
  const [filterObjectiveId, setFilterObjectiveId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const activeGoals = React.useMemo(() => goals.filter(g => g.status === 'active' || g.status === 'pending'), [goals]);
  
  const activeObjectivesForGoal = React.useMemo(() => {
    if (!goalId) return [];
    return objectives.filter(o => o.goalId === goalId && (o.status === 'active' || o.status === 'in_progress' || o.status === 'pending'));
  }, [objectives, goalId]);

  const activeProjectsForObjective = React.useMemo(() => {
    if (!objectiveId) return [];
    return projects.filter(p => p.objectiveId === objectiveId && (p.status === 'active' || p.status === 'in_progress' || p.status === 'pending'));
  }, [projects, objectiveId]);

  // Default selection logic
  React.useEffect(() => {
    if (activeGoals.length > 0 && !goalId) {
      setGoalId(activeGoals[0].id);
    }
  }, [activeGoals, goalId]);

  React.useEffect(() => {
    if (activeObjectivesForGoal.length > 0 && (!objectiveId || !activeObjectivesForGoal.find(o => o.id === objectiveId))) {
      setObjectiveId(activeObjectivesForGoal[0].id);
      setProjectId("");
    }
  }, [activeObjectivesForGoal, objectiveId]);

  React.useEffect(() => {
    if (activeProjectsForObjective.length > 0 && (!projectId || !activeProjectsForObjective.find(p => p.id === projectId))) {
      // We don't force select a project, as it's optional
    }
  }, [activeProjectsForObjective, projectId]);

  const availableForMetas = 1440 - sleepMinutes - routineMinutes;
  const remainingMinutes = availableForMetas - plannedMinutes;
  
  const activeActivities = React.useMemo(
    () => activities.filter(a => a.status === 'active' || a.status === 'in_progress'),
    [activities]
  );

  const handleAdd = async () => {
    setError(null);
    if (!newTitle) {
      setError("El título es obligatorio");
      return;
    }
    if (!objectiveId) {
      setError("Debes vincular esta actividad a un objetivo estratégico");
      return;
    }
    
    const success = await addActivity({
      title: newTitle,
      plannedMinutesPerSession: newMinutes,
      objectiveId: objectiveId, 
      projectId: projectId || undefined,
      period: 'daily',
    });

    if (success) {
      setNewTitle("");
      setNewMinutes(30);
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
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      color: "white",
                      outline: "none",
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>1. Meta Fundamental</label>
                  <select
                    value={goalId}
                    onChange={(e) => {
                      setGoalId(e.target.value);
                      setObjectiveId("");
                    }}
                    style={{
                      width: "100%",
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      color: "white",
                      outline: "none",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      backgroundSize: "16px",
                      cursor: "pointer"
                    }}
                  >
                    <option value="">Selecciona meta...</option>
                    {activeGoals.map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>2. Objetivo Táctico</label>
                  <select
                    value={objectiveId}
                    onChange={(e) => setObjectiveId(e.target.value)}
                    disabled={!goalId}
                    style={{
                      width: "100%",
                      background: goalId ? "rgba(15, 23, 42, 0.6)" : "rgba(15, 23, 42, 0.3)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      color: goalId ? "white" : "#475569",
                      outline: "none",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      backgroundSize: "16px",
                      cursor: goalId ? "pointer" : "not-allowed"
                    }}
                  >
                    <option value="">Selecciona objetivo...</option>
                    {activeObjectivesForGoal.map(obj => (
                      <option key={obj.id} value={obj.id}>{obj.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>3. Proyecto (Opcional)</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    disabled={!objectiveId}
                    style={{
                      width: "100%",
                      background: objectiveId ? "rgba(15, 23, 42, 0.6)" : "rgba(15, 23, 42, 0.3)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: "12px 14px",
                      color: objectiveId ? "white" : "#475569",
                      outline: "none",
                      appearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 12px center",
                      backgroundSize: "16px",
                      cursor: objectiveId ? "pointer" : "not-allowed"
                    }}
                  >
                    <option value="">Ningún proyecto (General)</option>
                    {activeProjectsForObjective.map(proj => (
                      <option key={proj.id} value={proj.id}>{proj.title}</option>
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
                      background: "rgba(15, 23, 42, 0.6)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: "12px 14px",
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

          {/* Sección de Lista y Filtros */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Barra de Filtros */}
            <div style={{ 
              display: "flex", 
              gap: 16, 
              padding: "16px 20px", 
              background: "rgba(255,255,255,0.03)", 
              borderRadius: 16, 
              border: "1px solid rgba(255,255,255,0.06)",
              alignItems: "center"
            }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8" }}>Filtrar por:</div>
              <select
                value={filterGoalId}
                onChange={(e) => {
                  setFilterGoalId(e.target.value);
                  setFilterObjectiveId("");
                }}
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  color: "white",
                  fontSize: 13,
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="">Todas las Metas</option>
                {activeGoals.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>

              <select
                value={filterObjectiveId}
                onChange={(e) => setFilterObjectiveId(e.target.value)}
                disabled={!filterGoalId}
                style={{
                  background: filterGoalId ? "rgba(15, 23, 42, 0.6)" : "rgba(15, 23, 42, 0.2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  padding: "6px 12px",
                  color: filterGoalId ? "white" : "#475569",
                  fontSize: 13,
                  outline: "none",
                  cursor: filterGoalId ? "pointer" : "not-allowed"
                }}
              >
                <option value="">Todos los Objetivos</option>
                {objectives.filter(o => o.goalId === filterGoalId).map(obj => (
                  <option key={obj.id} value={obj.id}>{obj.title}</option>
                ))}
              </select>

              {(filterGoalId || filterObjectiveId) && (
                <button 
                  onClick={() => { setFilterGoalId(""); setFilterObjectiveId(""); }}
                  style={{ border: "none", background: "none", color: "#6366F1", fontSize: 13, cursor: "pointer", fontWeight: 600 }}
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Lista de Actividades Jerárquica */}
            <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
              {activeActivities.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "#64748B", background: "rgba(255,255,255,0.02)", borderRadius: 18, border: "1px dashed rgba(255,255,255,0.1)" }}>
                  No hay actividades planificadas para hoy.
                </div>
              ) : (
                activeGoals
                  .filter(g => !filterGoalId || g.id === filterGoalId)
                  .map(goal => {
                    const goalObjectives = objectives.filter(o => 
                      o.goalId === goal.id && 
                      (o.status === 'active' || o.status === 'in_progress') &&
                      (!filterObjectiveId || o.id === filterObjectiveId)
                    );
                    const goalActs = activeActivities.filter(a => goalObjectives.find(o => o.id === a.objectiveId));
                    
                    if (goalActs.length === 0) return null;

                    return (
                      <div key={goal.id} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          <div style={{ width: 12, height: 12, borderRadius: 3, background: goal.color || "#4F46E5" }} />
                          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "white" }}>{goal.title}</h2>
                        </div>

                        <div style={{ paddingLeft: 16, display: "flex", flexDirection: "column", gap: 20 }}>
                          {goalObjectives.map(obj => {
                            const objProjects = projects.filter(p => p.objectiveId === obj.id && (p.status === 'active' || p.status === 'in_progress' || p.status === 'pending'));
                            const objActs = activeActivities.filter(a => a.objectiveId === obj.id);

                            if (objActs.length === 0) return null;

                            return (
                              <div key={obj.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ fontSize: 11, fontWeight: 800, color: "#4F46E5", textTransform: "uppercase", letterSpacing: "0.05em", background: "rgba(79,70,229,0.1)", padding: "2px 6px", borderRadius: 4 }}>Objetivo</div>
                                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "#CBD5E1" }}>{obj.title}</h3>
                                </div>

                                <div style={{ paddingLeft: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                                  {/* Proyectos within Objective */}
                                  {objProjects.map(proj => {
                                    const projActs = objActs.filter(a => a.projectId === proj.id);
                                    if (projActs.length === 0) return null;

                                    return (
                                      <div key={proj.id} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, padding: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                          <div style={{ fontSize: 10, fontWeight: 800, color: "#10B981", textTransform: "uppercase", background: "rgba(16,185,129,0.1)", padding: "2px 6px", borderRadius: 4 }}>Proyecto</div>
                                          <div style={{ fontSize: 14, fontWeight: 600, color: "#94A3B8" }}>{proj.title}</div>
                                        </div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                          {projActs.map(activity => (
                                            <ActivityItem key={activity.id} activity={activity} onLog={handleLogExecution} onDelete={removeActivity} />
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {/* Activities directly under Objective (no project) */}
                                  {objActs.filter(a => !a.projectId).length > 0 && (
                                    <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 16, padding: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                                        <div style={{ fontSize: 10, fontWeight: 800, color: "#6366F1", textTransform: "uppercase", background: "rgba(99,102,241,0.1)", padding: "2px 6px", borderRadius: 4 }}>General</div>
                                      </div>
                                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                        {objActs.filter(a => !a.projectId).map(activity => (
                                          <ActivityItem key={activity.id} activity={activity} onLog={handleLogExecution} onDelete={removeActivity} />
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
           </div>
      </div>
    </div>
  );
}

function ActivityItem({ activity, onLog, onDelete }: { activity: any, onLog: (id: string, mins: number) => void, onDelete: (id: string) => void }) {
  const handleDelete = () => {
    console.log("ActivityItem: Clicked delete for activity:", activity.id);
    if (confirm(`¿Estás seguro de que quieres eliminar la actividad "${activity.title}"?`)) {
      console.log("ActivityItem: Confirmed deletion for activity:", activity.id);
      onDelete(activity.id);
    } else {
      console.log("ActivityItem: Deletion cancelled by user");
    }
  };

  return (
    <div 
      style={{
        background: "#111827",
        borderRadius: 14,
        padding: "14px 18px",
        border: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative"
      }}
    >
      <div style={{ flex: 1 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{activity.title}</h3>
        <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>
          {activity.minutesSpentToday || 0} / {activity.plannedMinutesPerSession} min ejecutados
        </div>
        <div style={{ width: 100, height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
          <div 
            style={{ 
              width: `${Math.min(100, ((activity.minutesSpentToday || 0) / (activity.plannedMinutesPerSession || 1)) * 100)}%`, 
              height: "100%", 
              background: "#10B981" 
            }} 
          />
        </div>
      </div>
      
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button 
          onClick={() => onLog(activity.id, 15)}
          disabled={(activity.minutesSpentToday || 0) >= (activity.plannedMinutesPerSession || 0)}
          style={{ 
            padding: "5px 12px", 
            fontSize: 11, 
            background: (activity.minutesSpentToday || 0) >= (activity.plannedMinutesPerSession || 0) ? "rgba(255,255,255,0.03)" : "rgba(16,185,129,0.1)", 
            color: (activity.minutesSpentToday || 0) >= (activity.plannedMinutesPerSession || 0) ? "#475569" : "#10B981", 
            border: "none", 
            borderRadius: 6, 
            fontWeight: 700,
            cursor: (activity.minutesSpentToday || 0) >= (activity.plannedMinutesPerSession || 0) ? "default" : "pointer" 
          }}
        >
          +15m
        </button>
        
        <button
          onClick={handleDelete}
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            color: "#EF4444",
            border: "none",
            borderRadius: 6,
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          title="Eliminar actividad"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  );
}