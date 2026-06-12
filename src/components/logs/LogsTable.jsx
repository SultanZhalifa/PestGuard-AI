import AnimalIcon from '../common/AnimalIcon';

/**
 * LogsTable — the data grid with header row + body rows
 * Props: logs, loading, onSnapshotClick, t
 */
export default function LogsTable({ logs, loading, onSnapshotClick, t }) {
  const COLS = [
    t.detectionLogs.animalType,
    t.detectionLogs.riskLevel,
    t.detectionLogs.location,
    t.detectionLogs.dateTime,
    t.detectionLogs.aiConfidence,
    t.detectionLogs.evidence,
  ];

  return (
    <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
      <div style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            {t.detectionLogs.loading}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                {COLS.map(col => (
                  <th key={col} style={{ padding: '1rem 1.5rem', fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const riskColor = log.risk === 'danger' ? '#b91c1c' : log.risk === 'warning' ? '#b45309' : '#57534e';
                return (
                  <tr
                    key={log.id}
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s ease', cursor: 'default', borderLeft: `3px solid ${riskColor}` }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-primary)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '0.875rem 1.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <AnimalIcon type={log.type} />{log.type}
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1.5rem' }}>
                      <span className={`alert-badge alert-${log.risk}`}>
                        <span className="status-dot" />
                        {log.risk === 'danger' ? t.detectionLogs.riskHazard : log.risk === 'info' ? t.detectionLogs.riskMonitoring : t.detectionLogs.riskContamination}
                      </span>
                    </td>
                    <td style={{ padding: '0.875rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{log.location}</td>
                    <td style={{ padding: '0.875rem 1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>{log.date}</span>
                        <span style={{ fontSize: '0.75rem' }}>{log.time}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: log.confidence, backgroundColor: riskColor, borderRadius: '3px' }} />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: '600', color: riskColor }}>{log.confidence}</span>
                      </div>
                    </td>
                    <td style={{ padding: '0.5rem 1.5rem' }}>
                      {log.snapshot ? (
                        <button
                          onClick={() => onSnapshotClick(log.snapshot)}
                          style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', cursor: 'pointer', padding: 0, backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}
                          onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--text-secondary)'; e.currentTarget.style.transform = 'scale(1.1)'; }}
                          onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          <img src={log.snapshot} alt="snapshot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.7rem' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                      <svg width="80" height="80" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="60" cy="60" r="55" stroke="var(--border-color)" strokeWidth="2" strokeDasharray="6 4" />
                        <circle cx="60" cy="60" r="35" fill="var(--bg-tertiary)" />
                        <path d="M50 55L55 60L70 45" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                        <circle cx="60" cy="55" r="12" stroke="var(--text-secondary)" strokeWidth="1.5" opacity="0.4" />
                        <line x1="69" y1="64" x2="80" y2="75" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
                      </svg>
                      <p style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>No detections found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
