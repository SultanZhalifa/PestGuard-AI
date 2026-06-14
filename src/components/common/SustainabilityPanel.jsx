import { useT } from '../../hooks/useT';

/**
 * SustainabilityPanel — surfaces the project's UN SDG alignment in-app
 * (the challenge's Sustainable Supply Chain track). Mirrors the proposal's
 * SDG section so judges see the sustainability framing on the live dashboard.
 */
const SDG_META = [
  { num: 8,  color: '#a21d3a', key: 'sdg8' },
  { num: 12, color: '#bf8b2e', key: 'sdg12' },
  { num: 3,  color: '#4c9f38', key: 'sdg3' },
];

export default function SustainabilityPanel() {
  const t = useT();
  const s = t.sustainability;

  return (
    <div className="card" style={{ padding: '1.5rem 2rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{s.title}</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>{s.subtitle}</p>
      </div>

      <div className="grid-3col">
        {SDG_META.map(({ num, color, key }) => (
          <div
            key={num}
            style={{
              padding: '1rem 1.1rem', borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-primary)',
              borderLeft: `4px solid ${color}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                backgroundColor: color, color: '#fff', fontWeight: 800, fontSize: '0.85rem',
              }}>{num}</span>
              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.2 }}>{s[key].name}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s[key].detail}</p>
          </div>
        ))}
      </div>

      <p style={{ margin: '1rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: '0.75rem', borderLeft: '3px solid var(--border-color)' }}>
        {s.pillars}
      </p>
    </div>
  );
}
