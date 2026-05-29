import { useState, useEffect, useCallback, useRef } from 'react';
import { useWarehouse } from '../context/WarehouseContext';
import { useToast } from './ToastNotification';
import { useT } from '../hooks/useT';
import api from '../lib/apiClient';

const TRACKED_CLASSES = ['snake', 'cat', 'gecko', 'lizard'];

const ControlBtn = ({ onClick, title, children, active }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      background: active ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)',
      border: '1px solid rgba(255,255,255,0.25)',
      borderRadius: '6px', color: '#fff', width: 30, height: 30,
      cursor: 'pointer', fontSize: '1rem', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)', flexShrink: 0,
    }}
  >
    {children}
  </button>
);

const RISK_COLORS = {
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  monitoring: '#3b82f6',
  contamination: '#f59e0b',
};

export default function ZoneDetailModal({ zone, onClose, onToggle, isPending }) {
  const { authToken, user } = useWarehouse();
  const { addToast } = useToast();
  const t = useT();
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [snapshotLoading, setSnapshotLoading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [fitMode, setFitMode] = useState('contain');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);
  const videoContainerRef = useRef(null);

  const isAdmin = user?.role === 'admin';
  const isLive = zone.status === 'live';

  const fetchData = useCallback(async () => {
    if (!authToken || !zone?.id) return;
    try {
      const [statsRes, logsRes] = await Promise.all([
        api.get(`/zones/${zone.id}/stats`),
        api.get(`/logs?zone=${encodeURIComponent(zone.name)}&limit=20`),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch { /* silently ignore — polling will retry */ }
  }, [authToken, zone?.id, zone?.name]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Esc key closes modal
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && !document.fullscreenElement && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock background scroll while the modal is open (only the overlay scrolls)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Reset player state when zone changes
  useEffect(() => {
    setRotation(0);
    setFitMode('contain');
  }, [zone.id]);

  // Sync fullscreen state
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleFullscreen = () => {
    const el = videoContainerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const takeSnapshot = async () => {
    if (!isLive) {
      addToast(t.zoneModal.snapshotMustBeLive, 'warning');
      return;
    }
    setSnapshotLoading(true);
    try {
      const res = await api.get(`/cameras/${zone.id}/snapshot`);
      if (!res.ok) throw new Error('Snapshot failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `${zone.id}-snapshot-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      addToast(t.zoneModal.snapshotSaved, 'success');
    } catch {
      addToast(t.zoneModal.snapshotFailed, 'danger');
    } finally {
      setSnapshotLoading(false);
    }
  };

  const exportLogs = () => {
    window.open(api.streamUrl('/export/logs'), '_blank');
  };

  const filteredLogs = filter === 'all'
    ? logs
    : logs.filter((l) => l.type.toLowerCase() === filter);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        // Overlay itself does NOT scroll — it just centers the modal in the
        // viewport. The modal has a fixed max height and scrolls internally,
        // so it always floats centered regardless of the page scroll position.
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-secondary)', borderRadius: '20px',
          width: '100%', maxWidth: '1100px',
          maxHeight: 'calc(100dvh - 3rem)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: 'var(--bg-secondary)', flexShrink: 0,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '600', letterSpacing: '0.1em' }}>
              {zone.name.toUpperCase()}
            </p>
            <h2 style={{ margin: '0.15rem 0 0', fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              {zone.location}
            </h2>
          </div>
          <button onClick={onClose} style={{
            backgroundColor: 'transparent', border: '1px solid var(--border-color)',
            color: 'var(--text-primary)', borderRadius: '8px',
            width: 36, height: 36, cursor: 'pointer', fontSize: '1.1rem',
          }}>×</button>
        </div>

        {/* Body — scrolls internally so the modal stays a fixed centered size */}
        <div className="zone-modal-body" style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {/* LEFT: video + stats */}
          <div>
            {/* Live Stream */}
            <div
              ref={videoContainerRef}
              onMouseEnter={() => setIsHoveringVideo(true)}
              onMouseLeave={() => setIsHoveringVideo(false)}
              style={{
                aspectRatio: '16/9', backgroundColor: '#0a0a0a',
                borderRadius: '12px', overflow: 'hidden', position: 'relative',
                border: isLive ? `2px solid ${RISK_COLORS.danger}` : '1px solid var(--border-color)',
              }}
            >
              {isLive ? (
                <img
                  key={`detail-${zone.id}-${zone.status}`}
                  src={api.streamUrl(`/video_feed/${zone.id}`)}
                  alt={zone.name}
                  style={{
                    width: rotation % 180 === 0 ? '100%' : '100%',
                    height: '100%',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: fitMode,
                    transform: `rotate(${rotation}deg)`,
                    transition: 'transform 0.3s ease',
                  }}
                />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#666', gap: '0.75rem',
                }}>
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                    <path d="M16.5 7.5V6a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v0"/><path d="M2 2l20 20"/><path d="M23 7l-7 5"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2" style={{ opacity: 0.3 }}/>
                  </svg>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', letterSpacing: '0.1em' }}>
                    {zone.has_source ? t.zoneModal.cameraOffline : t.zoneModal.noSourceConfigured}
                  </span>
                </div>
              )}

              {/* Status overlay */}
              <div style={{
                position: 'absolute', top: '0.75rem', left: '0.75rem',
                backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
                padding: '0.4rem 0.8rem', borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  backgroundColor: isLive ? '#22c55e' : '#f59e0b',
                  animation: isLive ? 'pulse 2s infinite' : 'none',
                }} />
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: isLive ? '#22c55e' : '#f59e0b', letterSpacing: '0.1em' }}>
                  {isLive ? t.zoneModal.live : t.zoneModal.standby}
                </span>
              </div>

              {/* YouTube-style controls bar */}
              {isLive && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
                  padding: '1.5rem 0.75rem 0.5rem',
                  display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '0.4rem',
                  opacity: isHoveringVideo ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                  pointerEvents: isHoveringVideo ? 'auto' : 'none',
                }}>
                  {(rotation !== 0 || fitMode !== 'contain') && (
                    <ControlBtn
                      onClick={() => { setRotation(0); setFitMode('contain'); }}
                      title="Reset"
                    >↺</ControlBtn>
                  )}
                  <ControlBtn
                    onClick={() => setRotation(r => (r - 90 + 360) % 360)}
                    title="Rotate CCW"
                  >⟲</ControlBtn>
                  <ControlBtn
                    onClick={() => setRotation(r => (r + 90) % 360)}
                    title="Rotate CW"
                  >⟳</ControlBtn>
                  <ControlBtn
                    onClick={() => setFitMode(m => m === 'contain' ? 'cover' : m === 'cover' ? 'fill' : 'contain')}
                    title={`Fit: ${fitMode} → ${fitMode === 'contain' ? 'cover' : fitMode === 'cover' ? 'fill' : 'contain'}`}
                    active={fitMode !== 'contain'}
                  >
                    {fitMode === 'contain' ? '⊡' : fitMode === 'cover' ? '⊠' : '⬚'}
                  </ControlBtn>
                  <ControlBtn
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  >
                    {isFullscreen ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>
                    )}
                  </ControlBtn>
                </div>
              )}
            </div>

            {/* Control buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              {zone.has_source && (
                <button
                  onClick={() => onToggle(zone.id, !isLive)}
                  disabled={isPending}
                  style={{
                    flex: 1, padding: '0.6rem', borderRadius: '8px',
                    backgroundColor: isLive ? 'var(--bg-tertiary)' : 'var(--text-primary)',
                    color: isLive ? 'var(--text-primary)' : 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    fontWeight: '700', fontSize: '0.8rem',
                    cursor: isPending ? 'wait' : 'pointer',
                    opacity: isPending ? 0.6 : 1,
                  }}
                >
                  {isPending ? '...' : (isLive ? t.zoneModal.stopMonitoring : t.zoneModal.startMonitoring)}
                </button>
              )}
              <button
                onClick={takeSnapshot}
                disabled={!isLive || snapshotLoading}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '8px',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  fontWeight: '700', fontSize: '0.8rem',
                  cursor: !isLive ? 'not-allowed' : 'pointer',
                  opacity: !isLive ? 0.4 : 1,
                }}
              >
                {snapshotLoading ? '...' : t.zoneModal.snapshot}
              </button>
              <button
                onClick={exportLogs}
                style={{
                  flex: 1, padding: '0.6rem', borderRadius: '8px',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  fontWeight: '700', fontSize: '0.8rem', cursor: 'pointer',
                }}
              >
                {t.zoneModal.exportCsv}
              </button>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginTop: '1rem' }}>
              {[
                { label: t.zoneModal.today, value: stats?.total_today ?? '—' },
                { label: t.zoneModal.allTime, value: stats?.total_all ?? '—' },
                { label: t.zoneModal.avgConf, value: stats ? `${stats.avg_confidence}%` : '—' },
                { label: t.zoneModal.status, value: isLive ? t.zoneModal.active : t.zoneModal.idle },
              ].map((s) => (
                <div key={s.label} style={{
                  backgroundColor: 'var(--bg-tertiary)', padding: '0.7rem',
                  borderRadius: '10px', textAlign: 'center',
                  border: '1px solid var(--border-color)',
                }}>
                  <p style={{ margin: 0, fontSize: '0.55rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.1em' }}>
                    {s.label}
                  </p>
                  <p style={{ margin: '0.3rem 0 0', fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Detection Breakdown */}
            {stats?.breakdown?.length > 0 && (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.1em' }}>
                  {t.zoneModal.detectionBreakdown}
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {stats.breakdown.map((b) => (
                    <div key={b.type} style={{
                      flex: 1, minWidth: '110px',
                      backgroundColor: 'var(--bg-tertiary)', padding: '0.6rem 0.8rem',
                      borderRadius: '8px', border: '1px solid var(--border-color)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                        {b.type}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {b.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: timeline + config */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Filter tabs */}
            <div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.1em' }}>
                {t.zoneModal.recentDetections}
              </p>
              <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {['all', ...TRACKED_CLASSES].map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilter(c)}
                    style={{
                      padding: '0.3rem 0.65rem', borderRadius: '6px',
                      backgroundColor: filter === c ? 'var(--text-primary)' : 'var(--bg-tertiary)',
                      color: filter === c ? 'var(--bg-primary)' : 'var(--text-secondary)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.65rem', fontWeight: '700',
                      cursor: 'pointer', textTransform: 'uppercase',
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>

              {/* Timeline */}
              <div style={{
                maxHeight: '290px', overflowY: 'auto',
                display: 'flex', flexDirection: 'column', gap: '0.4rem',
              }}>
                {filteredLogs.length === 0 ? (
                  <div style={{
                    padding: '2rem', textAlign: 'center',
                    color: 'var(--text-secondary)', fontSize: '0.8rem',
                    backgroundColor: 'var(--bg-tertiary)', borderRadius: '8px',
                    border: '1px dashed var(--border-color)',
                  }}>
                    {t.zoneModal.noDetectionsYet}
                  </div>
                ) : (
                  filteredLogs.map((log) => {
                    const color = RISK_COLORS[log.risk?.toLowerCase()] || '#6b7280';
                    return (
                      <div key={log.id} style={{
                        backgroundColor: 'var(--bg-tertiary)', padding: '0.5rem 0.75rem',
                        borderRadius: '8px', borderLeft: `3px solid ${color}`,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                            {log.type}
                          </p>
                          <p style={{ margin: '0.1rem 0 0', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                            {log.date} • {log.time}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700', color }}>
                            {log.confidence}
                          </p>
                          <p style={{ margin: '0.1rem 0 0', fontSize: '0.55rem', color, fontWeight: '700', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                            {log.risk}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Configuration Section */}
            <div>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.1em' }}>
                {t.zoneModal.zoneConfiguration}
              </p>
              <div style={{
                backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem',
                borderRadius: '10px', border: '1px solid var(--border-color)',
                fontSize: '0.75rem',
              }}>
                <ConfigRow label={t.zoneModal.zoneId} value={zone.id} />
                <ConfigRow label={t.zoneModal.sourceType} value={(zone.source_type || 'none').toUpperCase()} />
                <ConfigRow label={t.zoneModal.hasSource} value={zone.has_source ? t.zoneModal.yes : t.zoneModal.no} />
                <ConfigRow label={t.zoneModal.lastDetection} value={zone.last_detection || t.zoneModal.never} />
                {isAdmin && zone.source && (
                  <div style={{ marginTop: '0.4rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ margin: 0, fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.05em' }}>
                      {t.zoneModal.sourcePath}
                    </p>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', color: 'var(--text-primary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                      {zone.source}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

function ConfigRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '0.25rem 0', fontSize: '0.75rem',
    }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{value}</span>
    </div>
  );
}
