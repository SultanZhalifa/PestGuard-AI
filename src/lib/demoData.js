/**
 * PestGuard AI — Demo Mode Data
 * ================================
 * Realistic sample data served when the app runs WITHOUT a backend
 * (e.g. the public Vercel deployment). Lets judges log in and explore the
 * full dashboard without a live server.
 *
 * Activated by the `VITE_DEMO_MODE=true` environment variable, which is set
 * ONLY on the public deployment — local development with a real backend is
 * unaffected.
 */

const DEMO_USERNAME = 'demo';
const DEMO_PASSWORD = 'demo123';

const DEMO_USER = {
  username: DEMO_USERNAME,
  name: 'Demo Reviewer',
  role: 'admin',
  must_change_password: false,
};

// ─── Detection logs (last few days, varied risk levels) ───
const ZONES = ['Main Warehouse', 'Storage Area', 'Loading Dock', 'Entrance Gate'];
const SPECIES = [
  { type: 'Snake', risk: 'danger' },
  { type: 'Cat', risk: 'warning' },
  { type: 'Gecko', risk: 'info' },
  { type: 'Lizard', risk: 'info' },
];

function pad(n) { return String(n).padStart(2, '0'); }

function buildLogs() {
  const logs = [];
  const now = new Date();
  // 64 detections spread over the last 7 days
  for (let i = 0; i < 64; i++) {
    const sp = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    const zone = ZONES[Math.floor(Math.random() * ZONES.length)];
    const d = new Date(now.getTime() - Math.random() * 7 * 24 * 3600 * 1000);
    const conf = (78 + Math.random() * 20).toFixed(1);
    logs.push({
      id: 1000 + i,
      type: sp.type,
      risk: sp.risk,
      location: zone,
      zone,
      confidence: `${conf}%`,
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`,
      timestamp: d.toISOString(),
      snapshot: null,
    });
  }
  // newest first
  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

const DEMO_LOGS = buildLogs();

const DEMO_SETTINGS = {
  cameraUrl: '0',
  cameraZone: 'Zone A',
  threshold: 50,
  notifications: true,
  darkMode: false,
};

const DEMO_CAMERAS = [
  { id: 'zone-a', name: 'Zone A', location: 'Main Warehouse', status: 'standby', source_type: 'webcam', has_source: true, detection_count: 18, last_risk: 'danger', last_detection: '2 min ago' },
  { id: 'zone-b', name: 'Zone B', location: 'Storage Area', status: 'standby', source_type: 'video', has_source: true, detection_count: 12, last_risk: 'warning', last_detection: '15 min ago' },
  { id: 'zone-c', name: 'Zone C', location: 'Loading Dock', status: 'standby', source_type: 'video', has_source: true, detection_count: 9, last_risk: 'info', last_detection: '1 hr ago' },
  { id: 'zone-d', name: 'Zone D', location: 'Entrance Gate', status: 'standby', source_type: 'video', has_source: true, detection_count: 25, last_risk: 'danger', last_detection: '8 min ago' },
];

const DEMO_STATUS = {
  status: 'Active',
  active_zones: ['zone-a', 'zone-b', 'zone-c', 'zone-d'],
  ai_performance: { inference_time: 42, model: 'YOLO11-Nano' },
};

// ─── Analytics (trend / distribution / zone activity) ───
// Pre-generate trend data ONCE at module load so it stays consistent across tab clicks.
function _buildTrend(range) {
  const buckets = range === 'daily' ? 24 : range === 'monthly' ? 30 : 7;
  const labelFor = (i) => {
    if (range === 'daily') return `${pad(i)}:00`;
    if (range === 'monthly') {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
    }
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return dayNames[d.getDay() === 0 ? 6 : d.getDay() - 1];
  };

  return Array.from({ length: buckets }, (_, i) => {
    const s = Math.random() < 0.3 ? Math.floor(Math.random() * 2) : 0;
    const c = Math.random() < 0.5 ? Math.floor(Math.random() * 4) : 0;
    const g = Math.floor(Math.random() * 6);
    return { name: labelFor(i), Snake: s, Cat: c, Gecko: g };
  });
}

// Cache all three ranges at module load — data is stable across tab switches
const _TREND_CACHE = {
  daily: _buildTrend('daily'),
  weekly: _buildTrend('weekly'),
  monthly: _buildTrend('monthly'),
};

const _DISTRIBUTION = [
  { name: 'Snake', value: 9, risk: 'danger', color: 'var(--alert-danger)' },
  { name: 'Cat', value: 21, risk: 'warning', color: 'var(--alert-warning)' },
  { name: 'Gecko', value: 18, risk: 'info', color: 'var(--alert-success)' },
  { name: 'Lizard', value: 16, risk: 'info', color: 'var(--alert-success)' },
];

const _ZONE_ACTIVITY = ZONES.map((z, i) => ({ zone: z, detections: [18, 12, 9, 25][i] }));

function buildAnalytics(range = 'weekly') {
  return {
    trend: _TREND_CACHE[range] || _TREND_CACHE.weekly,
    distribution: _DISTRIBUTION,
    zone_activity: _ZONE_ACTIVITY,
  };
}

// Pre-cache zone stats so values stay stable across calls
const _ZONE_STATS_CACHE = {};
DEMO_CAMERAS.forEach(cam => {
  const total = cam.detection_count;
  _ZONE_STATS_CACHE[cam.id] = {
    total_today: Math.floor(total / 3),
    total_all: total,
    avg_confidence: (85 + Math.random() * 8).toFixed(1),
    breakdown: [
      { type: 'snake', count: Math.floor(total * 0.15) },
      { type: 'cat', count: Math.floor(total * 0.35) },
      { type: 'gecko', count: Math.floor(total * 0.30) },
      { type: 'lizard', count: Math.floor(total * 0.20) },
    ].filter(b => b.count > 0),
  };
});

function buildZoneStats(zoneId) {
  return _ZONE_STATS_CACHE[zoneId] || { total_today: 0, total_all: 0, avg_confidence: '0', breakdown: [] };
}

// Model info (mirrors the real /api/model-info, with our actual metrics)
const DEMO_MODEL_INFO = {
  status: 'loaded',
  model_file: 'warehouse_pest.pt',
  model_size_mb: 5.2,
  num_classes: 4,
  class_names: ['snake', 'cat', 'gecko', 'lizard'],
  input_resolution: 640,
  inference_resolution: 320,
  framework: 'Ultralytics YOLO11',
  base_model: 'yolo11n (Nano)',
  task: 'Object Detection',
  use_case: 'Bio-Hazard & Pest Detection (Snake, Cat, Gecko/Lizard)',
  risk_classification: {
    danger: 'Snake — Bio-Hazard (immediate evacuation)',
    warning: 'Cat — Contamination (sanitization required)',
    info: 'Gecko/Lizard — Monitoring (entry point inspection)',
  },
  training: {
    epochs_trained: 50,
    best_epoch: 50,
    final_metrics: { precision: 92.78, recall: 91.22, mAP50: 94.03, mAP50_95: 76.4 },
    final_loss: { box_loss: 0.82, cls_loss: 0.51, dfl_loss: 0.95 },
    training_curve: Array.from({ length: 50 }, (_, i) => ({
      epoch: i + 1,
      mAP50: Math.min(94.03, 30 + i * 1.4 + Math.random() * 3),
      mAP50_95: Math.min(76.4, 15 + i * 1.25 + Math.random() * 2),
      precision: Math.min(92.78, 40 + i * 1.1 + Math.random() * 3),
      recall: Math.min(91.22, 38 + i * 1.1 + Math.random() * 3),
      val_box_loss: Math.max(0.82, 2.5 - i * 0.035),
      val_cls_loss: Math.max(0.51, 2.0 - i * 0.03),
    })),
  },
  artifacts: [],
};

/**
 * Resolve a demo response for a given path + method.
 * Returns `undefined` if the path is not handled (caller should fall through).
 */
export function getDemoResponse(path, method = 'GET', body = null) {
  const p = path.split('?')[0];
  const query = path.includes('?') ? path.split('?')[1] : '';

  // ─── Auth ───
  if (p === '/login' && method === 'POST') {
    // Validate real credentials — reject wrong username/password
    if (
      !body ||
      body.username !== DEMO_USERNAME ||
      body.password !== DEMO_PASSWORD
    ) {
      return { __demo_error: true, status: 401, detail: 'Invalid username or password.' };
    }
    return { token: 'demo-token-pestguard', user: DEMO_USER };
  }
  if (p === '/verify-token') return { status: 'valid', user: DEMO_USER };
  if (p === '/logout') return { status: 'success' };

  // ─── Forgot Password (demo: returns a fixed OTP for realistic flow) ───
  if (p === '/forgot-password' && method === 'POST') {
    return {
      status: 'success',
      message: 'Demo mode — reset code generated.',
      otp_code: '123456',
    };
  }
  if (p === '/reset-password' && method === 'POST') {
    if (!body || body.code !== '123456') {
      return { __demo_error: true, status: 400, detail: 'Invalid reset code.' };
    }
    return { status: 'success', message: 'Password updated successfully (demo mode).' };
  }

  // ─── Core data ───
  if (p === '/logs') return DEMO_LOGS;
  if (p === '/settings') return DEMO_SETTINGS;
  if (p === '/status') return DEMO_STATUS;
  if (p === '/cameras') return DEMO_CAMERAS;
  if (p === '/model-info') return DEMO_MODEL_INFO;
  if (p === '/health') return { status: 'healthy', version: '2.0.0', model_loaded: true, demo: true };

  // ─── Analytics ───
  if (p === '/analytics') {
    const range = new URLSearchParams(query).get('time_range') || 'weekly';
    return buildAnalytics(range);
  }

  // ─── Per-zone stats ───
  const zoneStatsMatch = p.match(/^\/zones\/([\w-]+)\/stats$/);
  if (zoneStatsMatch) return buildZoneStats(zoneStatsMatch[1]);

  // ─── Users (admin page) ───
  if (p === '/users') {
    return [
      { id: 1, username: 'admin', name: 'IT Administrator', role: 'admin', email: 'admin@kawanlama.com' },
      { id: 2, username: 'manager', name: 'Warehouse Manager', role: 'manager', email: 'manager@kawanlama.com' },
      { id: 3, username: 'operator', name: 'Shift Operator', role: 'operator', email: 'operator@kawanlama.com' },
    ];
  }

  // ─── Writes / toggles — accept and no-op in demo ───
  if (method === 'POST' || method === 'PATCH' || method === 'PUT' || method === 'DELETE') {
    return { status: 'success', message: 'Demo mode — action simulated (no backend).' };
  }

  return undefined;
}

export const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';
