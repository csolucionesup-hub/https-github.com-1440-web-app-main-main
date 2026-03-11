export type AppMode = "light" | "dark";

export interface AppTheme {
  mode: AppMode;
  name: string;
  colors: {
    background: string;
    backgroundSoft: string;
    surface: string;
    surfaceElevated: string;
    border: string;
    text: string;
    textMuted: string;
    textSoft: string;
    primary: string;
    primaryHover: string;
    secondary: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    accent: string;
  };
  gradients: {
    hero: string;
    primary: string;
    success: string;
    analytics: string;
  };
  chart: {
    goal: string;
    project: string;
    objective: string;
    activity: string;
    execution: string;
    plan: string;
    free: string;
    warning: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    pill: string;
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
    glow: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
  };
}

export const darkTheme: AppTheme = {
  mode: "dark",
  name: "1440 Dark",
  colors: {
    background: "#0B1220",
    backgroundSoft: "#0F172A",
    surface: "#111827",
    surfaceElevated: "#172033",
    border: "rgba(255,255,255,0.08)",
    text: "#F8FAFC",
    textMuted: "#CBD5E1",
    textSoft: "#94A3B8",
    primary: "#4F46E5",
    primaryHover: "#6366F1",
    secondary: "#06B6D4",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#38BDF8",
    accent: "#8B5CF6",
  },
  gradients: {
    hero: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
    primary: "linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)",
    success: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
    analytics: "linear-gradient(135deg, #0F172A 0%, #172033 100%)",
  },
  chart: {
    goal: "#4F46E5",
    project: "#06B6D4",
    objective: "#10B981",
    activity: "#8B5CF6",
    execution: "#38BDF8",
    plan: "#F59E0B",
    free: "#22C55E",
    warning: "#EF4444",
  },
  radius: {
    sm: "10px",
    md: "14px",
    lg: "18px",
    xl: "24px",
    pill: "999px",
  },
  shadow: {
    sm: "0 4px 12px rgba(0,0,0,0.18)",
    md: "0 10px 30px rgba(0,0,0,0.24)",
    lg: "0 18px 48px rgba(0,0,0,0.30)",
    glow: "0 0 0 1px rgba(99,102,241,0.18), 0 12px 36px rgba(79,70,229,0.22)",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "32px",
  },
};

export const lightTheme: AppTheme = {
  mode: "light",
  name: "1440 Light",
  colors: {
    background: "#F8FAFC",
    backgroundSoft: "#F1F5F9",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",
    border: "rgba(15,23,42,0.08)",
    text: "#0F172A",
    textMuted: "#334155",
    textSoft: "#64748B",
    primary: "#4F46E5",
    primaryHover: "#6366F1",
    secondary: "#0891B2",
    success: "#10B981",
    warning: "#D97706",
    danger: "#DC2626",
    info: "#0284C7",
    accent: "#7C3AED",
  },
  gradients: {
    hero: "linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)",
    primary: "linear-gradient(135deg, #4F46E5 0%, #8B5CF6 100%)",
    success: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
    analytics: "linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 100%)",
  },
  chart: {
    goal: "#4F46E5",
    project: "#06B6D4",
    objective: "#10B981",
    activity: "#8B5CF6",
    execution: "#0EA5E9",
    plan: "#F59E0B",
    free: "#22C55E",
    warning: "#EF4444",
  },
  radius: {
    sm: "10px",
    md: "14px",
    lg: "18px",
    xl: "24px",
    pill: "999px",
  },
  shadow: {
    sm: "0 4px 10px rgba(15,23,42,0.05)",
    md: "0 10px 24px rgba(15,23,42,0.08)",
    lg: "0 18px 40px rgba(15,23,42,0.12)",
    glow: "0 0 0 1px rgba(79,70,229,0.10), 0 12px 30px rgba(79,70,229,0.14)",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    "2xl": "32px",
  },
};

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};

export const defaultTheme = darkTheme;

export function getTheme(mode: AppMode = "dark"): AppTheme {
  return themes[mode] ?? defaultTheme;
}
