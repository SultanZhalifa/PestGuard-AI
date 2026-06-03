
/**
 * StatCards — top-of-page KPI cards for LiveMonitor
 * Props: status, activeZones, totalLogs, aiData, lastUpdated, t
 */

/* ─── Inference Latency Gauge ─── */
function LatencyGauge({ ms }) {
  const numMs = parseInt(ms) || 0;
  // Color thresholds: green <50ms, yellow <120ms, red >=120ms
  const color = numMs === 0
    ? 'var(--text-secondary)'
    : numMs < 50 ? '#047857'
    : numMs < 120 ? '#b45309'
    : '#b91c1c';

  const label = numMs === 0
    ? 'Idle'
    : numMs < 50 ? 'Excellent'
    : numMs < 120 ? 'Good'
    : 'High Load';

  // Arc gauge (semicircle) — 0ms=0deg, 200ms=180deg
  const maxMs = 200;
  const clampedMs = Math.min(numMs, maxMs);
  const angleDeg = (clampedMs / maxMs) * 180;
  const angleRad = (angleDeg - 90) * (Math.PI / 180);
  const r = 28;
  const cx = 36, cy = 36;
  const tipX = cx + r * Math.cos(angleRad);
  const tipY = cy + r * Math.sin(angleRad);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
      {/* Mini arc gauge */}
      <svg width="52" height="32" viewBox="0 0 72 40" style={{ flexShrink: 0 }}>
        {/* Background track */}
        <path
          d="M 8 36 A 28 28 0 0 1 64 36"
          fill="none" stroke="var(--bg-tertiary)" strokeWidth="6" strokeLinecap="round"
        />
        {/* Color fill — only if ms > 0 */}
        {numMs > 0 && (
          <path
            d="M 8 36 A 28 28 0 0 1 64 36"
            fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={`${(angleDeg / 180) * 88} 88`}
          />
        )}
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={tipX} y2={tipY}
          stroke={color} strokeWidth="2" strokeLinecap="round"
          style={{ transition: 'x2 0.5s ease, y2 0.5s ease' }}
        />
        {/* Center dot */}
        <circle cx={cx} cy={cy} r="3" fill={color} />
      </svg>

      <div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.3rem' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
            {numMs > 0 ? numMs : '—'}
          </span>
          {numMs > 0 && (
            <span style={{ fontSize: '0.7rem', fontWeight: '600', color: 'var(--text-secondary)' }}>ms</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: color, display: 'inline-block' }} />
          <span style={{ fontSize: '0.68rem', fontWeight: '700', color, letterSpacing: '0.04em' }}>
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function StatCards({ status, activeZones, totalLogs, aiData, lastUpdated, t }) {
  const cards = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      ),
      iconStyle: { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' },
      label: t.liveMonitor.systemStatus,
      value: status,
      sub: lastUpdated ? `${t.liveMonitor.updated} ${lastUpdated.toLocaleTimeString()}` : null,
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      iconStyle: { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' },
      label: t.liveMonitor.activeZones,
      value: `${activeZones.length} ${activeZones.length !== 1 ? t.liveMonitor.zones : t.liveMonitor.zone}`,
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
        </svg>
      ),
      iconStyle: { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' },
      label: t.liveMonitor.totalLogs,
      value: totalLogs,
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
      ),
      iconStyle: { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' },
      label: t.liveMonitor.aiEngine,
      isAi: true,
    },
  ];

  return (
    <div className="stat-grid">
      {cards.map((card, i) => (
        <div key={i} className="card stat-card">
          <div className="stat-icon" style={card.iconStyle}>
            {card.icon}
          </div>
          <div className="stat-body">
            <p className="stat-label">{card.label}</p>
            {card.isAi ? (
              <div>
                {/* Latency gauge replaces plain text */}
                <LatencyGauge ms={parseInt(aiData.speed) || 0} />
                <div style={{ marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span className="ai-badge">{aiData.model}</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                    CLAHE ✓
                  </span>
                </div>
              </div>
            ) : (
              <>
                <h3 className="stat-value">{card.value}</h3>
                {card.sub && <p className="stat-sub">{card.sub}</p>}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
