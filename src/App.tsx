import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "./components/layout/Sidebar";
import Daily1440View from "./pages/Daily1440View";
import GoalsView from "./pages/GoalsView";
import ProjectsView from "./pages/ProjectsView";
import ObjectivesView from "./pages/ObjectivesView";
import ActivitiesView from "./pages/ActivitiesView";
import HierarchicalView from "./pages/HierarchicalView";
import BankView from "./pages/BankView";
import SettingsView from "./pages/SettingsView";
import RewardNotification from "./components/ui/RewardNotification";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "88px 1fr",
        minHeight: "100vh",
        background: "#0B1220",
      }}
    >
      <Sidebar />
      <main
        style={{
          minHeight: "100vh",
          overflow: "auto",
        }}
      >
        {children}
      </main>
      <RewardNotification />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Daily1440View />} />
          <Route path="/goals" element={<GoalsView />} />
          <Route path="/projects" element={<ProjectsView />} />
          <Route path="/objectives" element={<ObjectivesView />} />
          <Route path="/activities" element={<ActivitiesView />} />
          <Route path="/tasks" element={<HierarchicalView />} />
          <Route path="/bank" element={<BankView />} />
          <Route path="/settings" element={<SettingsView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
