import React from "react";
import Card from "./Card";

interface WeeklyPoint {
  day: string;
  planned: number;
  executed: number;
}

interface WeeklyTrendChartProps {
  data?: WeeklyPoint[];
}

const defaultData: WeeklyPoint[] = [
  { day: "Lun", planned: 240, executed: 180 },
  { day: "Mar", planned: 180, executed: 120 },
  { day: "Mié", planned: 210, executed: 160 },
  { day: "Jue", planned: 150, executed: 110 },
  { day: "Vie", planned: 240, executed: 190 },
  { day: "Sáb", planned: 120, executed: 80 },
  { day: "Dom", planned: 90, executed: 40 },
];

export default function WeeklyTrendChart({
  data = defaultData,
}: WeeklyTrendChartProps) {
  const maxValue = Math.max(
    ...data.flatMap((item) => [item.planned, item.executed]),
    1
  );

  return (
    <Card
      title="Tendencia semanal"
      subtitle="Compara lo planificado con lo ejecutado durante la semana"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 14,
          alignItems: "end",
          minHeight: 240,
        }}
      >
        {data.map((item) => {
          const plannedHeight = Math.max(12, (item.planned / maxValue) * 180);
          const executedHeight = Math.max(8, (item.executed / maxValue) * 180);

          return (
            <div
              key={item.day}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  height: 190,
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 6,
                }}
              >
                <div
                  title={`${item.day} · Planificado: ${item.planned} min`}
                  style={{
                    width: 14,
                    height: plannedHeight,
                    borderRadius: 999,
                    background: "rgba(79,70,229,0.35)",
                    border: "1px solid rgba(79,70,229,0.45)",
                  }}
                />

                <div
                  title={`${item.day} · Ejecutado: ${item.executed} min`}
                  style={{
                    width: 14,
                    height: executedHeight,
                    borderRadius: 999,
                    background: "linear-gradient(180deg, #06B6D4 0%, #10B981 100%)",
                    boxShadow: "0 10px 18px rgba(16,185,129,0.20)",
                  }}
                />
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: "#CBD5E1",
                  fontWeight: 600,
                }}
              >
                {item.day}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          display: "flex",
          gap: 18,
          flexWrap: "wrap",
          marginTop: 18,
          fontSize: 13,
          color: "#CBD5E1",
        }}
      >
        <Legend label="Planificado" color="rgba(79,70,229,0.55)" />
        <Legend label="Ejecutado" color="#10B981" />
      </div>
    </Card>
  );
}

function Legend({ label, color }: { label: string; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <span
        style={{
          width: 12,
          height: 12,
          borderRadius: 999,
          background: color,
          display: "inline-block",
        }}
      />
      <span>{label}</span>
    </div>
  );
}
