import React, { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import { Play, Pause, Square, Zap, Clock } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export default function FocusMode() {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <header style={{ marginBottom: 40 }}>
        <h1 className="text-gradient" style={{ fontSize: 48, fontWeight: 800, margin: 0 }}>
          Modo Enfoque
        </h1>
        <p className="text-slate-400" style={{ fontSize: 18, marginTop: 8 }}>
          Elimina distracciones y sumérgete en el trabajo profundo.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <Card style={{ padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div 
            className="glass-card premium-border"
            style={{ 
              width: 120, 
              height: 120, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              background: isActive ? 'rgba(14, 165, 233, 0.1)' : 'rgba(255,255,255,0.02)',
              marginBottom: 24,
              border: isActive ? '2px solid #0ea5e9' : '1px solid rgba(255,255,255,0.05)',
              boxShadow: isActive ? '0 0 40px rgba(14, 165, 233, 0.2)' : 'none'
            }}
          >
            <Zap size={48} color={isActive ? "#0ea5e9" : "#64748b"} />
          </div>

          <div 
            className="text-white font-mono"
            style={{ fontSize: 72, fontWeight: 700, marginBottom: 8 }}
          >
            {formatTime(seconds)}
          </div>
          <div className="text-slate-400 uppercase tracking-widest" style={{ fontSize: 14, marginBottom: 32 }}>
            Tiempo en sesión profunda
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            {!isActive ? (
              <button
                onClick={() => setIsActive(true)}
                className="glass-card premium-border"
                style={{
                  padding: '12px 32px',
                  borderRadius: 12,
                  background: 'rgba(14, 165, 233, 0.1)',
                  color: '#0ea5e9',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <Play size={20} fill="#0ea5e9" />
                Iniciar Enfoque
              </button>
            ) : (
              <button
                onClick={() => setIsActive(false)}
                className="glass-card premium-border"
                style={{
                  padding: '12px 32px',
                  borderRadius: 12,
                  background: 'rgba(245, 158, 11, 0.1)',
                  color: '#f59e0b',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer'
                }}
              >
                <Pause size={20} fill="#f59e0b" />
                Pausar
              </button>
            )}

            <button
               onClick={() => { setIsActive(false); setSeconds(0); }}
               className="glass-card premium-border"
               style={{
                 padding: '12px 24px',
                 borderRadius: 12,
                 color: '#ef4444',
                 fontWeight: 600,
                 display: 'flex',
                 alignItems: 'center',
                 gap: 8,
                 cursor: 'pointer'
               }}
            >
              <Square size={18} fill="#ef4444" />
              Terminar
            </button>
          </div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Card title="Seleccionar Tarea" subtitle="¿En qué vas a trabajar ahora?">
             <div className="text-slate-500" style={{ padding: '20px 0', textAlign: 'center' }}>
                Selecciona una tarea de tu Plan de Acción para vincular el tiempo automáticamente.
             </div>
          </Card>

          <Card title="Estadísticas de Enfoque">
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="glass-card" style={{ padding: 16, borderRadius: 12 }}>
                   <div className="text-slate-400" style={{ fontSize: 12 }}>Sesiones hoy</div>
                   <div className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>0</div>
                </div>
                <div className="glass-card" style={{ padding: 16, borderRadius: 12 }}>
                   <div className="text-slate-400" style={{ fontSize: 12 }}>Minutos Totales</div>
                   <div className="text-white" style={{ fontSize: 24, fontWeight: 700 }}>0</div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
