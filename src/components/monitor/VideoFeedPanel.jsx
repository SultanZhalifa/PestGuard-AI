import api from '../../lib/apiClient';

/**
 * VideoFeedPanel — live MJPEG stream + camera toggle for Zone A
 * Props: isCameraOn, status, authToken, onToggle, t
 */
export default function VideoFeedPanel({ isCameraOn, status, onToggle, t }) {
  return (
    <div className="card" style={{ padding: '2rem' }}>
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

      {/* Video viewport */}
      <div
        className="video-viewport"
        style={{
          border: isCameraOn ? '1px solid var(--border-color)' : '2px dashed var(--border-color)',
        }}
      >
        {isCameraOn && (
          <img
            src={api.streamUrl('/video_feed')}
            alt="Live Warehouse Camera Feed"
            style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        )}
        <div className="video-placeholder" style={{ display: isCameraOn ? 'none' : 'flex' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{t.liveMonitor.surveillanceInactive}</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{t.liveMonitor.clickToStart}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
