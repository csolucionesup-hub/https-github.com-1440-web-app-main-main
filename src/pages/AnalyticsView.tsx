import React, { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import ProgressBar from "../components/ui/ProgressBar";
import WeeklyTrendChart from "../components/ui/WeeklyTrendChart";
import { analyticsService } from "../services/analyticsService";
import { useAuth } from "../contexts/AuthContext";
import { Activity as ActivityIcon, PieChart, TrendingUp, Zap } from "lucide-react";

interface AnalyticsData {
  weeklyTrend: any[];
  categoryDistribution: { category: string; minutes: number; color: string }[];
  efficiencyScore: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Salud: "#10B981",
  Negocio: "#4F46E5",
  Espiritual: "#8B5CF6",
  Relaciones: "#EC4899",
  Aprendizaje: "#F59E0B",
  General: "#94A3B8",
};

export default function AnalyticsView() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    weeklyTrend: [],
    categoryDistribution: [],
    efficiencyScore: 0,
  });

  useEffect(() => {
    async function loadAnalytics() {
      if (!user) return;
      try {
        const [snapshots, logs] = await Promise.all([
          analyticsService.getWeeklySnapshots(user.id),
          analyticsService.getTimeDistributionByCategory(user.id)
        ]);

        // Process Weekly Trend
        const weekly = snapshots.map((s: any) => ({
          day: new Date(s.date).toLocaleDateString('es-ES', { weekday: 'short' }),
          planned: s.total_planned || 0,
          executed: s.total_executed || 0
        }));

        // Process Category Distribution
        const distMap: Record<string, number> = {};
        logs.forEach((log: any) => {
          const cat = log.activities?.objectives?.goals?.category || "General";
          distMap[cat] = (distMap[cat] || 0) + (log.minutes || 0);
        });

        const distribution = Object.entries(distMap).map(([category, minutes]) => ({
          category,
          minutes,
          color: CATEGORY_COLORS[category] || CATEGORY_COLORS.General
        })).sort((a, b) => b.minutes - a.minutes);

        // Calculate Efficiency (Average % executed vs planned of the week)
        const totalPlanned = snapshots.reduce((acc, s) => acc + (s.total_planned || 0), 0);
        const totalExecuted = snapshots.reduce((acc, s) => acc + (s.total_executed || 0), 0);
        const score = totalPlanned > 0 ? Math.round((totalExecuted / totalPlanned) * 100) : 0;

        setData({
          weeklyTrend: weekly,
          categoryDistribution: distribution,
          efficiencyScore: score
        });
      } catch (err) {
        console.error("Error loading analytics:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#94A3B8" }}>
        Cargando insights estratégicos...
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top right, rgba(6,182,212,0.1), transparent 30%), #0B1220",
        color: "#F8FAFC",
        padding: 24,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <header style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
            Inteligencia de Tiempo
          </div>
          <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800 }}>Analytics & Insights</h1>
          <p style={{ marginTop: 12, color: "#CBD5E1", fontSize: 16, maxWidth: 800 }}>
            Visualiza cómo se materializan tus minutos en logros reales a través de tus 1440 minutos diarios.
          </p>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 24 }}>
          <StatCard 
            icon={<Zap size={20} color="#F59E0B" />} 
            label="Score de Eficiencia" 
            value={`${data.efficiencyScore}%`} 
            subtitle="Promedio semanal"
          />
          <StatCard 
            icon={<TrendingUp size={20} color="#10B981" />} 
            label="Minutos Invertidos" 
            value={data.categoryDistribution.reduce((acc, curr) => acc + curr.minutes, 0)} 
            subtitle="Total última semana"
          />
          <StatCard 
            icon={<ActivityIcon size={20} color="#6366F1" />} 
            label="Categoría Líder" 
            value={data.categoryDistribution[0]?.category || "Ninguna"} 
            subtitle="Mayor inversión de tiempo"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 24 }}>
          <WeeklyTrendChart data={data.weeklyTrend.length > 0 ? data.weeklyTrend : undefined} />

          <Card title="Distribución por Meta" subtitle="Minutos totales por categoría">
            <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 10 }}>
              {data.categoryDistribution.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "#64748B", fontSize: 14 }}>
                  No hay registros suficientes para mostrar una distribución.
                </div>
              ) : (
                data.categoryDistribution.map((item) => (
                  <div key={item.category}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 14 }}>
                      <span style={{ fontWeight: 600 }}>{item.category}</span>
                      <span style={{ color: "#94A3B8" }}>{item.minutes} min</span>
                    </div>
                    <div style={{ height: 8, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden" }}>
                      <div 
                        style={{ 
                          width: `${Math.min(100, (item.minutes / (data.categoryDistribution[0]?.minutes || 1)) * 100)}%`, 
                          height: "100%", 
                          background: item.color 
                        }} 
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle }: { icon: React.ReactNode, label: string, value: string | number, subtitle: string }) {
  return (
    <div style={{
      background: "#111827",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 20,
      padding: 24,
      display: "flex",
      flexDirection: "column",
      gap: 12
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ margin: "auto" }}>{icon}</div>
        </div>
        <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 500 }}>{label}</span>
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "#F8FAFC" }}>{value}</div>
        <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>{subtitle}</div>
      </div>
    </div>
  );
}
