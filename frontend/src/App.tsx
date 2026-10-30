import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { AnalyzePage } from './pages/AnalyzePage';
import { ReportPage } from './pages/ReportPage';
import { HistoryPage } from './pages/HistoryPage';
import { EvidenceExplorerPage } from './pages/EvidenceExplorerPage';
import { BenchmarkPage } from './pages/BenchmarkPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { GlossaryPage } from './pages/GlossaryPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <span className="text-xs font-mono text-slate-400">Loading NetEvidence AI...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const getPageTitle = (path: string) => {
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/analyze')) return 'IP Analysis';
    if (path.startsWith('/report')) return 'Explainable Classification Report';
    if (path.startsWith('/history')) return 'Analysis History';
    if (path.startsWith('/explorer')) return 'Evidence Explorer';
    if (path.startsWith('/benchmark')) return 'Model Evaluation Benchmarks';
    if (path.startsWith('/audit')) return 'Immutable Audit Trail';
    if (path.startsWith('/glossary')) return 'Help and Glossary';
    if (path.startsWith('/settings')) return 'Settings and Preferences';
    return 'NetEvidence AI';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} title={getPageTitle(location.pathname)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedLayout>
                  <Dashboard />
                </ProtectedLayout>
              }
            />
            <Route
              path="/analyze"
              element={
                <ProtectedLayout>
                  <AnalyzePage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/report/:id"
              element={
                <ProtectedLayout>
                  <ReportPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedLayout>
                  <HistoryPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/explorer"
              element={
                <ProtectedLayout>
                  <EvidenceExplorerPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/benchmark"
              element={
                <ProtectedLayout>
                  <BenchmarkPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedLayout>
                  <AuditTrailPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/glossary"
              element={
                <ProtectedLayout>
                  <GlossaryPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedLayout>
                  <SettingsPage />
                </ProtectedLayout>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
