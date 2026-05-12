import React from 'react';

/**
 * StatCards — top-of-page KPI cards for LiveMonitor
 * Props: status, activeZones, totalLogs, aiData, lastUpdated, t
 */
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.25rem 0 0 0' }}>
                <h3 className="stat-value">{aiData.speed}</h3>
                <span className="ai-badge">{aiData.model}</span>
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
