import React, { useState, useEffect } from 'react';
import { useWarehouse } from '../context/WarehouseContext';

export default function Settings() {
  const { authToken, darkMode, toggleDarkMode } = useWarehouse();
  
  const [cameraUrl, setCameraUrl] = useState('0');
  const [threshold, setThreshold] = useState(85);
  const [notifications, setNotifications] = useState(true);
  
  const [isSaving, setIsSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial settings from backend
  useEffect(() => {
    fetch('/api/settings', {
      headers: { 'Authorization': `Bearer ${authToken}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.cameraUrl) setCameraUrl(data.cameraUrl);
        if (data.threshold) setThreshold(data.threshold);
        if (data.notifications !== undefined) setNotifications(data.notifications);
        // darkMode is handled globally by Context
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch settings", err);
        setIsLoading(false);
      });
  }, [authToken]);

  const handleSave = async () => {
    setIsSaving(true);
    setToastMsg('');

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ cameraUrl, threshold, notifications, darkMode })
      });

      if (response.ok) {
        const data = await response.json();
        setToastMsg(data.message || 'Settings saved');
        setTimeout(() => setToastMsg(''), 4000);
      }
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out', paddingBottom: '2rem' }}>
      
      {toastMsg && (
        <div style={{ 
          position: 'fixed', bottom: '2rem', right: '2rem', 
          backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', padding: '1rem 1.5rem', 
          borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 1000,
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{toastMsg}</span>
        </div>
      )}

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Manage your system preferences and global configurations.</p>
      </div>

      <div style={{ 
        backgroundColor: 'var(--bg-secondary)', borderRadius: '20px', padding: '2.5rem', 
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 10px 15px -3px rgba(0,0,0,0.05)',
        display: 'flex', flexDirection: 'column', gap: '2.5rem'
      }}>
        
        {/* System Settings Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
              System Configuration
            </h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.75rem', paddingLeft: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Camera Source URL</label>
              <input 
                type="text" 
                value={cameraUrl}
                onChange={(e) => setCameraUrl(e.target.value)}
                style={{ 
                  width: '100%', padding: '0.875rem 1.25rem', borderRadius: '12px', 
                  border: '1px solid var(--border-color)', outline: 'none', fontSize: '0.95rem', color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-primary)', transition: 'all 0.2s ease',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                }} 
                onFocus={(e) => { e.target.style.borderColor = 'var(--text-secondary)'; e.target.style.boxShadow = '0 0 0 3px var(--bg-tertiary)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
              />
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  AI Confidence Threshold
                </label>
                <span style={{ backgroundColor: 'var(--bg-primary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                  {threshold}%
                </span>
              </div>
              <input 
                type="range" 
                min="50" max="99" 
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary)', height: '6px', borderRadius: '4px' }} 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: '500' }}>
                <span>Lenient (50%)</span>
                <span>Strict (99%)</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', width: '100%' }}></div>

        {/* Preferences Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
              Preferences
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingLeft: '1rem' }}>
            
            {/* Toggle 1 */}
            <div 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '0.5rem 0' }}
              onClick={() => setNotifications(!notifications)}
            >
              <div>
                <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Push Notifications</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Receive alerts when critical hazards are detected.</p>
              </div>
              <div 
                style={{
                  width: '50px', height: '28px', backgroundColor: notifications ? 'var(--accent-primary)' : 'var(--border-color)',
                  borderRadius: '20px', position: 'relative', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{
                  width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%',
                  position: 'absolute', top: '2px', left: notifications ? '24px' : '2px',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', 
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}></div>
              </div>
            </div>

            {/* Toggle 2 */}
            <div 
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '0.5rem 0' }}
              onClick={() => toggleDarkMode(!darkMode)}
            >
              <div>
                <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>Dark Mode</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>Enable dark theme across the entire dashboard.</p>
              </div>
              <div 
                style={{
                  width: '50px', height: '28px', backgroundColor: darkMode ? 'var(--accent-primary)' : 'var(--border-color)',
                  borderRadius: '20px', position: 'relative', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{
                  width: '24px', height: '24px', backgroundColor: 'white', borderRadius: '50%',
                  position: 'absolute', top: '2px', left: darkMode ? '24px' : '2px',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', 
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}></div>
              </div>
            </div>

          </div>
        </div>

        <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            style={{ 
              padding: '0.875rem 2.5rem', backgroundColor: 'var(--accent-primary)', color: 'var(--bg-secondary)', 
              border: 'none', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', transition: 'all 0.2s ease',
              opacity: isSaving ? 0.7 : 1, transform: isSaving ? 'scale(0.98)' : 'scale(1)'
            }}
            onMouseOver={(e) => !isSaving && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => !isSaving && (e.currentTarget.style.transform = 'translateY(0)')}
            onMouseDown={(e) => !isSaving && (e.currentTarget.style.transform = 'translateY(0) scale(0.98)')}
            onMouseUp={(e) => !isSaving && (e.currentTarget.style.transform = 'translateY(-2px) scale(1)')}
          >
            {isSaving ? (
              <span style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'currentColor', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

      </div>
      
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
