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

/** Risk level color tokens */
export const RISK_COLORS = {
  danger: '#dc2626',
  warning: '#d97706',
  info:    '#2563eb',
};

/** Risk level background tokens */
export const RISK_BGS = {
  danger:  'rgba(220,38,38,0.08)',
  warning: 'rgba(217,119,6,0.08)',
  info:    'rgba(37,99,235,0.08)',
};

/** Human-readable risk labels */
export const RISK_LABELS = {
  danger:  'HAZARD',
  warning: 'WARNING',
  info:    'INFO',
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
    color: '#dc2626',
    bgColor: 'rgba(220,38,38,0.08)',
    borderColor: 'rgba(220,38,38,0.3)',
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
    color: '#d97706',
    bgColor: 'rgba(217,119,6,0.08)',
    borderColor: 'rgba(217,119,6,0.3)',
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
    color: '#059669',
    bgColor: 'rgba(5,150,105,0.08)',
    borderColor: 'rgba(5,150,105,0.3)',
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

/** Default ROI calculator values (in IDR) */
export const ROI_DEFAULTS = {
  pestControl:        15_000_000,
  staffCost:           8_000_000,
  incidentLoss:        5_000_000,
  incidentsPerMonth:   3,
  systemCost:          3_000_000,
  implementationCost: 25_000_000,
  reductionRate:       70,
};
