import React, { useState, useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { Goal, Objective, Project, Task, Activity } from "../types";
import { 
  Target, 
  Flag, 
  Layers, 
  CheckSquare, 
  Zap,
  ChevronRight,
  Clock
} from "lucide-react";

export default function HierarchicalView() {
  const store = useAppStore();
  
  // Selection State
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [selectedProjId, setSelectedProjId] = useState<string>("");
  const [selectedObjId, setSelectedObjId] = useState<string>("");

  // Filtered Data
  const goals = store.goals;
  
  const currentProjects = useMemo(() => 
    store.projects.filter(p => p.goalId === selectedGoalId),
  [store.projects, selectedGoalId]);

  const currentObjectives = useMemo(() => 
    store.objectives.filter(o => o.projectId === selectedProjId),
  [store.objectives, selectedProjId]);

  const currentActivities = useMemo(() => 
    store.activities.filter(a => a.objectiveId === selectedObjId),
  [store.activities, selectedObjId]);

  // UI Helpers
  const selectedGoal = goals.find(g => g.id === selectedGoalId);
  const selectedProj = currentProjects.find(p => p.id === selectedProjId);
  const selectedObj = currentObjectives.find(o => o.id === selectedObjId);

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "white", padding: 24 }}>
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Explorador Táctico</h1>
        <p style={{ color: "#94a3b8" }}>Navega desde tu visión hasta la ejecución diaria</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>
        {/* Sidebar: Navigation Hierarchy */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 1. Meta Selector */}
          <div style={cardStyle}>
            <label style={labelStyle}><Target size={16} /> Meta</label>
            <select 
              value={selectedGoalId} 
              onChange={(e) => {
                setSelectedGoalId(e.target.value);
                setSelectedProjId("");
                setSelectedObjId("");
              }}
              style={selectStyle}
            >
              <option value="">Selecciona una Meta</option>
              {goals.map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>

          {/* 2. Project Selector */}
          {selectedGoalId && (
            <div style={cardStyle}>
              <label style={labelStyle}><Layers size={16} /> Proyecto</label>
              <select 
                value={selectedProjId} 
                onChange={(e) => {
                  setSelectedProjId(e.target.value);
                  setSelectedObjId("");
                }}
                style={selectStyle}
              >
                <option value="">Selecciona Proyecto</option>
                {currentProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Objective Selector */}
          {selectedProjId && (
            <div style={cardStyle}>
              <label style={labelStyle}><Flag size={16} /> Objetivo</label>
              <select 
                value={selectedObjId} 
                onChange={(e) => setSelectedObjId(e.target.value)}
                style={selectStyle}
              >
                <option value="">Selecciona Objetivo</option>
                {currentObjectives.map(o => (
                  <option key={o.id} value={o.id}>{o.title}</option>
                ))}
              </select>
            </div>
          )}
        </aside>

        {/* Main Content: Activities & Tasks */}
        <main>
          {!selectedObjId ? (
            <div style={emptyStateStyle}>
              <ChevronRight size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <p>Selecciona Meta, Proyecto y Objetivo para ver tus Actividades y Tareas</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: 16 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>
                  <Flag style={{ verticalAlign: 'middle', marginRight: 10, color: '#6366f1' }} />
                  Objetivo: {selectedObj?.title}
                </h2>
              </div>

              {currentActivities.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, background: '#0f172a', borderRadius: 12 }}>
                  <p style={{ color: '#94a3b8' }}>No hay actividades en este objetivo todavía.</p>
                </div>
              ) : (
                currentActivities.map(activity => (
                  <ActivityDetailItem key={activity.id} activity={activity} />
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ActivityDetailItem({ activity }: { activity: Activity }) {
  const actionPlans = useAppStore(s => s.actionPlans.filter(t => t.activityId === activity.id));
  
  return (
    <div style={{ background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b', overflow: 'hidden' }}>
      <div style={{ padding: 16, borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{activity.title}</h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>Sesión: {activity.plannedMinutesPerSession} min</span>
        </div>
        <div style={{ fontSize: 12, background: '#1e293b', padding: '4px 8px', borderRadius: 6, color: '#94a3b8' }}>
          {actionPlans.length} Tareas vinculadas
        </div>
      </div>
      
      <div style={{ padding: '8px 16px' }}>
        {actionPlans.length === 0 ? (
           <p style={{ fontSize: 12, color: '#475569', padding: '8px 0' }}>Sin tareas aún.</p>
        ) : (
          actionPlans.map(task => (
            <div 
              key={task.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12, 
                padding: '10px 0', 
                borderBottom: '1px solid #1e293b',
              }}
            >
              <CheckSquare size={14} color="#6366f1" />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{task.title}</div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>{task.status}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Styles
const cardStyle: React.CSSProperties = {
  background: '#0f172a',
  padding: 16,
  borderRadius: 12,
  border: '1px solid #1e293b',
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: '#6366f1',
  textTransform: 'uppercase',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  marginBottom: 8
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  background: '#020617',
  color: 'white',
  border: '1px solid #334155',
  padding: '8px 12px',
  borderRadius: 8,
  outline: 'none'
};

const emptyStateStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: 40,
  color: '#475569',
  textAlign: 'center',
  background: '#0f172a',
  borderRadius: 12,
  border: '2px dashed #1e293b'
};