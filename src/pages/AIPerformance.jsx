import { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { useT } from '../hooks/useT';
import api from '../lib/apiClient';

/* ─── Inline SVG Icon Components ─── */
const Icons = {
  target: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
  ),
  barChart: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
  ),
  checkCircle: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  ),
  search: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
  ),
  cpu: (color) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
  ),
  zap: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  award: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>
  ),
  maximize: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
  ),
  // Animal icons
  snake: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19c0-3 2-5 5-5h4c3 0 5-2 5-5V7"/><path d="M18 4l2 3-2 3"/><circle cx="6" cy="19" r="1" fill={color || 'currentColor'}/></svg>
  ),
  cat: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c4.97 0 9-3.58 9-8V5l-4 2-5-3-5 3-4-2v9c0 4.42 4.03 8 9 8z"/><circle cx="9.5" cy="11" r="1" fill={color || 'currentColor'}/><circle cx="14.5" cy="11" r="1" fill={color || 'currentColor'}/><path d="M10 16c.5.5 1.5 1 2 1s1.5-.5 2-1"/></svg>
  ),
  lizard: (color) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color || 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 8c-2 0-3 1-3 3v2c0 1-1 2-3 2H9"/><path d="M6 15c-1.5 0-3 .5-3 2s1.5 2 3 2"/><circle cx="19" cy="5" r="2"/><path d="M9 15l-3 4"/><path d="M9 15l3 4"/></svg>
  ),
};

/* ─── Count-Up Animation Hook ─── */
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const animRef = useRef(null);
  const prevTarget = useRef(0);

  useEffect(() => {
    // Only animate if target actually changed to a valid number
    if (target === prevTarget.current || typeof target !== 'number' || target <= 0) return;
    prevTarget.current = target;

    // Small delay to ensure component is mounted
    const timeout = setTimeout(() => {
      const startTime = performance.now();
      const animate = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(parseFloat((eased * target).toFixed(2)));
        if (progress < 1) {
          animRef.current = requestAnimationFrame(animate);
        }
      };
      animRef.current = requestAnimationFrame(animate);
    }, 50);

    return () => {
      clearTimeout(timeout);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [target, duration]);

  return count;
}

/* ─── Animated Metric Card ─── */
function MetricCard({ label, targetValue, desc, color, iconFn }) {
  const displayValue = useCountUp(targetValue);
  return (
    <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>{label}</span>
        <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {iconFn(color)}
        </div>
      </div>
      <div style={{ fontSize: '2.25rem', fontWeight: '800', color, letterSpacing: '-0.025em', lineHeight: 1 }}>{displayValue}%</div>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{desc}</span>
    </div>
  );
}


