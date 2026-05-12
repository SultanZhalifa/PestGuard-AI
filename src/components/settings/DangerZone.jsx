import React from 'react';
import { useToast } from '../ToastNotification';

/**
 * DangerZone — destructive actions: clear logs, reset settings
 */
export default function DangerZone({ authToken, setLogs, onResetSuccess }) {
  const { addToast } = useToast();
  const handleClearLogs = async () => {
    if (!confirm('Are you sure?\n\nThis will permanently delete ALL detection logs from the database. This action cannot be undone.')) return;
    try {
      const res = await fetch('/api/logs', { method: 'DELETE', headers: { Authorization: `Bearer ${authToken}` } });
      const data = await res.json();
      if (res.ok) { setLogs([]); addToast(data.message || 'All logs cleared successfully.', 'success'); }
      else addToast('Error: ' + (data.detail || 'Failed to clear logs.'), 'error');
    } catch { addToast('Error: Server error. Could not clear logs.', 'error'); }
  };

  const handleResetSettings = async () => {
    if (!confirm('Reset all settings to factory defaults?\n\nCamera URL: 0\nThreshold: 50%\nNotifications: On')) return;
    try {
      const res = await fetch('/api/settings/reset', { method: 'POST', headers: { Authorization: `Bearer ${authToken}` } });
      const data = await res.json();
      if (res.ok) { onResetSuccess(); addToast(data.message || 'Settings restored to defaults.', 'success'); }
      else addToast('Error: ' + (data.detail || 'Failed to reset settings.'), 'error');
    } catch { addToast('Error: Server error. Could not reset settings.', 'error'); }
  };

  const actions = [
    { title: 'Clear Detection Logs', desc: 'Permanently delete all detection history from the database.', label: 'Clear Logs', onClick: handleClearLogs },
    { title: 'Reset All Settings', desc: 'Restore camera URL, threshold, and preferences to factory defaults.', label: 'Reset Settings', onClick: handleResetSettings },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '20px', padding: '2rem 2.5rem', border: '1px solid rgba(239,68,68,0.2)', marginTop: '2rem', boxShadow: '0 4px 6px -1px rgba(239,68,68,0.03)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'rgba(239,68,68,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#ef4444', margin: 0 }}>Danger Zone</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {actions.map((action, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: i === 0 ? '1px solid var(--border-color)' : 'none' }}>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>{action.title}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>{action.desc}</p>
            </div>
            <button
              onClick={action.onClick}
              className="danger-btn"
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
            >
              {action.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
