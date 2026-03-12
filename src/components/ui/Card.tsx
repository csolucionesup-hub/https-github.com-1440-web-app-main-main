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
      className="glass-card premium-border"
      style={{
        borderRadius: 24,
        padding: 24,
        marginBottom: 16,
        ...style
      }}
    >
      {(title || subtitle) && (
        <div style={{ marginBottom: 18 }}>
          {title && (
            <div
              className="text-white font-semibold"
              style={{
                fontSize: 20,
              }}
            >
              {title}
            </div>
          )}

          {subtitle && (
            <div
              className="text-slate-400"
              style={{
                fontSize: 14,
                marginTop: 4
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
