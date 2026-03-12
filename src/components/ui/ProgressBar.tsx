import React from "react";

interface ProgressBarProps {
  value: number;
  height?: number;
  label?: string;
  color?: string;
  background?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({
  value,
  height = 12,
  label,
  color = "linear-gradient(90deg, #4F46E5 0%, #06B6D4 100%)",
  background = "rgba(255,255,255,0.08)",
  showPercentage = true,
}: ProgressBarProps) {

  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div style={{ width: "100%" }}>

      {(label || showPercentage) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
            fontSize: 14,
            color: "#CBD5E1",
          }}
        >
          <span>{label}</span>
          {showPercentage && (
            <strong style={{ color: "#F8FAFC" }}>
              {safeValue}%
            </strong>
          )}
        </div>
      )}

      <div
        className="glow-cyan"
        style={{
          width: "100%",
          height,
          borderRadius: 999,
          background: "rgba(255,255,255,0.04)",
          overflow: "hidden",
          border: '1px solid rgba(255,255,255,0.05)'
        }}
      >
        <div
          style={{
            width: `${safeValue}%`,
            height: "100%",
            borderRadius: 999,
            background: color,
            transition: "width 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
            boxShadow: '0 0 12px rgba(14, 165, 233, 0.3)'
          }}
        />
      </div>

    </div>
  );
}
