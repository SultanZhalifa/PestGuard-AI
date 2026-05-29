
/**
 * CameraSettings — camera URL, zone selector, AI threshold slider
 * Props: cameraUrl, cameraZone, threshold, onUrlChange, onZoneChange, onThresholdChange, t
 */
export default function CameraSettings({ cameraUrl, cameraZone, threshold, onUrlChange, onZoneChange, onThresholdChange, t }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
        <div className="section-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </div>
        <h3 className="section-title">{t.settings.systemConfig}</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.75rem', paddingLeft: '1rem' }}>
        {/* Camera URL */}
        <div>
          <label className="field-label">{t.settings.cameraSourceUrl}</label>
          <input
            type="text"
            value={cameraUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            className="field-input"
            onFocus={(e) => { e.target.style.borderColor = 'var(--text-secondary)'; e.target.style.boxShadow = '0 0 0 3px var(--bg-tertiary)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)'; }}
          />
          <p className="field-hint">
            {t.settings.cameraSourceHint.split('{zero}')[0]}
            <code className="inline-code">0</code>
            {t.settings.cameraSourceHint.split('{zero}')[1]?.split('{mp4}')[0]}
            <code className="inline-code">.mp4</code>
            {t.settings.cameraSourceHint.split('{mp4}')[1]}
          </p>
        </div>

        {/* Camera Zone */}
        <div>
          <label className="field-label">{t.settings.cameraZone}</label>
          <select value={cameraZone} onChange={(e) => onZoneChange(e.target.value)} className="field-select">
            {['Zone A', 'Zone B', 'Zone C', 'Zone D'].map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
          <p className="field-hint">{t.settings.cameraZoneHint}</p>
        </div>

        {/* Threshold slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label className="field-label" style={{ margin: 0 }}>{t.settings.aiThreshold}</label>
            <span style={{
              padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.875rem', fontWeight: '700', border: '1px solid',
              backgroundColor: threshold < 50 ? 'rgba(34,197,94,0.1)' : threshold < 75 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
              color: threshold < 50 ? '#16a34a' : threshold < 75 ? '#d97706' : '#dc2626',
              borderColor: threshold < 50 ? 'rgba(34,197,94,0.3)' : threshold < 75 ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)',
            }}>{threshold}%</span>
          </div>
          <input
            type="range" min="30" max="95"
            value={threshold}
            onChange={(e) => onThresholdChange(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', height: '6px', borderRadius: '4px', accentColor: threshold < 50 ? '#22c55e' : threshold < 75 ? '#f59e0b' : '#ef4444' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '0.5rem', fontWeight: '500' }}>
            <span style={{ color: '#16a34a' }}>{t.settings.sensitiveLow}</span>
            <span style={{ color: threshold < 50 ? '#16a34a' : threshold < 75 ? '#d97706' : '#dc2626', fontWeight: '700' }}>
              {threshold < 50 ? t.settings.highSensitivity : threshold < 75 ? t.settings.balanced : t.settings.strict}
            </span>
            <span style={{ color: '#dc2626' }}>{t.settings.sensitiveHigh}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
