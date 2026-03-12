import React from "react";
import Card from "./Card";

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "primary" | "secondary" | "success" | "warning";
}

const toneStyles = {
  primary: {
    accent: "#4F46E5",
    glow: "rgba(79,70,229,0.18)",
  },
  secondary: {
    accent: "#06B6D4",
    glow: "rgba(6,182,212,0.18)",
  },
  success: {
    accent: "#10B981",
    glow: "rgba(16,185,129,0.18)",
  },
  warning: {
    accent: "#F59E0B",
    glow: "rgba(245,158,11,0.18)",
  },
};

export default function MetricCard({
  label,
  value,
  hint,
  tone = "primary",
}: MetricCardProps) {
  const styles = toneStyles[tone];

  return (
    <Card
      style={{
        position: "relative",
        overflow: "hidden",
        minHeight: 140,
        background: "transparent",
        border: `1px solid ${styles.glow}`,
        boxShadow: `0 20px 40px ${styles.glow}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(to right, ${styles.accent}, transparent)`,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          className="text-slate-400 font-medium tracking-wide uppercase"
          style={{
            fontSize: 12,
          }}
        >
          {label}
        </div>

        <div
          className="text-white font-bold"
          style={{
            fontSize: 38,
            lineHeight: 1,
            letterSpacing: '-0.02em'
          }}
        >
          {value}
        </div>

        {hint && (
          <div
            className="text-slate-300"
            style={{
              fontSize: 13,
              marginTop: 4
            }}
          >
            {hint}
          </div>
        )}
      </div>
    </Card>
  );
}
