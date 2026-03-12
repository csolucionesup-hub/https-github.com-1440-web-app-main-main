import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  FolderKanban,
  Crosshair,
  Activity,
  CheckSquare,
  Archive,
  Settings,
  Star,
  Award,
  Trophy,
  LogOut,
  BarChart3,
  Layers,
  Zap,
} from "lucide-react";
import logo1440 from "../../assets/logo-1440.png.jpg";
import { useAppStore } from "../../store/useAppStore";
import { authService } from "../../services/authService";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/focus", label: "Modo Enfoque", icon: Zap },
  { to: "/goals", label: "Metas", icon: Target },
  { to: "/projects", label: "Proyectos", icon: FolderKanban },
  { to: "/objectives", label: "Objetivos", icon: Crosshair },
  { to: "/activities", label: "Actividades", icon: Activity },
  { to: "/tasks", label: "Plan de Acción", icon: CheckSquare },
  { to: "/explorer", label: "Explorador Estratégico", icon: Layers },
  { to: "/analytics", label: "Estadísticas", icon: BarChart3 },
  { to: "/bank", label: "Banco", icon: Archive },
  { to: "/settings", label: "Configuración", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside
      className="glass-card premium-border"
      style={{
        background: "rgba(15, 23, 42, 0.8)",
        padding: "24px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        margin: "12px",
        borderRadius: 24,
        zIndex: 50,
        height: "calc(100vh - 24px)",
        position: "sticky",
        top: 12
      }}
    >
      <div
        className="glass-card premium-border"
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,0.3)",
          marginBottom: 12,
          background: "rgba(255,255,255,0.03)"
        }}
        title="1440 minutos de tu vida"
      >
        <img
          src={logo1440}
          alt="Logo 1440"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      <nav
        className="custom-scrollbar"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          width: "100%",
          alignItems: "center",
          overflowY: "auto",
          flex: 1,
          paddingRight: 4
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={item.label}
              style={({ isActive }) => ({
                width: 48,
                height: 48,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isActive ? "#FFFFFF" : "#64748b",
                background: isActive
                  ? "linear-gradient(135deg, #4F46E5 0%, #0ea5e9 100%)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(255,255,255,0.15)"
                  : "1px solid transparent",
                boxShadow: isActive
                  ? "0 8px 16px rgba(79,70,229,0.3)"
                  : "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                textDecoration: "none",
              })}
            >
              {({ isActive }) => (
                <Icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={() => authService.signOut()}
          title="Cerrar sesión"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "rgba(239, 68, 68, 0.08)",
            border: "1px solid rgba(239, 68, 68, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#EF4444",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <LogOut size={18} />
        </button>

        <div
          className="glass-card premium-border"
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#94A3B8",
            fontSize: 12,
            fontWeight: 700,
            background: "rgba(255,255,255,0.02)"
          }}
          title="Tu vida en minutos"
        >
          M
        </div>
      </div>
    </aside>
  );
}