export default function AIPerformance() {
  const t = useT();
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeArtifact, setActiveArtifact] = useState(null);

  useEffect(() => {
    api.getJson('/model-info')
      .then(data => {
        setModelInfo(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem 0' }}>
        <div className="skeleton" style={{ height: 32, width: 280 }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[1,2,3,4].map(i => <div key={i} className="skeleton-card" style={{ minHeight: 120 }}><div className="skeleton" style={{ height: 60 }} /></div>)}
        </div>
        <div className="skeleton-card" style={{ minHeight: 300 }}><div className="skeleton" style={{ height: 260 }} /></div>
      </div>
    );
  }

  if (error || !modelInfo || modelInfo.status === 'no_model') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', minHeight: '400px', textAlign: 'center' }}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 15h8"/><circle cx="9" cy="9" r="1"/><circle cx="15" cy="9" r="1"/></svg>
        <h3 style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{t.aiPerformance.noModelTitle}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: 400 }}>
          {t.aiPerformance.noModelDesc}
        </p>
      </div>
    );
  }

  const training = modelInfo.training;
  const metrics = training?.final_metrics;
  const artifacts = modelInfo.artifacts || [];

  const metricCards = metrics ? [
    { label: t.aiPerformance.mAP50, targetValue: metrics.mAP50, desc: t.aiPerformance.meanAvgPrecision, color: '#22c55e', iconFn: Icons.target },
    { label: t.aiPerformance.mAP5095, targetValue: metrics.mAP50_95, desc: t.aiPerformance.strictMap, color: '#3b82f6', iconFn: Icons.barChart },
    { label: t.aiPerformance.precision, targetValue: metrics.precision, desc: t.aiPerformance.truePositiveRate, color: '#a855f7', iconFn: Icons.checkCircle },
    { label: t.aiPerformance.recall, targetValue: metrics.recall, desc: t.aiPerformance.detectionCoverage, color: '#f59e0b', iconFn: Icons.search },
  ] : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Header */}
      <div>
        <h2 style={{ fontSize: 'clamp(1.375rem, 5vw, 1.875rem)', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>{t.aiPerformance.title}</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{t.aiPerformance.subtitle}</p>
      </div>

      {/* Model Info Banner */}
      <div className="card" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icons.cpu('var(--text-primary)')}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)' }}>{modelInfo.model_file || 'YOLO Model'}</h3>
            <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {modelInfo.framework} &middot; {modelInfo.base_model} &middot; {modelInfo.num_classes} classes &middot; {modelInfo.model_size_mb} MB
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {modelInfo.class_names?.map((cls, i) => (
            <span key={i} style={{
              padding: '0.375rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: '600',
              backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              textTransform: 'uppercase', letterSpacing: '0.05em'
            }}>{cls}</span>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      {metrics && (
        <div className="grid-4col">
          {metricCards.map((m, i) => (
            <MetricCard key={i} {...m} />
          ))}
        </div>
      )}

      {/* Training Info Bar */}
      {training && (
        <div className="grid-3col">
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
              {Icons.zap()}
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>{training.epochs_trained}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{t.aiPerformance.epochsTrained}</div>
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
              {Icons.award()}
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>Epoch {training.best_epoch}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{t.aiPerformance.bestMap}</div>
            </div>
          </div>
          <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
              {Icons.maximize()}
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>{modelInfo.input_resolution}px</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{t.aiPerformance.trainingResolution}</div>
            </div>
          </div>
        </div>
      )}

      {/* Training Curves */}
      {training?.training_curve && (
        <div className="grid-2col">
          {/* mAP Curve */}
          <div className="card" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column', padding: '1.5rem 2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t.aiPerformance.mapOverTraining}</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={training.training_curve} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mapGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="map95Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                  <XAxis dataKey="epoch" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} unit="%" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="mAP50" name="mAP@50" stroke="#22c55e" fill="url(#mapGrad)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="mAP50_95" name="mAP@50-95" stroke="#3b82f6" fill="url(#map95Grad)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Loss Curve */}
          <div className="card" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column', padding: '1.5rem 2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t.aiPerformance.validationLoss}</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={training.training_curve} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" opacity={0.5} />
                  <XAxis dataKey="epoch" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line type="monotone" dataKey="val_box_loss" name="Box Loss" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="val_cls_loss" name="Class Loss" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Training Artifacts Gallery */}
      {artifacts.length > 0 && (
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t.aiPerformance.trainingArtifacts}</h3>
          <div className="grid-4col">
            {artifacts.map((a) => {
              const isActive = activeArtifact === a.key;
              const iconColor = isActive ? 'var(--text-primary)' : 'var(--text-secondary)';
              const artifactIcons = {
                confusion_matrix: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/>
                    <rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>
                  </svg>
                ),
                confusion_matrix_normalized: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/>
                    <rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>
                    <line x1="3" y1="21" x2="21" y2="3" strokeDasharray="2 2"/>
                  </svg>
                ),
                results: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                ),
                BoxF1_curve: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 20 Q8 4 12 12 Q16 20 21 4"/>
                    <line x1="3" y1="20" x2="21" y2="20"/><line x1="3" y1="4" x2="3" y2="20"/>
                  </svg>
                ),
                BoxPR_curve: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 20 Q6 20 10 14 Q14 8 21 4"/>
                    <line x1="3" y1="20" x2="21" y2="20"/><line x1="3" y1="4" x2="3" y2="20"/>
                  </svg>
                ),
                BoxP_curve: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 20 7 8 12 14 17 6 21 10"/>
                    <line x1="3" y1="20" x2="21" y2="20"/><line x1="3" y1="4" x2="3" y2="20"/>
                  </svg>
                ),
                BoxR_curve: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 8 14 13 10 18 16 21 12"/>
                    <line x1="3" y1="20" x2="21" y2="20"/><line x1="3" y1="4" x2="3" y2="20"/>
                  </svg>
                ),
                labels: (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="14" width="4" height="7" rx="1"/><rect x="10" y="9" width="4" height="12" rx="1"/>
                    <rect x="17" y="4" width="4" height="17" rx="1"/>
                  </svg>
                ),
              };
              const icon = artifactIcons[a.key] || (
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
              );
              return (
                <button
                  key={a.key}
                  onClick={() => setActiveArtifact(isActive ? null : a.key)}
                  style={{
                    padding: '1rem 0.75rem', borderRadius: '12px',
                    border: isActive ? '2px solid var(--text-primary)' : '1px solid var(--border-color)',
                    backgroundColor: isActive ? 'var(--bg-tertiary)' : 'var(--bg-primary)',
                    cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.2s ease, background-color 0.2s ease',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
                  }}
                >
                  {icon}
                  <span style={{ fontSize: '0.7rem', fontWeight: '600', color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.3 }}>{a.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Artifact Viewer */}
          {activeArtifact && (
            <div style={{ marginTop: '1.5rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: '#0a0a0a' }}>
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {artifacts.find(a => a.key === activeArtifact)?.label}
                </span>
                <button onClick={() => setActiveArtifact(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.25rem' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <img
                src={api.streamUrl(`/training-artifacts/${activeArtifact}`)}
                alt={activeArtifact}
                style={{ width: '100%', display: 'block', maxHeight: '600px', objectFit: 'contain', padding: '1rem', backgroundColor: '#ffffff' }}
              />
            </div>
          )}
        </div>
      )}

      {/* Dataset Card */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: 'rgba(99,102,241,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Dataset Card</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>Training data provenance & augmentation pipeline</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 0.75rem 0' }}>Data Sources</p>
            {[
              { label: 'Roboflow Snake Detection', tag: 'Public Dataset', color: '#6366f1' },
              { label: 'Roboflow Cat & Lizard', tag: 'Public Dataset', color: '#6366f1' },
              { label: 'Custom Warehouse Footage', tag: 'Internal', color: '#22c55e' },
              { label: 'Low-light Augmented', tag: 'Synthetic', color: '#f59e0b' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.6rem 0.875rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.83rem', color: 'var(--text-primary)', fontWeight: '600' }}>{s.label}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '6px',
                  backgroundColor: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>{s.tag}</span>
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '0 0 0.75rem 0' }}>Augmentation Pipeline</p>
            {[
              { tech: 'Horizontal Flip', detail: 'p=0.5' },
              { tech: 'Brightness / Contrast', detail: '±30%' },
              { tech: 'Rotation', detail: '±15°' },
              { tech: 'Mosaic Mix', detail: '4-image mosaic' },
              { tech: 'CLAHE (inference)', detail: 'clipLimit=2.5, tile=8×8' },
              { tech: 'Partial Occlusion', detail: 'Hewan di balik barang' },
            ].map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.5rem 0.875rem', borderRadius: '8px', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#22c55e', fontSize: '0.9rem' }}>✓</span>
                  <span style={{ fontSize: '0.83rem', color: 'var(--text-primary)', fontWeight: '600' }}>{a.tech}</span>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{a.detail}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginTop: '1.25rem', padding: '0.875rem 1rem', borderRadius: '10px',
          backgroundColor: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)' }}>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: '#6366f1' }}>Anti False-Positive Measure:</strong> Dataset mencakup gambar <strong style={{ color: 'var(--text-primary)' }}>tali, selang, dan kabel</strong> yang <em>tidak</em> di-label sebagai ular — memastikan model belajar membedakan objek serupa. Dikombinasikan dengan aspect-ratio bounding box filter di inference time.
          </p>
        </div>
      </div>

      {/* Risk Classification Reference */}
      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>{t.aiPerformance.detectionClassMapping}</h3>
        <div className="grid-3col">
          {[
            { cls: 'Snake', risk: 'DANGER', color: 'var(--alert-danger)', bg: 'var(--alert-danger-bg)', action: t.aiPerformance.immediateEvacuation, iconFn: Icons.snake },
            { cls: 'Cat', risk: 'WARNING', color: 'var(--alert-warning)', bg: 'var(--alert-warning-bg)', action: t.aiPerformance.contaminationAlert, iconFn: Icons.cat },
            { cls: 'Gecko / Lizard', risk: 'MONITOR', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', action: t.aiPerformance.logInspect, iconFn: Icons.lizard },
          ].map((item, i) => (
            <div key={i} style={{ padding: '1.25rem', borderRadius: '12px', backgroundColor: item.bg, border: `1px solid ${item.color}22`, display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.iconFn(item.color)}
              </div>
              <div>
                <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.cls}</div>
                <span style={{ fontSize: '0.65rem', fontWeight: '700', padding: '0.2rem 0.5rem', borderRadius: '6px', backgroundColor: item.color, color: '#fff' }}>{item.risk}</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0 0', lineHeight: 1.4 }}>{item.action}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
