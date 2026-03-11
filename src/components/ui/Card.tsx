import React from "react";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: React.CSSProperties;
}

export default function Card({
  children,
  title,
  subtitle,
  style
}: CardProps) {
  return (
    <div
      style={{
        background: "#111827",
        borderRadius: 18,
        padding: 20,
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
        marginBottom: 16,
        ...style
      }}
    >
      {(title || subtitle) && (
        <div style={{ marginBottom: 14 }}>
          {title && (
            <div
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#F8FAFC"
              }}
            >
              {title}
            </div>
          )}

          {subtitle && (
            <div
              style={{
                fontSize: 13,
                color: "#94A3B8"
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
