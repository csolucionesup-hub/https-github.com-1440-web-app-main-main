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
        background: "linear-gradient(180deg, #111827 0%, #0F172A 100%)",
        border: `1px solid ${styles.glow}`,
        boxShadow: `0 12px 30px ${styles.glow}`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: styles.accent,
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "#94A3B8",
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </div>

        <div
          style={{
            fontSize: 34,
            fontWeight: 700,
            color: "#F8FAFC",
            lineHeight: 1,
          }}
        >
          {value}
        </div>

        {hint && (
          <div
            style={{
              fontSize: 13,
              color: "#CBD5E1",
            }}
          >
            {hint}
          </div>
        )}
      </div>
    </Card>
  );
}
