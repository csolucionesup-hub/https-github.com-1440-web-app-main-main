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
} from "lucide-react";
import logo1440 from "../../assets/logo-1440.png.jpg";
import { useAppStore } from "../../store/useAppStore";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/goals", label: "Metas", icon: Target },
  { to: "/projects", label: "Proyectos", icon: FolderKanban },
  { to: "/objectives", label: "Objetivos", icon: Crosshair },
  { to: "/activities", label: "Actividades", icon: Activity },
  { to: "/tasks", label: "Plan de acción", icon: CheckSquare },
  { to: "/bank", label: "Banco", icon: Archive },
  { to: "/settings", label: "Configuración", icon: Settings },
];

export default function Sidebar() {
  const achievements = useAppStore((state) => state.achievements);

  return (
    <aside
      style={{
        background: "#0F172A",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "18px 12px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: 20,
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
          marginBottom: 8,
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
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: "100%",
          alignItems: "center",
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
                width: 56,
                height: 56,
                borderRadius: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isActive ? "#FFFFFF" : "#94A3B8",
                background: isActive
                  ? "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)"
                  : "transparent",
                border: isActive
                  ? "1px solid rgba(255,255,255,0.08)"
                  : "1px solid transparent",
                boxShadow: isActive
                  ? "0 10px 24px rgba(79,70,229,0.24)"
                  : "none",
                transition: "all 0.25s ease",
                textDecoration: "none",
              })}
            >
              <Icon size={22} strokeWidth={2.2} />
            </NavLink>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 14,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94A3B8",
          fontSize: 12,
          fontWeight: 700,
        }}
        title="Tu vida en minutos"
      >
        M
      </div>
    </aside>
  );
}