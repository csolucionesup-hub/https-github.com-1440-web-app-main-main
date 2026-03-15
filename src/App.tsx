import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Daily1440View from "./pages/Daily1440View";
import GoalsView from "./pages/GoalsView";
import ProjectsView from "./pages/ProjectsView";
import ObjectivesView from "./pages/ObjectivesView";
import ActivitiesView from "./pages/ActivitiesView";
import HierarchicalView from "./pages/HierarchicalView";
import TasksView from "./pages/TasksView";
import AnalyticsView from "./pages/AnalyticsView";
import BankView from "./pages/BankView";
import SettingsView from "./pages/SettingsView";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginView } from "./pages/LoginView";
import RewardNotification from "./components/ui/RewardNotification";
import { useAppStore } from "./store/useAppStore";
import { performDataCleanup } from "./utils/cleanup";

import FocusMode from "./pages/FocusMode";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--bg-color)",
      }}
    >
      <Sidebar />
      <main
        className="custom-scrollbar"
        style={{
          flex: 1,
          height: "100vh",
          overflow: "auto",
          paddingLeft: 12
        }}
      >
        {children}
      </main>
    </div>
  );
}

const AppContent = () => {
  const { user, loading } = useAuth();
  
  // Effect to perform data cleanup after hydration
  React.useEffect(() => {
    const checkHydration = setInterval(async () => {
      if (useAppStore.persist?.hasHydrated()) {
        clearInterval(checkHydration);
        console.log("🏪 Store hydrated, performing cleanup...");
        await performDataCleanup();
      }
    }, 1000);

    return () => clearInterval(checkHydration);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Daily1440View />} />
          <Route path="/focus" element={<FocusMode />} />
          <Route path="/goals" element={<GoalsView />} />
          <Route path="/projects" element={<ProjectsView />} />
          <Route path="/objectives" element={<ObjectivesView />} />
          <Route path="/tasks" element={<TasksView />} />
          <Route path="/explorer" element={<HierarchicalView />} />
          <Route path="/activities" element={<ActivitiesView />} />
          <Route path="/analytics" element={<AnalyticsView />} />
          <Route path="/bank" element={<BankView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <RewardNotification />
      </AppLayout>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
