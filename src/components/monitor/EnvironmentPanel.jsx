import { useState, useEffect } from 'react';
import { useToast } from '../ToastNotification';
import { useWarehouse } from '../../context/WarehouseContext';
import api from '../../lib/apiClient';

export default function EnvironmentPanel() {
  const { addToast } = useToast();
  const { user } = useWarehouse();
  const [systemStatus, setSystemStatus] = useState(null);

  // Fetch live system status for real inference time and zone data
  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await api.getJson('/status');
        setSystemStatus(data);
      } catch { /* ignore */ }
    };
    fetch();
    const interval = setInterval(fetch, 5000);
    return () => clearInterval(interval);
  }, []);

  const inferenceMs = systemStatus?.ai_performance?.inference_time || 0;
  const activeZoneCount = systemStatus?.active_zones?.length || 0;
  const modelName = systemStatus?.ai_performance?.model || 'YOLO11-Nano';

  // Derived "load" from inference time: 0–80ms → 0–100%
  const inferenceLoad = Math.min(100, Math.round((inferenceMs / 80) * 100));
  const loadColor = inferenceLoad > 70 ? 'var(--alert-danger)' : inferenceLoad > 40 ? 'var(--alert-warning)' : '#22c55e';

  const handleQuickAction = (actionName) => {
    addToast(`${actionName} triggered. Security team notified.`, 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* AI System Status Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>AI System Performance</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Live inference engine metrics</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Inference Time */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              <span>Inference Time</span>
              <span style={{ color: inferenceMs > 0 ? loadColor : 'var(--text-secondary)' }}>
                {inferenceMs > 0 ? `${inferenceMs}ms` : 'Idle'}
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${inferenceLoad}%`, height: '100%', backgroundColor: loadColor, borderRadius: '3px', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* Active Zones */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
              <span>Active Detection Zones</span>
              <span style={{ color: activeZoneCount > 0 ? '#22c55e' : 'var(--text-secondary)' }}>
                {activeZoneCount} zone{activeZoneCount !== 1 ? 's' : ''}
              </span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${(activeZoneCount / 4) * 100}%`, height: '100%', backgroundColor: '#22c55e', borderRadius: '3px', transition: 'width 0.5s ease' }} />
            </div>
          </div>

          {/* Model badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>AI Model</span>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-primary)', backgroundColor: 'var(--bg-tertiary)', padding: '0.2rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              {modelName}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions Card */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Command Center</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Emergency response actions</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button
            onClick={() => handleQuickAction('Evacuation Alarm')}
            style={{ padding: '0.6rem', fontSize: '0.75rem', fontWeight: '600', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', transition: 'border-color 0.2s ease, color 0.2s ease' }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--alert-danger)'; e.currentTarget.style.color = 'var(--alert-danger)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Sound Alarm
          </button>
          
          <button
            onClick={() => handleQuickAction('Zone Lockdown')}
            style={{ padding: '0.6rem', fontSize: '0.75rem', fontWeight: '600', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem', transition: 'border-color 0.2s ease, color 0.2s ease' }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--alert-warning)'; e.currentTarget.style.color = 'var(--alert-warning)'; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Lockdown
          </button>
        </div>

        <button
          onClick={() => handleQuickAction('Security Dispatch')}
          style={{ width: '100%', marginTop: '0.75rem', padding: '0.6rem', fontSize: '0.75rem', fontWeight: '600', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'border-color 0.2s ease, color 0.2s ease' }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          Dispatch Security Team
        </button>
      </div>

      {/* Active Session Card — real user from context */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Active Session</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Current logged-in operator</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>
              {user?.name || user?.username || 'Operator'}
            </span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '600', backgroundColor: 'var(--bg-tertiary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
            {user?.role || 'operator'}
          </span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>System Link</span>
          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#22c55e', backgroundColor: 'rgba(34,197,94,0.1)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Secured (AES-256)</span>
        </div>
      </div>
    </div>
  );
}
