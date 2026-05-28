import { useState } from 'react';
import { SOP_PROTOCOLS, ROI_DEFAULTS } from '../constants/detectionConfig';

/* ─── SVG Step Icons ─── */
const STEP_ICONS = {
  alert: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  phone: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  barrier: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  camera: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  report: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  ),
  package: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  ),
  exit: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  clean: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  inspect: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  lock: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  ),
  note: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  chart: (color) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
    </svg>
  ),
};

/* ─── ROI Calculator ─── */
function ROISection() {
  const [pestControl,       setPestControl]       = useState(ROI_DEFAULTS.pestControl);
  const [staffCost,         setStaffCost]         = useState(ROI_DEFAULTS.staffCost);
  const [incidentLoss,      setIncidentLoss]      = useState(ROI_DEFAULTS.incidentLoss);
  const [incidentsPerMonth, setIncidentsPerMonth] = useState(ROI_DEFAULTS.incidentsPerMonth);
  const [systemCost,        setSystemCost]        = useState(ROI_DEFAULTS.systemCost);
  const [implementationCost,setImplementationCost]= useState(ROI_DEFAULTS.implementationCost);
  const [reductionRate,     setReductionRate]     = useState(ROI_DEFAULTS.reductionRate);

  const manualMonthly   = pestControl + staffCost + (incidentLoss * incidentsPerMonth);
  const reducedIncidents= incidentsPerMonth * (1 - reductionRate / 100);
  const systemMonthly   = systemCost + (incidentLoss * reducedIncidents);
  const monthlySavings  = manualMonthly - systemMonthly;
  const annualSavings   = monthlySavings * 12;
  const paybackMonths   = implementationCost / Math.max(monthlySavings, 1);
  const roi3Year        = ((annualSavings * 3 - implementationCost) / implementationCost) * 100;

  const fmt = (n) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(n);

  const inputRows = [
    { label: 'Pest Control Manual / bulan',           state: pestControl,       set: setPestControl,       step: 1_000_000, min: 0,  max: 100_000_000, isRupiah: true },
    { label: 'Biaya Staff Keamanan / bulan',           state: staffCost,         set: setStaffCost,         step: 1_000_000, min: 0,  max:  50_000_000, isRupiah: true },
    { label: 'Kerugian per Insiden (kerusakan produk)',state: incidentLoss,      set: setIncidentLoss,      step:   500_000, min: 0,  max:  50_000_000, isRupiah: true },
    { label: 'Rata-rata Insiden per bulan',            state: incidentsPerMonth, set: setIncidentsPerMonth, step: 1,         min: 1,  max: 30,          isRupiah: false },
  ];

  const systemRows = [
    { label: 'OPEX Sistem / bulan (hosting, maintenance)', state: systemCost,         set: setSystemCost,         step: 500_000,   min: 0, max:  20_000_000, isRupiah: true },
    { label: 'Biaya Implementasi (hardware + setup)',       state: implementationCost, set: setImplementationCost, step: 5_000_000, min: 0, max: 200_000_000, isRupiah: true },
  ];

  const results = [
    { label: 'Penghematan / Bulan', value: fmt(monthlySavings),           color: '#059669', sub: 'vs biaya manual' },
    { label: 'Penghematan / Tahun', value: fmt(annualSavings),            color: '#2563eb', sub: 'proyeksi tahunan' },
    { label: 'Break-Even Period',   value: `${paybackMonths.toFixed(1)} bulan`, color: '#d97706', sub: 'payback period' },
    { label: 'ROI 3 Tahun',        value: `${roi3Year.toFixed(0)}%`,      color: '#7c3aed', sub: 'return on investment' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="roi-grid">
        {/* Input: Manual Costs */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
            Biaya Operasional Manual Saat Ini
          </h3>
          {inputRows.map(({ label, state, set, step, min, max, isRupiah }) => (
            <div key={label} style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                {label}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={step}
                  value={state}
                  onChange={(e) => set(Number(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
                />
                <span className="roi-slider-value">
                  {isRupiah ? `Rp ${(state / 1_000_000).toFixed(1)}jt` : `${state}x`}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input: System Parameters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)' }}>
              Parameter Sistem SmartWarehouse AI
            </h3>
            {systemRows.map(({ label, state, set, step, min, max }) => (
              <div key={label} style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  {label}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={state}
                    onChange={(e) => set(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--accent-primary)' }}
                  />
                  <span className="roi-slider-value">
                    Rp {(state / 1_000_000).toFixed(1)}jt
                  </span>
                </div>
              </div>
            ))}

            {/* Reduction Rate */}
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Estimasi Pengurangan Insiden (AI vs Manual)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="range"
                  min={30}
                  max={95}
                  step={5}
                  value={reductionRate}
                  onChange={(e) => setReductionRate(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#059669' }}
                />
                <span className="roi-slider-value" style={{ color: '#059669' }}>
                  {reductionRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Cards */}
      <div className="roi-results-grid">
        {results.map(({ label, value, color, sub }) => (
          <div
            key={label}
            className="card"
            style={{ padding: '1.25rem', textAlign: 'center', borderTop: `3px solid ${color}` }}
          >
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{label}</p>
            <p style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color, lineHeight: 1.3, wordBreak: 'break-word' }}>{value}</p>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Business Case Summary */}
      <div className="card" style={{ padding: '1.25rem', background: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.2)' }}>
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <strong style={{ color: '#059669' }}>Kesimpulan Business Case:</strong>{' '}
          Dengan implementasi SmartWarehouse AI, PT. Kawan Lama dapat menghemat{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{fmt(annualSavings)}</strong> per tahun per gudang.
          Investasi awal{' '}
          <strong style={{ color: 'var(--text-primary)' }}>{fmt(implementationCost)}</strong> akan kembali dalam{' '}
          <strong style={{ color: '#d97706' }}>{paybackMonths.toFixed(1)} bulan</strong> dengan ROI 3 tahun sebesar{' '}
          <strong style={{ color: '#7c3aed' }}>{roi3Year.toFixed(0)}%</strong>.
        </p>
      </div>
    </div>
  );
}

/* ─── SOP Section ─── */
function SOPSection() {
  const [selected, setSelected] = useState('Snake');
  const sop = SOP_PROTOCOLS[selected];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Class Selector */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {Object.entries(SOP_PROTOCOLS).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setSelected(key)}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: '700',
              border: `2px solid ${selected === key ? val.color : 'var(--border-color)'}`,
              backgroundColor: selected === key ? val.bgColor : 'transparent',
              color: selected === key ? val.color : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
            }}
          >
            {key}
          </button>
        ))}
      </div>

      {/* SOP Card */}
      <div
        className="card"
        style={{ padding: '1.75rem', border: `1px solid ${sop.borderColor}`, background: sop.bgColor }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
            {sop.title}
          </h2>
          <span
            style={{
              padding: '0.3rem 0.9rem',
              borderRadius: '99px',
              fontSize: '0.7rem',
              fontWeight: '800',
              backgroundColor: sop.bgColor,
              color: sop.color,
              border: `1px solid ${sop.borderColor}`,
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
            }}
          >
            LEVEL: {sop.urgency}
          </span>
        </div>

        {/* Response Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
          {sop.steps.map((step, i) => {
            const iconFn = STEP_ICONS[step.iconType] || STEP_ICONS.report;
            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.875rem',
                  padding: '0.875rem 1rem',
                  backgroundColor: 'var(--bg-primary)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '8px',
                    backgroundColor: `${sop.color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {iconFn(sop.color)}
                </div>
                <div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      color: sop.color,
                      letterSpacing: '0.05em',
                      display: 'block',
                      marginBottom: '0.2rem',
                    }}
                  >
                    {step.time}
                  </span>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {step.action}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emergency Contacts */}
        <div style={{ marginBottom: '1rem' }}>
          <p
            style={{
              margin: '0 0 0.75rem 0',
              fontSize: '0.7rem',
              fontWeight: '700',
              color: 'var(--text-secondary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Kontak Darurat
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {sop.contacts.map((c, i) => (
              <div
                key={i}
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.82rem',
                }}
              >
                <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{c.label}: </span>
                <span style={{ color: 'var(--text-primary)', fontWeight: '700', fontFamily: 'monospace' }}>
                  {c.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Note */}
        <div
          style={{
            padding: '0.875rem 1rem',
            borderRadius: '10px',
            backgroundColor: `${sop.color}08`,
            border: `1px solid ${sop.borderColor}`,
            display: 'flex',
            gap: '0.625rem',
            alignItems: 'flex-start',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={sop.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Catatan Penting:</strong>{' '}
            {sop.note}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function SOPMitigasi() {
  const [activeTab, setActiveTab] = useState('sop');

  const tabs = [
    { id: 'sop', label: 'SOP Penanganan', desc: 'Protokol respons per jenis deteksi' },
    { id: 'roi', label: 'ROI Calculator',  desc: 'Kalkulasi penghematan biaya' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div className="card" style={{ padding: '1.5rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              backgroundColor: 'rgba(220,38,38,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              Mitigasi Risiko &amp; Business Value
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Protokol SOP penanganan insiden &amp; kalkulasi ROI implementasi SmartWarehouse AI
            </p>
          </div>
          <div
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backgroundColor: 'rgba(5,150,105,0.08)',
              border: '1px solid rgba(5,150,105,0.2)',
              fontSize: '0.78rem',
              fontWeight: '700',
              color: '#059669',
              flexShrink: 0,
            }}
          >
            PT. KAWAN LAMA GROUP
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              fontSize: '0.88rem',
              fontWeight: '700',
              border: `2px solid ${activeTab === tab.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
              backgroundColor: activeTab === tab.id ? 'rgba(99,102,241,0.08)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'sop' ? <SOPSection /> : <ROISection />}
    </div>
  );
}
