import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CommandPalette } from './components/CommandPalette';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ServicesPage } from './pages/ServicesPage';
import { DependencyGraphPage } from './pages/DependencyGraphPage';
import { SubmitChangePage } from './pages/SubmitChangePage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { BlastRadiusPage } from './pages/BlastRadiusPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { MLMetricsPage } from './pages/MLMetricsPage';
import { ChangesPage } from './pages/ChangesPage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { RiskHistoryPage } from './pages/RiskHistoryPage';
import { ChangeRecommendationsPage } from './pages/ChangeRecommendationsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ApiConsolePage } from './pages/ApiConsolePage';

// API Health Check
import { mlApi } from './api/mlApi';
import { servicesApi } from './api/servicesApi';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [backendOnline, setBackendOnline] = useState(true);
  const [mlOnline, setMlOnline] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Periodically check live backend & ML health
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await servicesApi.getServices();
        setBackendOnline(true);
      } catch {
        setBackendOnline(false);
      }

      try {
        const mlRes = await mlApi.getHealth();
        setMlOnline(mlRes.status === 'OK' || mlRes.status === 'UP');
      } catch {
        setMlOnline(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Global Keyboard Shortcuts (⌘K / Ctrl+K and G then key)
  useEffect(() => {
    let lastKey = '';
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K trigger for Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
        return;
      }

      // Esc closes Command Palette
      if (e.key === 'Escape' && isCommandOpen) {
        e.preventDefault();
        setIsCommandOpen(false);
        return;
      }

      // Ignore single key shortcuts if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const now = Date.now();
      const key = e.key.toLowerCase();

      if (lastKey === 'g' && now - lastKeyTime < 800) {
        if (key === 'd') { navigate('/'); e.preventDefault(); }
        else if (key === 'r') { navigate('/risk-analysis'); e.preventDefault(); }
        else if (key === 'g' || key === 't') { navigate('/dependency-graph'); e.preventDefault(); }
        else if (key === 'b') { navigate('/blast-radius'); e.preventDefault(); }
        else if (key === 'w') { navigate('/what-if'); e.preventDefault(); }
        else if (key === 'h') { navigate('/risk-history'); e.preventDefault(); }
        else if (key === 'i') { navigate('/incidents'); e.preventDefault(); }
        else if (key === 's') { navigate('/services'); e.preventDefault(); }
        else if (key === 'm') { navigate('/evaluation'); e.preventDefault(); }
        else if (key === 'a') { navigate('/audit-logs'); e.preventDefault(); }
        lastKey = '';
      } else {
        lastKey = key;
        lastKeyTime = now;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate, isCommandOpen]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0B0F17] text-[#F5F7FA] flex font-sans antialiased">
      {/* Dark Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileToggle={() => setIsMobileOpen(!isMobileOpen)}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Right Area: Top Header + Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#0B0F17]">
        <Header
          onRefresh={handleRefresh}
          isBackendOnline={backendOnline}
          isMlOnline={mlOnline}
          onOpenCommandPalette={() => setIsCommandOpen(true)}
        />

        <main 
          className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 bg-[#0B0F17] transition-opacity duration-200" 
          key={`${location.pathname}-${refreshKey}`}
        >
          <div className="max-w-[1600px] mx-auto space-y-6">
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/changes" element={<ChangesPage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/dependency-graph" element={<DependencyGraphPage />} />
              <Route path="/submit-change" element={<SubmitChangePage />} />
              <Route path="/risk-analysis" element={<RiskAnalysisPage />} />
              <Route path="/blast-radius" element={<BlastRadiusPage />} />
              <Route path="/incidents" element={<IncidentsPage />} />
              <Route path="/ml-metrics" element={<MLMetricsPage />} />
              <Route path="/evaluation" element={<RiskAnalysisPage />} />
              <Route path="/what-if" element={<WhatIfSimulatorPage />} />
              <Route path="/risk-history" element={<RiskHistoryPage />} />
              <Route path="/recommendations" element={<ChangeRecommendationsPage />} />
              <Route path="/decision-support" element={<ChangeRecommendationsPage />} />
              <Route path="/system-health" element={<AuditLogsPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="/governance" element={<AuditLogsPage />} />
              <Route path="/settings" element={<AuditLogsPage />} />
              <Route path="/api-console" element={<ApiConsolePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
      </div>

      {/* Command Palette (⌘K) Modal */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}
