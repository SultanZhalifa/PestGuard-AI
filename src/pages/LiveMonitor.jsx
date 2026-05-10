import React, { useState, useEffect, useRef } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { useToast } from '../components/ToastNotification';
import CameraGrid from '../components/CameraGrid';
import { useT } from '../hooks/useT';

export default function LiveMonitor() {
  const { logs: allLogs, authToken } = useWarehouse();
  const { addToast } = useToast();
  const t = useT();
  const [status, setStatus] = useState("Loading...");
  const [aiData, setAiData] = useState({ speed: "Idle", model: "YOLO11" });
  const [activeZones, setActiveZones] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const prevLogCountRef = useRef(allLogs.length);
  const isCameraOnRef = useRef(false);

  const [isCameraOn, setIsCameraOn] = useState(false);

  // Toggle Zone A camera (Main Warehouse) with error feedback
  const toggleCamera = async (turnOn) => {
    try {
      const res = await fetch('/api/cameras/zone-a/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ state: turnOn })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Server error');
      }
      setIsCameraOn(turnOn);
      isCameraOnRef.current = turnOn;
    } catch (err) {
      console.error("Failed to toggle camera", err);
      addToast(turnOn ? t.liveMonitor.failedStart : t.liveMonitor.failedStop, 'danger');
    }
  };

  // Sync Zone A state from server so manual toggles in CameraGrid stay consistent
  useEffect(() => {
    if (!authToken) return;
    const syncZoneA = () => {
      fetch('/api/cameras', { headers: { 'Authorization': `Bearer ${authToken}` } })
        .then(r => r.ok ? r.json() : [])
        .then(zones => {
          const a = zones.find(z => z.id === 'zone-a');
          if (a) {
            const live = a.status === 'live';
            setIsCameraOn(live);
            isCameraOnRef.current = live;
          }
        })
        .catch(() => {});
    };
    syncZoneA();
    const interval = setInterval(syncZoneA, 4000);
    return () => clearInterval(interval);
  }, [authToken]);

  // Cleanup on unmount + beforeunload backup
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isCameraOnRef.current) {
        navigator.sendBeacon?.(
          '/api/cameras/zone-a/toggle',
          new Blob([JSON.stringify({ state: false })], { type: 'application/json' })
        );
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (isCameraOnRef.current) {
        toggleCamera(false);
      }
    };
  }, []);

  useEffect(() => {
    if (!authToken) return;

    const fetchStatus = () => {
      fetch('/api/status', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Unauthorized');
          return res.json();
        })
        .then(data => {
          setStatus(data.status || "Active");
          setAiData({ 
            speed: (data.ai_performance?.inference_time || 0) > 0 ? data.ai_performance.inference_time + "ms" : "Idle", 
            model: data.ai_performance?.model || "YOLO11" 
          });
          setActiveZones(data.active_zones || []);
        })
        .catch(() => setStatus("Offline"));
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [authToken]);

  // Fire toast + flash when new detections arrive
  useEffect(() => {
    if (allLogs.length > prevLogCountRef.current && prevLogCountRef.current > 0) {
      const newLog = allLogs[0];
      const toastType = newLog.risk === 'danger' ? 'danger' : newLog.risk === 'warning' ? 'warning' : 'info';
      addToast(`${newLog.type} detected at ${newLog.location} (${newLog.confidence} confidence)`, toastType);
      setLastUpdated(new Date());
      setNewAlertIds(prev => new Set([...prev, newLog.id]));
      setTimeout(() => setNewAlertIds(prev => { const s = new Set(prev); s.delete(newLog.id); return s; }), 2000);
    }
    prevLogCountRef.current = allLogs.length;
  }, [allLogs.length]);

  const [alertFilter, setAlertFilter] = useState('all');
  const [newAlertIds, setNewAlertIds] = useState(new Set());

  const logs = allLogs.slice(0, 50);

  const getShareText = (log) => {
    return encodeURIComponent(
`Laporan Keamanan Gudang

Sistem baru saja mendeteksi adanya aktivitas atau objek di area pantauan. Berikut adalah detail laporannya:

Tipe Deteksi: ${log.type}
Tingkat Risiko: ${log.risk.toUpperCase()}
Lokasi: ${log.location}
Waktu Kejadian: ${log.time}

Mohon segera lakukan pengecekan pada dashboard Smart Warehouse atau tugaskan personel keamanan ke lokasi terkait untuk memastikan kondisi area tetap aman dan terkendali.`
    );
  };

  const handleWhatsAppShare = (log) => {
    window.open(`https://wa.me/?text=${getShareText(log)}`, '_blank');
  };

  const handleTelegramShare = (log) => {
    window.open(`https://t.me/share/url?url=http://localhost:5173&text=${getShareText(log)}`, '_blank');
  };

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Top Stat Cards (Command Center) */}
      <div className="stat-grid">
        
        <div className="card stat-card">
          <div className="icon-container" style={{ minWidth: '48px', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.liveMonitor.systemStatus}</p>
            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{status}</h3>
            {lastUpdated && <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.65rem', color: 'var(--text-secondary)', opacity: 0.7 }}>{t.liveMonitor.updated} {lastUpdated.toLocaleTimeString()}</p>}
          </div>
        </div>

        <div className="card stat-card">
          <div className="icon-container" style={{ minWidth: '48px', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.liveMonitor.activeZones}</p>
            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{activeZones.length} {activeZones.length !== 1 ? t.liveMonitor.zones : t.liveMonitor.zone}</h3>
          </div>
        </div>

        <div className="card stat-card">
          <div className="icon-container" style={{ minWidth: '48px', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.liveMonitor.totalLogs}</p>
            <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{allLogs.length}</h3>
          </div>
        </div>

        <div className="card stat-card">
          <div className="icon-container" style={{ minWidth: '48px', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.liveMonitor.aiEngine}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0 0 0' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)' }}>{aiData.speed}</h3>
              <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--alert-danger)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--alert-danger-bg)', padding: '0.125rem 0.375rem', borderRadius: '6px' }}>{aiData.model}</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid-layout">
        {/* Left Column: Video Simulator */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{t.liveMonitor.liveVideoFeed}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>{t.liveMonitor.realtimeSurveillance}</p>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'var(--bg-secondary)', padding: '0.375rem 0.375rem 0.375rem 1rem', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', fontSize: '0.8rem', letterSpacing: '0.05em', color: isCameraOn && status === "Active" ? 'var(--alert-success)' : 'var(--text-secondary)' }}>
                <span className="status-dot" style={{ backgroundColor: isCameraOn && status === "Active" ? 'var(--alert-success)' : 'var(--text-secondary)' }}></span>
                {isCameraOn ? status.toUpperCase() : 'STANDBY'}
              </div>
              
              <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)', margin: '0 0.25rem' }}></div>
              
              <button 
                onClick={() => toggleCamera(!isCameraOn)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: isCameraOn ? 'var(--bg-tertiary)' : 'var(--text-primary)',
                  color: isCameraOn ? 'var(--text-primary)' : 'var(--bg-primary)',
                  border: isCameraOn ? '1px solid var(--border-color)' : '1px solid var(--text-primary)', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '700', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {isCameraOn ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg> {t.liveMonitor.stopCam}</>
                ) : (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg> {t.liveMonitor.startCam}</>
                )}
              </button>
            </div>
          </div>
          
          {/* REAL OpenCV MJPEG STREAM */}
          <div className="simulator-view" style={{ 
            padding: 0, backgroundColor: 'var(--bg-primary)', 
            border: isCameraOn ? '1px solid var(--border-color)' : '2px dashed var(--border-color)', 
            borderRadius: '20px', overflow: 'hidden',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)',
            transition: 'all 0.3s ease',
            aspectRatio: '4 / 3' // Match 640x480 webcam ratio
          }}>
            {isCameraOn ? (
              <img 
                src={`/api/video_feed?token=${authToken}`} 
                alt="Live Warehouse Camera Feed" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div style={{ 
              display: isCameraOn ? 'none' : 'flex', flexDirection: 'column', alignItems: 'center', 
              color: 'var(--text-secondary)', gap: '1rem', width: '100%', height: '100%', justifyContent: 'center'
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{t.liveMonitor.surveillanceInactive}</p>
                <p style={{ fontSize: '0.875rem' }}>{t.liveMonitor.clickToStart}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Zone Camera Grid */}
        <CameraGrid />
      </div>

      {/* Right Column: Alerts */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)', position: 'sticky', top: '1rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0, flex: 1 }}>{t.liveMonitor.recentAlerts}</h3>
          <span style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', backgroundColor: 'var(--bg-tertiary)', padding: '0.2rem 0.6rem', borderRadius: '99px', border: '1px solid var(--border-color)' }}>
            {logs.filter(l => alertFilter === 'all' || l.risk === alertFilter).length}
          </span>
        </div>

        {/* Filter bar */}
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: t.liveMonitor.all, icon: null },
            {
              key: 'danger', label: t.liveMonitor.danger, color: '#ef4444',
              icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
            },
            {
              key: 'warning', label: t.liveMonitor.warning, color: '#f59e0b',
              icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
            },
            {
              key: 'info', label: t.liveMonitor.info, color: '#3b82f6',
              icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
            },
          ].map(({ key, label, icon, color }) => (
            <button
              key={key}
              onClick={() => setAlertFilter(key)}
              style={{
                padding: '0.3rem 0.75rem', borderRadius: '99px', fontSize: '0.7rem', fontWeight: '700',
                cursor: 'pointer', transition: 'all 0.15s ease',
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                backgroundColor: alertFilter === key
                  ? (color || 'var(--text-primary)')
                  : 'var(--bg-tertiary)',
                color: alertFilter === key ? '#fff' : (color || 'var(--text-secondary)'),
                border: alertFilter === key
                  ? `1px solid ${color || 'var(--text-primary)'}`
                  : '1px solid var(--border-color)',
              }}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Alert list */}
        <div className="logs-list custom-scrollbar" style={{
          display: 'flex', flexDirection: 'column', gap: '0.6rem',
          flex: 1,
          overflowY: 'auto',
          paddingRight: '0.25rem',
          minHeight: 0,
        }}>
          {logs
            .filter(log => alertFilter === 'all' || log.risk === alertFilter)
            .map((log) => {
              const isNew = newAlertIds.has(log.id);
              const riskColor = log.risk === 'danger' ? '#ef4444' : log.risk === 'warning' ? '#f59e0b' : '#3b82f6';
              const riskBg = log.risk === 'danger' ? 'rgba(239,68,68,0.08)' : log.risk === 'warning' ? 'rgba(245,158,11,0.08)' : 'rgba(59,130,246,0.08)';
              const riskLabel = log.risk === 'danger' ? t.liveMonitor.hazard : log.risk === 'warning' ? t.liveMonitor.warning.toUpperCase() : t.liveMonitor.monitoring;
              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.75rem 1rem',
                    backgroundColor: isNew ? riskBg : 'var(--bg-primary)',
                    borderRadius: '10px',
                    border: isNew ? `1px solid ${riskColor}` : '1px solid var(--border-color)',
                    borderLeft: `3px solid ${riskColor}`,
                    transition: 'all 0.3s ease',
                    cursor: 'default',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{log.type}</h4>
                      <span style={{
                        fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.08em',
                        padding: '0.15rem 0.5rem', borderRadius: '99px',
                        backgroundColor: riskBg, color: riskColor,
                        border: `1px solid ${riskColor}40`,
                      }}>
                        {riskLabel}
                      </span>
                      {log.confidence && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '500' }}>{log.confidence}</span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {log.location}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', marginLeft: '0.75rem', flexShrink: 0 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>
                      {log.time}
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button
                        onClick={() => handleTelegramShare(log)}
                        style={{
                          padding: '0.3rem', borderRadius: '6px', border: '1px solid #0088cc',
                          color: '#0088cc', backgroundColor: 'transparent', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s ease',
                        }}
                        title={t.liveMonitor.shareTelegram}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#0088cc'; e.currentTarget.style.color = 'white'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#0088cc'; }}
                      >
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.287 5.906c-.778.324-2.334.994-4.666 2.01-.378.15-.577.298-.595.442-.03.243.275.339.69.47l.175.055c.408.133.958.288 1.243.294.26.006.549-.1.868-.32 2.179-1.471 3.304-2.214 3.374-2.23.05-.012.12-.026.166.016.047.041.042.12.037.141-.03.129-1.227 1.241-1.846 1.817-.193.18-.33.307-.358.336a8.154 8.154 0 0 1-.188.186c-.38.366-.664.64.015 1.088.327.216.589.393.85.571.284.194.568.387.936.629.093.06.183.125.27.187.331.236.63.448.997.414.214-.02.435-.22.547-.82.265-1.417.786-4.486.906-5.751a1.426 1.426 0 0 0-.013-.315.337.337 0 0 0-.114-.217.526.526 0 0 0-.31-.093c-.3.005-.763.166-2.984 1.09z"/></svg>
                      </button>
                      <button
                        onClick={() => handleWhatsAppShare(log)}
                        style={{
                          padding: '0.3rem', borderRadius: '6px', border: '1px solid #25d366',
                          color: '#25d366', backgroundColor: 'transparent', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s ease',
                        }}
                        title={t.liveMonitor.shareWhatsApp}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#25d366'; e.currentTarget.style.color = 'white'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#25d366'; }}
                      >
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          {logs.filter(l => alertFilter === 'all' || l.risk === alertFilter).length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {alertFilter === 'all' ? t.liveMonitor.noRecentAlerts : t.liveMonitor.noFilterAlerts.replace('{filter}', alertFilter)}
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
