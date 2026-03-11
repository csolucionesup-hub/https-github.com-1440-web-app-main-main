import React from "react";
import Card from "../components/ui/Card";
import DashboardMetrics from "../components/ui/DashboardMetrics";
import ProgressBar from "../components/ui/ProgressBar";
import MinutesGrid from "../components/ui/MinutesGrid";
import WeeklyTrendChart from "../components/ui/WeeklyTrendChart";
import MotivationalQuote from "../components/ui/MotivationalQuote";
import { useAppStore } from "../store/useAppStore";
import { useShallow } from "zustand/react/shallow";

export default function Daily1440View() {
  const { userSettings } = useAppStore();
  const { sleepMinutes, routineMinutes } = userSettings;
  const { freeMinutes, plannedMinutes, executedMinutes, alignmentPercent } = useAppStore(
    useShallow((state) => state.getDailyMetrics())
  );

  const dailyProgress = plannedMinutes > 0 
    ? Math.round((executedMinutes / plannedMinutes) * 100) 
    : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(79,70,229,0.18), transparent 22%), #0B1220",
        padding: 24,
        color: "#F8FAFC",
      }}
    >
      <div
        style={{
          maxWidth: 1280,
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
            1440 minutos de tu vida
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 36,
              lineHeight: 1.1,
              fontWeight: 800,
            }}
          >
            Administra tus minutos para construir tus metas
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
            Cada día tiene 1440 minutos. Esta aplicación te ayuda a ver cuántos
            minutos estás invirtiendo realmente en las metas que quieres
            construir.
          </p>
          <div style={{ marginTop: 20 }}>
            <MotivationalQuote strategy="daily" category="time" />
          </div>
        </div>

        <DashboardMetrics
          freeMinutes={freeMinutes}
          plannedMinutes={plannedMinutes}
          executedMinutes={executedMinutes}
          alignmentPercent={alignmentPercent}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <Card
            title="Distribución del día"
            subtitle="Cómo se está usando tu tiempo hoy"
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 12,
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div style={{ color: "#94A3B8", fontSize: 13 }}>Sueño</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{Math.floor(sleepMinutes / 60)} h</div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div style={{ color: "#94A3B8", fontSize: 13 }}>
                  Rutina fija
                </div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{Math.floor(routineMinutes / 60)} h</div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 14,
                  padding: 16,
                }}
              >
                <div style={{ color: "#94A3B8", fontSize: 13 }}>
                  Tiempo para metas
                </div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{(sleepMinutes+routineMinutes+freeMinutes+plannedMinutes >= 1440) ? Math.floor((freeMinutes + plannedMinutes) / 60) : Math.floor((1440 - sleepMinutes - routineMinutes) / 60)} h</div>
              </div>
            </div>
          </Card>

          <Card
            title="Progreso del día"
            subtitle="Qué tan alineado estás con tus metas"
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              <ProgressBar label="Progreso diario" value={dailyProgress} />

              <div
                style={{
                  fontSize: 14,
                  color: "#94A3B8",
                  lineHeight: 1.6,
                }}
              >
                {dailyProgress < 100 
                  ? "Todavía tienes margen para dirigir más minutos hacia tus metas principales."
                  : "¡Excelente! Has alcanzado tu planificación para hoy."}
              </div>
            </div>
          </Card>
        </div>

        <div style={{ marginBottom: 24 }}>
          <MinutesGrid />
        </div>
        <div style={{ marginBottom: 24 }}>
  <WeeklyTrendChart />
</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          <Card
            title="Metas que más están creciendo"
            subtitle="Tiempo ejecutado por enfoque principal"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <ProgressBar label="Salud" value={72} color="#10B981" />
              <ProgressBar label="Negocio" value={49} color="#06B6D4" />
              <ProgressBar label="Espiritual" value={28} color="#8B5CF6" />
            </div>
          </Card>

          <Card
            title="Lectura estratégica"
            subtitle="Qué te conviene hacer con tu día"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "rgba(79,70,229,0.12)",
                  border: "1px solid rgba(79,70,229,0.18)",
                  color: "#E2E8F0",
                  lineHeight: 1.6,
                  fontSize: 14,
                }}
              >
                Tus minutos ejecutados todavía están por debajo de lo planeado.
                Si mantienes este ritmo, cerrarás el día por debajo del objetivo.
              </div>

              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  background: "rgba(16,185,129,0.10)",
                  border: "1px solid rgba(16,185,129,0.18)",
                  color: "#E2E8F0",
                  lineHeight: 1.6,
                  fontSize: 14,
                }}
              >
                La meta mejor atendida hoy es Salud. Te conviene reforzar
                Negocio o Espiritual para mejorar la alineación del día.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
