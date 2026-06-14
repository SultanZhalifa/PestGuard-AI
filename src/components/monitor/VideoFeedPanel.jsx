import { useState, useEffect } from 'react';
import api from '../../lib/apiClient';

/**
 * VideoFeedPanel — live MJPEG stream + camera toggle for Zone A
 * Props: isCameraOn, status, authToken, onToggle, t
 */
export default function VideoFeedPanel({ isCameraOn, status, onToggle, t }) {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!isCameraOn) setImageLoaded(false);
  }, [isCameraOn]);
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Panel Header */}
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div className="panel-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
          <div>
            <h3 className="panel-title">{t.liveMonitor.liveVideoFeed}</h3>
            <p className="panel-subtitle">{t.liveMonitor.realtimeSurveillance}</p>
          </div>
        </div>

        {/* Camera control bar */}
        <div className="cam-control-bar">
          <div
            className="cam-status-label"
            style={{ color: isCameraOn && status === 'Active' ? 'var(--alert-success)' : 'var(--text-secondary)' }}
          >
            <span
              className="status-dot"
              style={{ backgroundColor: isCameraOn && status === 'Active' ? 'var(--alert-success)' : 'var(--text-secondary)' }}
            />
            {isCameraOn ? status.toUpperCase() : 'STANDBY'}
          </div>

          <div className="cam-divider" />

          <button
            onClick={() => onToggle(!isCameraOn)}
            className="cam-toggle-btn"
            style={{
              backgroundColor: isCameraOn ? 'var(--bg-tertiary)' : 'var(--text-primary)',
              color: isCameraOn ? 'var(--text-primary)' : 'var(--bg-primary)',
              border: isCameraOn ? '1px solid var(--border-color)' : '1px solid var(--text-primary)',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {isCameraOn ? (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg> {t.liveMonitor.stopCam}</>
            ) : (
              <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg> {t.liveMonitor.startCam}</>
            )}
          </button>
        </div>
      </div>

      <div
        className="video-viewport"
        style={{
          border: 'none',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#0a0a0a',
          flex: 1,
          aspectRatio: 'auto',
          minHeight: '340px',
        }}
      >
        {/* Simulator badge — frames the live feed as the brief's "Simulator" deliverable */}
        {isCameraOn && imageLoaded && (
          <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', zIndex: 3, display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start', pointerEvents: 'none' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.25rem 0.6rem', borderRadius: '6px',
              backgroundColor: 'rgba(10,10,10,0.65)', backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255,255,255,0.2)',
              fontSize: '0.62rem', fontWeight: '800', letterSpacing: '0.12em', color: '#fff',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block', animation: 'pulse 1.5s ease-in-out infinite' }} />
              {t.liveMonitor.simulatorBadge}
            </span>
            <span style={{
              padding: '0.2rem 0.55rem', borderRadius: '6px',
              backgroundColor: 'rgba(10,10,10,0.55)', backdropFilter: 'blur(4px)',
              fontSize: '0.6rem', fontWeight: '600', color: 'rgba(255,255,255,0.85)',
            }}>
              {t.liveMonitor.simulatorCaption}
            </span>
          </div>
        )}

        {isCameraOn && (
          <img
            src={api.streamUrl('/video_feed')}
            alt="Live Warehouse Camera Feed"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              backgroundColor: '#000',
              opacity: imageLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease',
            }}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              e.target.style.display = 'none';
              // If there's a nextSibling (placeholder or loader), handle display
              const placeholder = e.target.parentNode.querySelector('.video-placeholder');
              if (placeholder) placeholder.style.display = 'flex';
            }}
          />
        )}

        {/* Shimmering Dark Skeleton Loader */}
        {isCameraOn && !imageLoaded && (
          <div
            className="skeleton"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              borderRadius: 0,
              background: 'linear-gradient(90deg, #070a13 25%, #111827 50%, #070a13 75%)',
              backgroundSize: '200% 100%',
              color: '#a8a29e',
            }}
          >
            <span className="spinner-sm" style={{ borderLeftColor: '#f8fafc' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '0.15em', color: '#a8a29e' }}>
              INITIALIZING LIVE CAMERA FEED...
            </span>
          </div>
        )}

        <div className="video-placeholder" style={{ display: isCameraOn ? 'none' : 'flex', color: '#a8a29e', gap: '0.875rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: '700', color: '#f8fafc', marginBottom: '0.35rem', fontSize: '0.95rem', letterSpacing: '0.02em' }}>{t.liveMonitor.surveillanceInactive}</p>
            <p style={{ fontSize: '0.8rem', color: '#a8a29e', margin: 0 }}>{t.liveMonitor.clickToStart}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
