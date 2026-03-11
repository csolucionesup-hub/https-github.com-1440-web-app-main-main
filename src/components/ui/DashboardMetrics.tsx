import React from "react";
import MetricCard from "./MetricCard";

interface DashboardMetricsProps {
  freeMinutes: number;
  plannedMinutes: number;
  executedMinutes: number;
  alignmentPercent: number;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;

  if (rest === 0) return `${hours} h`;

  return `${hours} h ${rest} min`;
}

export default function DashboardMetrics({
  freeMinutes,
  plannedMinutes,
  executedMinutes,
  alignmentPercent,
}: DashboardMetricsProps) {
  const executionPercent =
    plannedMinutes > 0
      ? Math.min(100, Math.round((executedMinutes / plannedMinutes) * 100))
      : 0;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        marginBottom: 24,
      }}
    >
      <MetricCard
        label="Minutos libres hoy"
        value={formatMinutes(freeMinutes)}
        hint="Tiempo realmente disponible después de sueño y rutina fija"
        tone="primary"
      />

      <MetricCard
        label="Minutos planificados"
        value={formatMinutes(plannedMinutes)}
        hint="Tiempo reservado hoy para actividades alineadas a tus metas"
        tone="secondary"
      />

      <MetricCard
        label="Minutos ejecutados"
        value={formatMinutes(executedMinutes)}
        hint={`Has ejecutado ${executionPercent}% de lo planificado`}
        tone="success"
      />

      <MetricCard
        label="Alineación con metas"
        value={`${alignmentPercent}%`}
        hint="Porcentaje de tus minutos libres dirigidos a tus metas activas"
        tone="warning"
      />
    </div>
  );
}
