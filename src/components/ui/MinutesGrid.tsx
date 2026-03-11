import React from "react";
import Card from "./Card";
import { useAppStore } from "../../store/useAppStore";
import { useShallow } from "zustand/react/shallow";

type MinuteBlockStatus = "free" | "planned" | "executed" | "missed" | "sleep" | "routine";

interface MinutesGridProps {
  title?: string;
  subtitle?: string;
}

const blockStyles: Record<MinuteBlockStatus, string> = {
  free: "#1E293B",
  sleep: "#1e1b4b", // Dark indigo for sleep
  routine: "#334155", // Slate for routine
  planned: "#4F46E5",
  executed: "#10B981",
  missed: "#EF4444",
};

export default function MinutesGrid({
  title = "Mapa de tus 1440 minutos",
  subtitle = "Cada bloque representa 30 minutos de tu día",
}: MinutesGridProps) {
  const { userSettings } = useAppStore();
  const { sleepMinutes, routineMinutes } = userSettings;
  const { plannedMinutes } = useAppStore(
    useShallow((state) => state.getDailyMetrics())
  );

  const totalBlocks = 48; // 48 x 30 = 1440
  const sleepBlocks = Math.ceil(sleepMinutes / 30);
  const routineBlocks = Math.ceil(routineMinutes / 30);
  const plannedBlocksTotal = Math.ceil(plannedMinutes / 30);

  const blocks: MinuteBlockStatus[] = [];

  for (let i = 0; i < totalBlocks; i++) {
    if (i < sleepBlocks) {
      blocks.push("sleep");
    } else if (i < sleepBlocks + routineBlocks) {
      blocks.push("routine");
    } else if (i < sleepBlocks + routineBlocks + plannedBlocksTotal) {
      // For now, simple distribution starting after routine
      blocks.push("planned");
    } else {
      blocks.push("free");
    }
  }

  return (
    <Card title={title} subtitle={subtitle}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {blocks.map((block, index) => (
          <div
            key={index}
            title={`${block} · bloque ${index + 1}`}
            style={{
              height: 26,
              borderRadius: 10,
              background: blockStyles[block],
              boxShadow:
                block === "executed"
                  ? "0 0 0 1px rgba(16,185,129,0.25), 0 8px 18px rgba(16,185,129,0.18)"
                  : "none",
              border:
                block === "free"
                  ? "1px solid rgba(255,255,255,0.04)"
                  : "1px solid transparent",
            }}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          fontSize: 13,
          color: "#CBD5E1",
        }}
      >
        <LegendItem label="Sueño" color={blockStyles.sleep} />
        <LegendItem label="Rutina" color={blockStyles.routine} />
        <LegendItem label="Planificado" color={blockStyles.planned} />
        <LegendItem label="Libre" color={blockStyles.free} />
      </div>
    </Card>
  );
}

function LegendItem({ label, color }: { label: string; color: string }) {
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
