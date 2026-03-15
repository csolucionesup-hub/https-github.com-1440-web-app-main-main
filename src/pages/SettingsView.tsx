import React, { useState } from "react";
import { useAppStore } from "../store/useAppStore";
import Card from "../components/ui/Card";
import { Plus, Trash2, Clock, Edit2 } from "lucide-react";

export default function SettingsView() {
  const { userSettings, updateSettings } = useAppStore();
  const [sleepHours, setSleepHours] = useState(userSettings.sleepMinutes / 60);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSave = () => {
    setMessage(null);
    
    const sleepMinutes = Math.round(sleepHours * 60);

    const result = updateSettings({ sleepMinutes });

    if (result.success) {
      setMessage({ type: 'success', text: "Configuración guardada correctamente." });
    } else {
      setMessage({ type: 'error', text: result.message || "Error al guardar." });
    }
  };

  const freeTimeMetas = 1440 - (sleepHours * 60) - userSettings.routineMinutes;

const MotivationSection = () => {
    const userQuotes = useAppStore((state) => state.userQuotes);
    const addQuote = useAppStore((state) => state.addQuote);
    const removeQuote = useAppStore((state) => state.removeQuote);
    const [newQuoteText, setNewQuoteText] = useState("");

    const handleAdd = () => {
      if (!newQuoteText.trim()) return;
      addQuote(newQuoteText.trim());
      setNewQuoteText("");
    };

    return (
      <Card title="Motivación Personal" subtitle="Gestiona tus frases inspiradoras">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>Nueva Frase</label>
            <div style={{ display: "flex", gap: 10 }}>
              <input 
                type="text"
                value={newQuoteText}
                onChange={(e) => setNewQuoteText(e.target.value)}
                placeholder="Ej: Solo un minuto más..."
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "white",
                  outline: "none"
                }}
              />
              <button 
                onClick={handleAdd}
                style={{
                  padding: "0 20px",
                  background: "#4F46E5",
                  border: "none",
                  borderRadius: 10,
                  color: "white",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Añadir
              </button>
            </div>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label style={{ display: "block", fontSize: 13, color: "#94A3B8" }}>Tus Frases ({userQuotes.length}/10)</label>
            {userQuotes.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "#64748B", background: "rgba(255,255,255,0.01)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.05)" }}>
                No has añadido frases personales aún.
              </div>
            ) : (
              userQuotes.map((q) => (
                <div 
                  key={q.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.02)",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  <span style={{ fontSize: 14 }}>{q.text}</span>
                  <button 
                    onClick={() => removeQuote(q.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#EF4444",
                      fontSize: 18,
                      cursor: "pointer",
                      padding: "4px 8px"
                    }}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{ marginTop: 10 }}>
            <label style={{ display: "block", fontSize: 12, color: "#475569", marginBottom: 8 }}>Frases del Sistema (Lectura)</label>
            <p style={{ fontSize: 12, color: "#64748B", fontStyle: "italic" }}>
              Las frases del motor 1440 están siempre activas para mantener el enfoque en la filosofía del sistema.
            </p>
          </div>
        </div>
      </Card>
    );
  };

  const RoutineSection = () => {
    const { routines } = userSettings;
    const { addRoutine, updateRoutine, removeRoutine } = useAppStore();
    const [newName, setNewName] = useState("");
    const [newMinutes, setNewMinutes] = useState(30);

    const handleAdd = () => {
      if (!newName.trim()) return;
      addRoutine(newName.trim(), newMinutes);
      setNewName("");
      setNewMinutes(30);
    };

    return (
      <Card title="Desglose de Rutina Fija" subtitle="Define actividades no negociables">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 100px auto", gap: 10, alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>Nueva Rutina</label>
              <input 
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ej: Meditación morning"
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "white",
                  outline: "none"
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94A3B8", marginBottom: 6 }}>Minutos</label>
              <input 
                type="number"
                value={newMinutes}
                onChange={(e) => setNewMinutes(parseInt(e.target.value) || 0)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  color: "white",
                  outline: "none"
                }}
              />
            </div>
            <button 
              onClick={handleAdd}
              className="glass-card"
              style={{
                width: 44,
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#4F46E5",
                border: "none",
                borderRadius: 12,
                color: "white",
                cursor: "pointer"
              }}
            >
              <Plus size={20} />
            </button>
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {routines?.map((r) => (
              <div 
                key={r.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.05)"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(79,70,229,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Clock size={16} color="#818CF8" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>{r.minutes} minutos</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button 
                    onClick={() => {
                        const newMins = prompt("Nuevos minutos:", r.minutes.toString());
                        if (newMins !== null) updateRoutine(r.id, { minutes: parseInt(newMins) || 0 });
                    }}
                    style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", padding: 8 }}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => removeRoutine(r.id)}
                    style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", padding: 8 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ 
            marginTop: 10, 
            padding: 12, 
            borderRadius: 12, 
            background: "rgba(255,255,255,0.02)", 
            textAlign: "right",
            fontSize: 13,
            color: "#94A3B8"
          }}>
            Total Rutina: <strong style={{ color: "white" }}>{userSettings.routineMinutes} min</strong> ({Math.floor(userSettings.routineMinutes / 60)}h {userSettings.routineMinutes % 60}m)
          </div>
        </div>
      </Card>
    );
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
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 14, color: "#94A3B8", marginBottom: 8, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Configuración Personal
          </div>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Tu Estructura del Día</h1>
          <p style={{ marginTop: 12, fontSize: 16, color: "#CBD5E1", maxWidth: 600 }}>
            Define cómo se distribuyen los 1440 minutos de tu vida para que el motor de productividad sea preciso.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          <Card title="Parámetros Diarios" subtitle="Configura tus límites fundamentales">
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontSize: 15, fontWeight: 600 }}>Horas de Sueño</label>
                  <span style={{ color: "#4F46E5", fontWeight: 700 }}>{sleepHours} h</span>
                </div>
                <input 
                  type="range" 
                  min="4" 
                  max="12" 
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(parseFloat(e.target.value))}
                  style={{ width: "100%", cursor: "pointer" }}
                />
                <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 8 }}>
                  El tiempo que dedicas a descansar. Es la base de tu energía.
                </p>
              </div>

              <div style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <label style={{ fontSize: 15, fontWeight: 600 }}>Rutina Fija (Total)</label>
                  <span style={{ color: "#4F46E5", fontWeight: 700 }}>{userSettings.routineMinutes / 60} h ({userSettings.routineMinutes} min)</span>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ width: `${(userSettings.routineMinutes / 720) * 100}%`, height: '100%', background: '#4F46E5' }}></div>
                </div>
                <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 8 }}>
                  Tiempo dedicado a actividades no negociables. ¡Gestiónalo en detalle en la sección de abajo!
                </p>
              </div>

              <div style={{ 
                padding: 16, 
                borderRadius: 12, 
                background: "rgba(79,70,229,0.1)", 
                border: "1px solid rgba(79,70,229,0.2)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ fontSize: 13, color: "#94A3B8" }}>Tiempo disponible para metas</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC" }}>{freeTimeMetas / 60} horas ({freeTimeMetas} min)</div>
                </div>
                <div style={{ fontSize: 24 }}>🎯</div>
              </div>

              {message && (
                <div style={{ 
                  padding: 12, 
                  borderRadius: 8, 
                  background: message.type === 'success' ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                  color: message.type === 'success' ? "#10B981" : "#EF4444",
                  fontSize: 14,
                  border: `1px solid ${message.type === 'success' ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`
                }}>
                  {message.text}
                </div>
              )}

              <button
                onClick={handleSave}
                style={{
                  padding: "14px",
                  background: "#4F46E5",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 16,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                Guardar Configuración
              </button>
            </div>
          </Card>

          <RoutineSection />

          <MotivationSection />
        </div>
      </div>
    </div>
  );
}
