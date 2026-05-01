import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import LiveMonitor from './pages/LiveMonitor';
import DetectionLogs from './pages/DetectionLogs';
import RiskAnalysis from './pages/RiskAnalysis';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { WarehouseProvider } from './context/WarehouseContext';
import { ToastProvider } from './components/ToastNotification';
import './index.css';

function App() {
  return (
    <ToastProvider>
      <WarehouseProvider>
        <Router>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<LiveMonitor />} />
              <Route path="logs" element={<DetectionLogs />} />
              <Route path="analysis" element={<RiskAnalysis />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </WarehouseProvider>
    </ToastProvider>
  );
}

export default App;
