import React from "react";
import Card from "../components/ui/Card";
import DashboardMetrics from "../components/ui/DashboardMetrics";
import ProgressBar from "../components/ui/ProgressBar";
import MinutesGrid from "../components/ui/MinutesGrid";
import WeeklyTrendChart from "../components/ui/WeeklyTrendChart";
import MotivationalQuote from "../components/ui/MotivationalQuote";
import { useAppStore } from "../store/useAppStore";
import { useShallow } from "zustand/react/shallow";
import { Star, Award, Trophy } from "lucide-react";

export default function Daily1440View() {
  const { userSettings } = useAppStore();
  const { sleepMinutes, routineMinutes } = userSettings;
  const { freeMinutes, plannedMinutes, executedMinutes, alignmentPercent } = useAppStore(
    useShallow((state) => state.getDailyMetrics())
  );

  const achievements = useAppStore((state) => state.achievements);
  const { stars, medals, trophies } = achievements;

  const dailyProgress = plannedMinutes > 0 
    ? Math.round((executedMinutes / plannedMinutes) * 100) 
    : 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: 32,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: 40 }}>
          <div
            className="text-slate-400 font-medium tracking-widest uppercase"
            style={{
              fontSize: 12,
              marginBottom: 12,
            }}
          >
            1440 minutos de tu vida
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 40 }}>
            <h1
              className="text-gradient"
              style={{
                margin: 0,
                fontSize: 48,
                lineHeight: 1.1,
                fontWeight: 800,
                maxWidth: '800px'
              }}
            >
              Administra tus minutos para construir tus metas
            </h1>

            {/* Achievement Summary */}
            <div style={{ display: 'flex', gap: 16 }}>
              <StatIcon icon={<Star size={20} fill="#EAB308" color="#EAB308" />} label="Estrellas" value={stars} />
              <StatIcon icon={<Award size={20} fill="#06B6D4" color="#06B6D4" />} label="Medallas" value={medals} />
              <StatIcon icon={<Trophy size={20} fill="#A855F7" color="#A855F7" />} label="Trofeos" value={trophies} />
            </div>
          </div>

          <p
            className="text-slate-300"
            style={{
              marginTop: 20,
              maxWidth: 800,
              fontSize: 18,
              lineHeight: 1.6,
            }}
          >
            Cada día tiene 1440 minutos. Esta aplicación te ayuda a ver cuántos
            minutos estás invirtiendo realmente en las metas que quieres
            construir.
          </p>
          <div style={{ marginTop: 24 }}>
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
            gap: 20,
            marginBottom: 32,
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
                gap: 16,
              }}
            >
              <div
                className="glass-card"
                style={{
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <div className="text-slate-400 font-medium" style={{ fontSize: 13 }}>Sueño</div>
                <div className="text-white" style={{ fontSize: 28, fontWeight: 700 }}>{Math.floor(sleepMinutes / 60)} h</div>
              </div>

              <div
                className="glass-card"
                style={{
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <div className="text-slate-400 font-medium" style={{ fontSize: 13 }}>
                  Rutina fija
                </div>
                <div className="text-white" style={{ fontSize: 28, fontWeight: 700 }}>{Math.floor(routineMinutes / 60)} h</div>
              </div>

              <div
                className="glass-card"
                style={{
                  borderRadius: 16,
                  padding: 20,
                }}
              >
                <div className="text-slate-400 font-medium" style={{ fontSize: 13 }}>
                  Tiempo para metas
                </div>
                <div className="text-white" style={{ fontSize: 28, fontWeight: 700 }}>{(sleepMinutes+routineMinutes+freeMinutes+plannedMinutes >= 1440) ? Math.floor((freeMinutes + plannedMinutes) / 60) : Math.floor((1440 - sleepMinutes - routineMinutes) / 60)} h</div>
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
                className="text-slate-300"
                style={{
                  fontSize: 15,
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

        <div style={{ marginBottom: 32 }}>
          <MinutesGrid />
        </div>
        <div style={{ marginBottom: 32 }}>
          <WeeklyTrendChart />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          <Card
            title="Metas que más están creciendo"
            subtitle="Tiempo ejecutado por enfoque principal"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <ProgressBar label="Salud" value={72} color="#10B981" />
              <ProgressBar label="Negocio" value={49} color="#06B6D4" />
              <ProgressBar label="Espiritual" value={28} color="#8B5CF6" />
            </div>
          </Card>

          <Card
            title="Lectura estratégica"
            subtitle="Qué te conviene hacer con tu día"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                className="glass-card"
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: "rgba(79,70,229,0.08)",
                  border: "1px solid rgba(79,70,229,0.15)",
                  color: "#E2E8F0",
                  lineHeight: 1.6,
                  fontSize: 15,
                }}
              >
                Tus minutos ejecutados todavía están por debajo de lo planeado.
                Si mantienes este ritmo, cerrarás el día por debajo del objetivo.
              </div>

              <div
                className="glass-card"
                style={{
                  padding: 16,
                  borderRadius: 16,
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.15)",
                  color: "#E2E8F0",
                  lineHeight: 1.6,
                  fontSize: 15,
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

function StatIcon({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) {
  return (
    <div 
      className="glass-card premium-border animate-float"
      style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '12px 16px',
        borderRadius: 20,
        minWidth: 100
      }}
      title={label}
    >
      <div style={{ marginBottom: 6 }}>{icon}</div>
      <div className="text-white" style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
    </div>
  );
}
