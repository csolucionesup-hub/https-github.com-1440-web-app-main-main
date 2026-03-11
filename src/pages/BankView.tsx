import { useAppStore } from "../store/useAppStore";
import { useMemo, useState } from "react";

const statusLabel: Record<string, string> = {
  active: "Activa",
  paused: "Pausada",
  pending: "Sin empezar",
  completed: "Completada",
};

const statusColor: Record<string, string> = {
  active: "#22c55e",
  paused: "#f59e0b",
  pending: "#64748b",
  completed: "#06b6d4",
};

export default function BankView() {
  const goals = useAppStore((state) => state.goals);
  const removeGoal = useAppStore((state) => state.removeGoal);
  const toggleGoalStatus = useAppStore((state) => state.toggleGoalStatus);
  const updateGoal = useAppStore((state) => state.updateGoal);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingCategory, setEditingCategory] = useState("Negocio");

  const bankGoals = useMemo(
    () => goals.filter((goal) => goal.status !== "active"),
    [goals]
  );

  function handleDeleteGoal(id: number, title: string) {
    const confirmed = window.confirm(
      `Eliminar la meta "${title}" es irreversible.\n\n¿Deseas continuar?`
    );
    if (!confirmed) return;
    removeGoal(id);
  }

  function startEditing(goal: { id: number; title: string; category: string }) {
    setEditingId(goal.id);
    setEditingTitle(goal.title);
    setEditingCategory(goal.category);
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

  function renderGoalCard(goal: {
    id: number;
    title: string;
    category: string;
    status: "active" | "paused" | "pending" | "completed";
  }) {
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
                }}
              >
                Cancelar
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 20, fontWeight: 800 }}>{goal.title}</div>

            <div style={{ opacity: 0.8 }}>
              Categoría: {goal.category}
            </div>

            <div
              style={{
                color: statusColor[goal.status],
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              Estado: {statusLabel[goal.status]}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => toggleGoalStatus(goal.id)}
                style={{
                  background: "#06b6d4",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 8,
                  color: "white",
                  fontWeight: 700,
                }}
              >
                {goal.status === "active" ? "Pausar" : "Activar"}
              </button>

              <button
                onClick={() =>
                  startEditing({
                    id: goal.id,
                    title: goal.title,
                    category: goal.category,
                  })
                }
                style={{
                  background: "#6366f1",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: 8,
                  color: "white",
                  fontWeight: 700,
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
                }}
              >
                Eliminar
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>
        Banco de metas
      </h1>

      {bankGoals.length === 0 ? (
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: "#020617",
            border: "1px solid #1e293b",
          }}
        >
          No hay metas en el banco.
        </div>
      ) : (
        bankGoals.map(renderGoalCard)
      )}
    </div>
  );
}