import React, { useState, useMemo } from "react";
import { useAppStore } from "../store/useAppStore";
import { Goal, Objective, Project, Task, Activity } from "../types";
import { 
  Target, 
  Flag, 
  Layers, 
  CheckSquare, 
  Zap,
  Plus,
  ChevronRight,
  ChevronDown
} from "lucide-react";

export default function HierarchicalView() {
  const store = useAppStore();
  
  // Selection State
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [selectedObjId, setSelectedObjId] = useState<string>("");
  const [selectedProjId, setSelectedProjId] = useState<string>("");

  // Filtered Data
  const goals = store.goals;
  
  const currentObjectives = useMemo(() => 
    store.objectives.filter(o => o.goalId === selectedGoalId),
  [store.objectives, selectedGoalId]);

  const currentProjects = useMemo(() => 
    store.projects.filter(p => p.objectiveId === selectedObjId),
  [store.projects, selectedObjId]);

  const currentTasks = useMemo(() => 
    store.actionPlans.filter(t => t.projectId === selectedProjId),
  [store.actionPlans, selectedProjId]);

  // UI Helpers
  const selectedGoal = goals.find(g => g.id === selectedGoalId);
  const selectedObj = currentObjectives.find(o => o.id === selectedObjId);
  const selectedProj = currentProjects.find(p => p.id === selectedProjId);

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
            <label style={labelStyle}><Target size={16} /> Meta del trimestre</label>
            <select 
              value={selectedGoalId} 
              onChange={(e) => {
                setSelectedGoalId(e.target.value);
                setSelectedObjId("");
                setSelectedProjId("");
              }}
              style={selectStyle}
            >
              <option value="">Selecciona una Meta</option>
              {goals.map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>

          {/* 2. Objective Selector */}
          {selectedGoalId && (
            <div style={cardStyle}>
              <label style={labelStyle}><Flag size={16} /> Objetivo</label>
              <select 
                value={selectedObjId} 
                onChange={(e) => {
                  setSelectedObjId(e.target.value);
                  setSelectedProjId("");
                }}
                style={selectStyle}
              >
                <option value="">Selecciona Objetivo</option>
                {currentObjectives.map(o => (
                  <option key={o.id} value={o.id}>{o.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* 3. Project Selector */}
          {selectedObjId && (
            <div style={cardStyle}>
              <label style={labelStyle}><Layers size={16} /> Proyecto</label>
              <select 
                value={selectedProjId} 
                onChange={(e) => setSelectedProjId(e.target.value)}
                style={selectStyle}
              >
                <option value="">Selecciona Proyecto</option>
                {currentProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          )}
        </aside>

        {/* Main Content: Tasks & Activities */}
        <main>
          {!selectedProjId ? (
            <div style={emptyStateStyle}>
              <ChevronRight size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
              <p>Selecciona una Meta, Objetivo y Proyecto para ver tu Plan de Acción</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: 16 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700 }}>
                  <CheckSquare style={{ verticalAlign: 'middle', marginRight: 10, color: '#6366f1' }} />
                  Plan de Acción: {selectedProj?.title}
                </h2>
              </div>

              {currentTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, background: '#0f172a', borderRadius: 12 }}>
                  <p style={{ color: '#94a3b8' }}>No hay tareas en este proyecto todavía.</p>
                </div>
              ) : (
                currentTasks.map(task => (
                  <TaskCard key={task.id} task={task} />
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function TaskCard({ task }: { task: Task }) {
  const activities = useAppStore(s => s.activities.filter(a => a.taskId === task.id));
  
  return (
    <div style={{ background: '#0f172a', borderRadius: 12, border: '1px solid #1e293b', overflow: 'hidden' }}>
      <div style={{ padding: 16, borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{task.title}</h3>
          <span style={{ fontSize: 12, color: '#64748b' }}>Frecuencia: {task.period}</span>
        </div>
        <div style={{ fontSize: 12, background: '#1e293b', padding: '4px 8px', borderRadius: 6, color: '#94a3b8' }}>
          {activities.length} Actividades
        </div>
      </div>
      
      <div style={{ padding: '8px 16px' }}>
        {activities.map(act => (
          <div 
            key={act.id} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              padding: '10px 0', 
              borderBottom: '1px solid #1e1b4b',
              lastChild: { borderBottom: 'none' }
            } as any}
          >
            <Zap size={14} color="#06b6d4" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{act.title}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>
                {act.minutesSpentToday || 0} / {act.plannedMinutesPerSession} min
              </div>
            </div>
            <div style={{ 
              width: 80, 
              height: 4, 
              background: '#1e293b', 
              borderRadius: 2, 
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute', 
                left: 0, 
                top: 0, 
                bottom: 0, 
                width: `${Math.min(100, ((act.minutesSpentToday || 0) / (act.plannedMinutesPerSession || 1)) * 100)}%`,
                background: '#06b6d4'
              }} />
            </div>
          </div>
        ))}
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