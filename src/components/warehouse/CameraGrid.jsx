import { useState, useEffect, useCallback, useRef } from 'react';
import { useWarehouse } from '../../context/WarehouseContext';
import ZoneDetailModal from './ZoneDetailModal';
import { useT } from '../../hooks/useT';
import api from '../../lib/apiClient';

export default function CameraGrid() {
  const { authToken } = useWarehouse();
  const t = useT();
  const [zones, setZones] = useState([]);
  const [pendingZones, setPendingZones] = useState({}); // zone_id -> bool (toggle in flight)
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [loadedImages, setLoadedImages] = useState({}); // zone_id -> bool
  const startedZonesRef = useRef(new Set()); // tracks zones we started in this tab

  const fetchZones = useCallback(() => {
    if (!authToken) return;
    api.get('/cameras')
      .then(r => r.ok ? r.json() : [])
      .then(data => setZones(data))
      .catch(() => {});
  }, [authToken]);

  useEffect(() => {
    fetchZones();
    const interval = setInterval(fetchZones, 8000);
    return () => clearInterval(interval);
  }, [fetchZones]);

  // Cleanup: stop any zone we started when the tab closes / component unmounts
  useEffect(() => {
    const handleBeforeUnload = () => {
      const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
      startedZonesRef.current.forEach(zoneId => {
        const url = base ? `${base}/api/cameras/${zoneId}/toggle` : `/api/cameras/${zoneId}/toggle`;
        navigator.sendBeacon?.(
          url,
          new Blob([JSON.stringify({ state: false })], { type: 'application/json' })
        );
      });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const toggleZone = async (zoneId, turnOn) => {
    setPendingZones(p => ({ ...p, [zoneId]: true }));
    setLoadedImages(p => ({ ...p, [zoneId]: false }));
    try {
      await api.postJson(`/cameras/${zoneId}/toggle`, { state: turnOn });
      if (turnOn) {
        startedZonesRef.current.add(zoneId);
      } else {
        startedZonesRef.current.delete(zoneId);
      }
      // Optimistic update; refresh from server soon after
      setZones(prev => prev.map(z =>
        z.id === zoneId ? { ...z, status: turnOn ? 'live' : 'standby' } : z
      ));
      setTimeout(fetchZones, 500);
    } catch (err) {
      console.error(`Failed to toggle ${zoneId}:`, err);
      alert(`Failed to ${turnOn ? 'start' : 'stop'} ${zoneId}: ${err.message}`);
    } finally {
      setPendingZones(p => ({ ...p, [zoneId]: false }));
    }
  };

  const getStatusColor = (status) => {
    if (status === 'live') return '#292524';
    if (status === 'standby') return '#b45309';
    return '#6b7280';
  };

  const getStatusLabel = (status) => {
    if (status === 'live') return 'LIVE';
    if (status === 'standby') return 'STANDBY';
    return 'OFFLINE';
  };

  const getSourceLabel = (sourceType) => {
    if (sourceType === 'webcam') return 'Webcam';
    if (sourceType === 'video') return 'Video';
    if (sourceType === 'stream') return 'Stream';
    if (sourceType === 'cctv') return 'CCTV';
    return null;
  };

  if (zones.length === 0) return null;

  return (
    <div className="camera-grid" style={{ marginTop: '1.5rem' }}>
      {zones.map((zone) => {
        const isLive = zone.status === 'live';
        const statusColor = getStatusColor(zone.status);
        const statusLabel = getStatusLabel(zone.status);
        const canControl = zone.has_source;
        const isPending = !!pendingZones[zone.id];
        const sourceLabel = getSourceLabel(zone.source_type);
        const isImageLoaded = !!loadedImages[zone.id];

        return (
          <div
            key={zone.id}
            onClick={() => setSelectedZoneId(zone.id)}
            style={{
              backgroundColor: 'var(--bg-secondary)', borderRadius: '16px',
              border: isLive ? `2px solid ${statusColor}` : '1px solid var(--border-color)',
              overflow: 'hidden', transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              boxShadow: isLive ? `0 0 20px ${statusColor}20` : 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!isLive) e.currentTarget.style.borderColor = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              if (!isLive) e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            {/* Camera View Area */}
            <div style={{
              aspectRatio: '16/9', backgroundColor: '#0a0a0a', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {isLive ? (
                <>
                  <img
                    key={`${zone.id}-${zone.status}`}
                    src={`/api/video_feed/${zone.id}?token=${authToken}`}
                    alt={zone.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: isImageLoaded ? 1 : 0,
                      transition: 'opacity 0.3s ease',
                    }}
                    onLoad={() => setLoadedImages(prev => ({ ...prev, [zone.id]: true }))}
                  />
                  {!isImageLoaded && (
                    <div
                      className="skeleton"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        borderRadius: 0,
                        background: 'linear-gradient(90deg, #070a13 25%, #111827 50%, #070a13 75%)',
                        backgroundSize: '200% 100%',
                        color: '#a8a29e',
                      }}
                    >
                      <span className="spinner-sm" style={{ borderLeftColor: '#f8fafc' }} />
                      <span style={{ fontSize: '0.6rem', fontWeight: '800', letterSpacing: '0.1em', color: '#a8a29e' }}>
                        CONNECTING...
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', color: '#a8a29e' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                    <path d="M16.5 7.5V6a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v0"/><path d="M2 2l20 20"/><path d="M23 7l-7 5"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2" style={{ opacity: 0.35 }}/>
                  </svg>
                  <span style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.1em', color: '#a8a29e' }}>
                    {canControl ? t.cameraGrid.noSignal : t.cameraGrid.noSource}
                  </span>
                </div>
              )}

              {/* Status Badge */}
              <div style={{
                position: 'absolute', top: '0.5rem', left: '0.5rem',
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                padding: '0.25rem 0.625rem', borderRadius: '6px',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', backgroundColor: statusColor,
                  display: 'inline-block',
                  animation: isLive ? 'pulse 2s infinite' : 'none',
                }}/>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: statusColor, letterSpacing: '0.08em' }}>
                  {statusLabel}
                </span>
              </div>

              {/* Source-type Badge */}
              {sourceLabel && (
                <div style={{
                  position: 'absolute', top: '0.5rem', right: '0.5rem',
                  backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                  padding: '0.2rem 0.5rem', borderRadius: '4px',
                  fontSize: '0.6rem', fontWeight: '700', color: '#ddd',
                  letterSpacing: '0.05em',
                }}>
                  {sourceLabel.toUpperCase()}
                </div>
              )}

              {/* Zone Label */}
              <div style={{
                position: 'absolute', bottom: '0.5rem', left: '0.5rem',
                backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                padding: '0.2rem 0.5rem', borderRadius: '4px',
              }}>
                <span style={{ fontSize: '0.6rem', fontWeight: '600', color: '#ccc' }}>{zone.name}</span>
              </div>

              {/* Detection count badge — color by last risk */}
              {zone.detection_count > 0 && (
                <div style={{
                  position: 'absolute', bottom: '0.5rem', right: '0.5rem',
                  backgroundColor: zone.last_risk === 'danger' ? 'rgba(185,28,28,0.92)'
                    : zone.last_risk === 'warning' ? 'rgba(180,83,9,0.92)'
                    : 'rgba(41, 37, 36,0.92)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '10px', fontSize: '0.6rem', fontWeight: '700', color: '#fff',
                }}>
                  {zone.detection_count} {t.cameraGrid.detections}
                </div>
              )}
            </div>

            {/* Zone Info Bar */}
            <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-primary)' }}>{zone.location}</p>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                  {zone.last_detection ? `${t.cameraGrid.last} ${zone.last_detection}` : t.cameraGrid.noDetections}
                </p>
              </div>
              {canControl && (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleZone(zone.id, !isLive); }}
                  disabled={isPending}
                  style={{
                    padding: '0.45rem 0.875rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '700',
                    backgroundColor: isLive ? 'var(--bg-tertiary)' : 'var(--text-primary)',
                    color: isLive ? 'var(--text-primary)' : 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    cursor: isPending ? 'wait' : 'pointer',
                    opacity: isPending ? 0.6 : 1,
                    transition: 'background-color 0.2s ease, color 0.2s ease',
                    minHeight: '36px',
                    flexShrink: 0,
                  }}>
                  {isPending ? '...' : (isLive ? t.cameraGrid.stop : t.cameraGrid.start)}
                </button>
              )}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      {selectedZoneId && (() => {
        const selectedZone = zones.find(z => z.id === selectedZoneId);
        if (!selectedZone) return null;
        return (
          <ZoneDetailModal
            zone={selectedZone}
            onClose={() => setSelectedZoneId(null)}
            onToggle={toggleZone}
            isPending={!!pendingZones[selectedZoneId]}
          />
        );
      })()}
    </div>
  );
}
