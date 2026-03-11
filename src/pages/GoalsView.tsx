
import { useAppStore } from "../store/useAppStore";
import { useMemo, useState } from "react";
import { Goal } from "../types";
import MotivationalQuote from "../components/ui/MotivationalQuote";

export default function GoalsView() {
  const goals = useAppStore((state) => state.goals);
  const addGoal = useAppStore((state) => state.addGoal);
  const toggleGoalStatus = useAppStore((state) => state.toggleGoalStatus);
  const removeGoal = useAppStore((state) => state.removeGoal);
  const updateGoal = useAppStore((state) => state.updateGoal);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Negocio");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingCategory, setEditingCategory] = useState("Negocio");

  const activeGoals = useMemo(
    () => goals.filter((goal) => goal.status === "active"),
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

  function handleDeleteGoal(id: string, title: string) {
    const confirmed = window.confirm(
      `Eliminar la meta "${title}" es irreversible.\n\n¿Deseas continuar?`
    );
    if (!confirmed) return;
    removeGoal(id);
  }

  function startEditing(goal: Goal) {
    setEditingId(goal.id);
    setEditingTitle(goal.title);
    setEditingCategory(goal.category || "Negocio");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingTitle("");
    setEditingCategory("Negocio");
  }

  function saveEditing() {
    if (editingId === null) return;
    if (!editingTitle.trim()) return;

    updateGoal(editingId, {
      title: editingTitle.trim(),
      category: editingCategory,
    });

    cancelEditing();
  }

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>
        Metas activas
      </h1>
      <div style={{ marginBottom: 24 }}>
        <MotivationalQuote strategy="random" category="goals" />
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <input
          placeholder="Nombre de la meta"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            minWidth: 280,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #333",
            background: "#0f172a",
            color: "white",
          }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            background: "#0f172a",
            color: "white",
            border: "1px solid #334155",
          }}
        >
          <option>Negocio</option>
          <option>Salud</option>
          <option>Espiritual</option>
          <option>Personal</option>
        </select>

        <button
          onClick={handleAddGoal}
          style={{
            padding: "12px 18px",
            borderRadius: 10,
            background: "#06b6d4",
            border: "none",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Crear meta
        </button>
      </div>

      {activeGoals.length === 0 ? (
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: "#020617",
            border: "1px solid #1e293b",
          }}
        >
          No tienes metas activas.
        </div>
      ) : (
        activeGoals.map((goal) => {
          const isEditing = editingId === goal.id;

          return (
            <div
              key={goal.id}
              style={{
                padding: 16,
                border: "1px solid #1e293b",
                borderRadius: 12,
                marginBottom: 12,
                background: "#020617",
              }}
            >
              {isEditing ? (
                <>
                  <input
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 8,
                      border: "1px solid #334155",
                      background: "#0f172a",
                      color: "white",
                      marginBottom: 10,
                    }}
                  />

                  <select
                    value={editingCategory}
                    onChange={(e) => setEditingCategory(e.target.value)}
                    style={{
                      width: "100%",
                      padding: 10,
                      borderRadius: 8,
                      background: "#0f172a",
                      color: "white",
                      border: "1px solid #334155",
                      marginBottom: 12,
                    }}
                  >
                    <option>Negocio</option>
                    <option>Salud</option>
                    <option>Espiritual</option>
                    <option>Personal</option>
                  </select>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={saveEditing}
                      style={{
                        background: "#22c55e",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 8,
                        color: "white",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Guardar
                    </button>

                    <button
                      onClick={cancelEditing}
                      style={{
                        background: "#475569",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 8,
                        color: "white",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 20, fontWeight: 800 }}>
                    {goal.title}
                  </div>

                  <div style={{ opacity: 0.8 }}>
                    Categoría: {goal.category}
                  </div>

                  <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                    <button
                      onClick={() => toggleGoalStatus(goal.id)}
                      style={{
                        background: "#06b6d4",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 8,
                        color: "white",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      {goal.status === 'paused' ? 'Activar' : 'Pausar'}
                    </button>

                    <button
                      onClick={() => startEditing(goal)}
                      style={{
                        background: "#6366f1",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 8,
                        color: "white",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => handleDeleteGoal(goal.id, goal.title)}
                      style={{
                        background: "#ef4444",
                        border: "none",
                        padding: "8px 12px",
                        borderRadius: 8,
                        color: "white",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

