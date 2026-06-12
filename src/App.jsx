import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import RequireRole from './components/common/RequireRole';
import { WarehouseProvider } from './context/WarehouseContext';
import { ToastProvider } from './components/common/ToastNotification';
import ErrorBoundary from './components/common/ErrorBoundary';

const LiveMonitor    = lazy(() => import('./pages/LiveMonitor'));
const DetectionLogs  = lazy(() => import('./pages/DetectionLogs'));
const RiskAnalysis   = lazy(() => import('./pages/RiskAnalysis'));
const Settings       = lazy(() => import('./pages/Settings'));
const Login          = lazy(() => import('./pages/Login'));
const AcceptInvite   = lazy(() => import('./pages/AcceptInvite'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const AIPerformance  = lazy(() => import('./pages/AIPerformance'));
const AskAI          = lazy(() => import('./pages/AskAI'));
const SOPMitigasi    = lazy(() => import('./pages/SOPMitigasi'));

const PageLoader = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary, #faf9f7)' }}>
    <div className="page-loader-spinner" aria-label="Loading" />
    <span style={{ color: 'var(--text-secondary, #78716c)', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em' }}>PESTGUARD AI</span>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
    <ToastProvider>
      <WarehouseProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/accept-invite" element={<AcceptInvite />} />
              <Route path="/change-password" element={<ChangePassword />} />

              {/* Protected Dashboard Routes */}
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<LiveMonitor />} />
                <Route path="logs" element={<DetectionLogs />} />
                <Route
                  path="analysis"
                  element={
                    <RequireRole roles={['admin', 'manager']}>
                      <RiskAnalysis />
                    </RequireRole>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <RequireRole roles={['admin', 'manager']}>
                      <Settings />
                    </RequireRole>
                  }
                />
                <Route
                  path="users"
                  element={
                    <RequireRole roles={['admin']}>
                      <UserManagement />
                    </RequireRole>
                  }
                />
                <Route
                  path="ai-performance"
                  element={
                    <RequireRole roles={['admin', 'manager']}>
                      <AIPerformance />
                    </RequireRole>
                  }
                />
                <Route path="ask-ai" element={<AskAI />} />
                <Route path="sop-mitigasi" element={<SOPMitigasi />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </WarehouseProvider>
    </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
