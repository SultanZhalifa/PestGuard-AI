import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/apiClient';
import { useT } from '../../hooks/useT';

/**
 * AuditLog — admin-only read view of the security & compliance trail
 * (login, settings changes, user CRUD, log clears). Consumes /api/audit-log.
 */
const ACTION_COLOR = {
  login: '#57534e',
  'settings.update': '#b45309',
  'settings.reset': '#b45309',
  'user.create': '#0f766e',
  'user.update': '#0f766e',
  'user.delete': '#b91c1c',
  'logs.clear': '#b91c1c',
};

function timeAgo(ts, t) {
  const diff = Math.max(0, Date.now() / 1000 - ts);
  if (diff < 60) return t.audit.justNow;
  if (diff < 3600) return `${Math.floor(diff / 60)}${t.audit.minShort}`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}${t.audit.hrShort}`;
  return `${Math.floor(diff / 86400)}${t.audit.dayShort}`;
}

export default function AuditLog() {
  const t = useT();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getJson('/audit-log?limit=50');
      setEntries(data?.entries || []);
    } catch {
      setError(t.audit.error);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, [load]);

  return (
    <div className="settings-card" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="section-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div>
            <h3 className="section-title" style={{ margin: 0 }}>{t.audit.title}</h3>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t.audit.subtitle}</p>
          </div>
        </div>
        <button onClick={load} className="spinner-host" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer',
          padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)',
          background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.78rem', fontWeight: 600,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          {t.audit.refresh}
        </button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 38, borderRadius: 8 }} />)}
        </div>
      ) : error ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--alert-danger, #b91c1c)' }}>{error}</p>
      ) : entries.length === 0 ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.audit.empty}</p>
      ) : (
        <div className="table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 480 }}>
            <tbody>
              {entries.map((e) => (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.6rem 0.5rem', whiteSpace: 'nowrap' }}>
                    <span style={{
                      display: 'inline-block', padding: '0.15rem 0.5rem', borderRadius: '6px',
                      fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.03em',
                      color: ACTION_COLOR[e.action] || 'var(--text-secondary)',
                      backgroundColor: `${ACTION_COLOR[e.action] || '#78716c'}14`,
                    }}>{e.action}</span>
                  </td>
                  <td style={{ padding: '0.6rem 0.5rem', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{e.actor || '—'}</td>
                  <td style={{ padding: '0.6rem 0.5rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{e.detail}</td>
                  <td style={{ padding: '0.6rem 0.5rem', fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'right', whiteSpace: 'nowrap' }}>{timeAgo(e.ts, t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
