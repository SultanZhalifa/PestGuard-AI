/**
 * Detection risk levels, class mappings, and SOP protocols.
 * Single source of truth for all detection-related constants.
 * Import from here instead of hardcoding strings across components.
 */

/** @type {Record<string, 'danger'|'warning'|'info'>} */
export const DETECTION_RISK_MAP = {
  Snake: 'danger',
  Cat: 'warning',
  Gecko: 'info',
  Lizard: 'info',
};

/** Risk level color tokens (warm-toned) */
export const RISK_COLORS = {
  danger: '#b91c1c',
  warning: '#b45309',
  info:    '#0f766e',
};

/** Risk level background tokens (warm-toned) */
export const RISK_BGS = {
  danger:  'rgba(185,28,28,0.08)',
  warning: 'rgba(180,83,9,0.08)',
  info:    'rgba(15,118,110,0.08)',
};

/** Human-readable risk labels */
export const RISK_LABELS = {
  danger:  'HAZARD',
  warning: 'WARNING',
  info:    'MONITOR',
};

/**
 * SOP protocol data per detection class.
 * Each entry contains urgency level, response steps, emergency contacts,
 * and a safety note.
 */
export const SOP_PROTOCOLS = {
  Snake: {
    title: 'SOP Bio-Hazard — Ular Terdeteksi',
    urgency: 'KRITIS',
    color: '#b91c1c',
    bgColor: 'rgba(185,28,28,0.08)',
    borderColor: 'rgba(185,28,28,0.3)',
    steps: [
      {
        time: '0–30 detik',
        action: 'Aktifkan alarm zona dan umumkan evakuasi via speaker gudang',
        iconType: 'alert',
      },
      {
        time: '30–120 detik',
        action: 'Hubungi pest control dan K3 Manager segera via jalur darurat',
        iconType: 'phone',
      },
      {
        time: '2–5 menit',
        action: 'Isolasi zona dengan barrier fisik, pasang tanda peringatan K3',
        iconType: 'barrier',
      },
      {
        time: '5–30 menit',
        action: 'Dokumentasi snapshot sistem, tunggu penanganan pest control terlatih',
        iconType: 'camera',
      },
      {
        time: '> 30 menit',
        action: 'Buat laporan insiden K3 tertulis, inspeksi semua celah masuk zona',
        iconType: 'report',
      },
    ],
    contacts: [
      { label: 'Pest Control 24H', value: '119 ext. 8' },
      { label: 'K3 Manager',        value: '(021) 2952-3000 ext. 205' },
      { label: 'Security Supervisor', value: '(021) 2952-3000 ext. 301' },
    ],
    note: 'JANGAN mendekati ular tanpa perlengkapan APD. Tunggu petugas pest control yang terlatih dan bersertifikat.',
  },

  Cat: {
    title: 'SOP Kontaminasi — Kucing Terdeteksi',
    urgency: 'SEDANG',
    color: '#b45309',
    bgColor: 'rgba(180,83,9,0.08)',
    borderColor: 'rgba(180,83,9,0.3)',
    steps: [
      {
        time: '0–5 menit',
        action: 'Karantina produk di area yang terdeteksi, pasang segel penahanan',
        iconType: 'package',
      },
      {
        time: '5–15 menit',
        action: 'Keluarkan hewan dari area gudang dengan prosedur aman',
        iconType: 'exit',
      },
      {
        time: '15–30 menit',
        action: 'Lakukan sanitasi area dengan disinfektan standar food-grade',
        iconType: 'clean',
      },
      {
        time: '30–60 menit',
        action: 'Inspeksi QC terhadap produk yang mungkin terkontaminasi',
        iconType: 'inspect',
      },
      {
        time: '1–2 jam',
        action: 'Periksa dan tutup semua titik masuk yang teridentifikasi',
        iconType: 'lock',
      },
    ],
    contacts: [
      { label: 'QC Supervisor',  value: '(021) 2952-3000 ext. 411' },
      { label: 'Sanitasi Team',  value: '(021) 2952-3000 ext. 420' },
    ],
    note: 'Produk yang bersentuhan langsung dengan hewan wajib dikarantina dan melalui pemeriksaan QC sebelum kembali ke distribusi.',
  },

  Gecko: {
    title: 'SOP Monitoring — Gecko / Kadal Terdeteksi',
    urgency: 'RENDAH',
    color: '#047857',
    bgColor: 'rgba(4,120,87,0.08)',
    borderColor: 'rgba(4,120,87,0.3)',
    steps: [
      {
        time: 'Hari ini',
        action: 'Catat lokasi deteksi di sistem, dokumentasikan snapshot dari dashboard',
        iconType: 'note',
      },
      {
        time: '1–2 hari',
        action: 'Inspeksi celah, ventilasi, dan saluran air di zona terkait',
        iconType: 'inspect',
      },
      {
        time: '1 minggu',
        action: 'Evaluasi tren frekuensi — jika meningkat, eskalasi ke pest control',
        iconType: 'chart',
      },
    ],
    contacts: [
      { label: 'Maintenance Team', value: '(021) 2952-3000 ext. 501' },
    ],
    note: 'Gecko dan kadal bukan ancaman langsung, namun kehadirannya menunjukkan adanya celah masuk yang perlu segera ditutup.',
  },
};

/**
 * ROI calculator presets (in IDR), per distribution center.
 * Two scenarios are offered so stakeholders see a downside-protected planning range:
 *  - conservative: partial patrol replacement + 30% pest-contract offset.
 *    Produces ~Rp 76 jt/yr savings, ~12.4 month payback (matches Executive Summary).
 *  - aggressive: offsets the full manual pest-control contract (Rp 15-30 jt/mo).
 *    Produces ~Rp 214 jt/yr savings, ~4.4 month payback (matches proposal upside).
 */
export const ROI_PRESETS = {
  conservative: {
    pestControl:         1_500_000,
    staffCost:           3_000_000,
    incidentLoss:        4_000_000,
    incidentsPerMonth:   1,
    systemCost:          1_000_000,
    implementationCost: 78_000_000,
    reductionRate:       70,
  },
  aggressive: {
    pestControl:        15_000_000,
    staffCost:           3_000_000,
    incidentLoss:        4_000_000,
    incidentsPerMonth:   1,
    systemCost:          3_000_000,
    implementationCost: 78_000_000,
    reductionRate:       70,
  },
};

/** Backward-compatible default (conservative scenario). */
export const ROI_DEFAULTS = ROI_PRESETS.conservative;
