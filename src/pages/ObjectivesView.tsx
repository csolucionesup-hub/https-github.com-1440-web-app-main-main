import React from "react";

export default function ObjectivesView() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0B1220",
        color: "#F8FAFC",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 14,
              color: "#94A3B8",
              marginBottom: 8,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Objetivos
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 34,
              lineHeight: 1.1,
              fontWeight: 800,
            }}
          >
            Gestión de objetivos
          </h1>

          <p
            style={{
              marginTop: 12,
              maxWidth: 760,
              fontSize: 16,
              lineHeight: 1.6,
              color: "#CBD5E1",
            }}
          >
            Aquí podrás ver los objetivos que convierten tus proyectos en avances
            medibles dentro de tus metas.
          </p>
        </div>

        <div
          style={{
            borderRadius: 18,
            padding: 24,
            background: "#111827",
            border: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            Vista de objetivos
          </div>

          <div
            style={{
              fontSize: 14,
              color: "#94A3B8",
              lineHeight: 1.7,
            }}
          >
            Esta vista quedó preparada para no romper el enrutado. Luego la
            enriqueceremos con objetivos activos, métricas, actividades asociadas
            y progreso real.
          </div>
        </div>
      </div>
    </div>
  );
}