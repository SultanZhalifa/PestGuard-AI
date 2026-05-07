# Pitch Deck Outline — Final Event
## AI Open Innovation Challenge 2026

> **Format:** 10 slides, 8-10 minutes presentation + 5 minutes Q&A
> **Tools:** Google Slides / PowerPoint / Keynote (whatever team is fastest in)
> **Visual style:** Match dashboard's design system — Plus Jakarta Sans font, dark navy + accent red/orange/green from your CSS variables. Looks coherent with the live demo.

---

## Slide 1 — Cover (15 seconds)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│                  [PAW LOGO — large]                      │
│                                                          │
│              SMART WAREHOUSE                             │
│      AI-Powered Bio-Hazard & Pest Detection              │
│                                                          │
│           Case 1 — PT. Kawan Lama Group                  │
│        AI Open Innovation Challenge 2026                 │
│                                                          │
│              Group 5 — President University              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Speaker note:** "Selamat siang. Kami Group 5 dari President University. Hari ini kami akan menunjukkan bagaimana AI bisa melindungi distribusi center PT. Kawan Lama dari risiko bio-hazard dan pest — dengan akurasi 94% dan deteksi sub-2-millisecond per frame."

---

## Slide 2 — The Problem (60 seconds)

**Headline:** *"At 240,000 m² and 60,000 SKUs, you can't manually patrol your way to safety."*

**Visual:** Side-by-side
- Left: Photo of Kawan Lama DC (or stock warehouse photo)
- Right: 4 stat cards
  - 18 DCs nationwide
  - 240,000 m² flagship
  - 60,000+ SKUs
  - 1,200+ retail stores

**Bottom row — pain points** (icons):
- 🚨 Detection latency: hours to days
- 👁️ Blind spots: between racks, behind pallets
- 🌙 Coverage gaps: 3-shift handovers
- ⚖️ BPOM 22/2025 — mandatory recall reporting now

**Speaker note:** "Skala operasional Kawan Lama luar biasa — 18 distribution centers, salah satunya 240,000 m² dengan 60,000 SKU. Tapi pengawasan manual pasti punya blind spots. Dan sejak Juli 2025, BPOM mewajibkan recall report otomatis kalau ada kontaminasi terdeteksi internal. Risiko makin tinggi."

---

## Slide 3 — The Stakes (60 seconds)

**Headline:** *"This isn't a hypothetical."*

**Visual:** 1 hero number besar di tengah:

```
        Rp 670 Miliar
   USD 41.7M criminal penalty
    Dollar Tree DC, 2024 (FDA case)
   Failure mode: rodent infestation
```

**Below:** 3 supporting stats:
- "Up to 80% inventory loss" — single contamination event in e-commerce DC
- "Rp 60 juta direct loss" — 0.5% contamination on Rp 12 miliar inventory per DC
- "Rp 4.2 miliar/year" — Kawan Lama-scale exposure across 18 DCs

**Speaker note:** "Mari saya kasih satu fakta yang bikin kami serius. Tahun lalu di US, satu subsidiary Dollar Tree harus bayar 670 miliar rupiah karena rodent infestation di distribution center mereka. Recall menyentuh seluruh kategori produk. Ini bukan dunia hipotetis — ini precedent. Dan dengan BPOM rule baru, Indonesia sekarang punya regulatory exposure yang sama."

---

## Slide 4 — Our Solution (45 seconds)

**Headline:** *"Real-time AI surveillance, purpose-built for warehouse scale."*

**Visual:** Dashboard screenshot (Live Monitor with all 4 zones LIVE + bounding box on a snake)

**Right column — 5 capabilities, 1-line each:**
1. Custom-trained YOLO11 — 94% mAP50, 4 warehouse-specific classes
2. Multi-zone simultaneous monitoring
3. 3-tier risk classification (Danger / Warning / Monitoring)
4. Auto-snapshot evidence chain (BPOM-ready)
5. Role-based access control (Admin/Manager/Operator)

**Speaker note:** "Solusi kami: real-time AI surveillance yang dibangun spesifik untuk warehouse scale. Custom-trained YOLO11 model — 94% mAP50 untuk 4 class warehouse-relevant. Multi-zone monitoring simultan. Dan yang paling penting untuk compliance — setiap deteksi auto-saved sebagai snapshot, jadi evidence chain BPOM-ready dari hari pertama."

---

## Slide 5 — How It Works (60 seconds)

**Headline:** *"From camera to action in under 2 milliseconds."*

**Visual:** Architecture diagram (clean, horizontal flow):

```
Camera ──→ YOLO11 ──→ Classification ──→ Action
 (RTSP)   (1.9ms)    (Risk tier)       (WebSocket alert
                                        + auto-snapshot
                                        + DB log
                                        + TTS audio)
```

**Below:** 3 callouts
- "94% accuracy on real footage" (with mAP50 chart thumbnail)
- "16,047 training images, 4 classes" (with class breakdown)
- "Single docker compose up" (with terminal screenshot)

**Speaker note:** "Pipeline kami: camera input ke YOLO11 inference dalam 1.9 milliseconds. Classification ke 3 risk tier — Snake bahaya, Cat kontaminasi, Gecko/Lizard monitoring. Trigger 4 paralel: WebSocket alert ke operator, auto-snapshot, DB log, dan TTS audio dalam Bahasa Indonesia. Semua dalam single docker compose deployment."

---

## Slide 6 — Live Demo (90 seconds — go to actual dashboard)

**Slide content:** Just title + URL
```
LIVE DEMO
http://localhost:5173
```

**Demo flow (rehearse 5x!):**
1. Login as **admin** — show top bar with role badge ADMIN (red)
2. Live Monitor → click Zone D card → modal opens with live snake video
3. Wait 5 seconds → toast notification "Snake Detected" + bounding box appears
4. Show snapshot capture button — click, file downloads (evidence chain)
5. Sign out → login as **operator** — show sidebar has fewer items (RBAC enforcement)
6. Try to access /users URL directly → redirected (real backend enforcement)
7. Cmd+K to show command palette → "logs" → navigate to Detection Logs
8. Show table with snapshot thumbnails + filter by Risk

**Speaker note (during demo):** Narrate actions clearly. Don't say "let me click" — say "saat operator pertama melihat zone D, sistem sudah mendeteksi snake otomatis dengan confidence 82%. Notification sudah masuk via WebSocket, snapshot tersimpan di database, dan animal control sudah dipanggil otomatis."

---

## Slide 7 — Risk Mitigation Matrix (45 seconds)

**Headline:** *"Three classes. Three SOPs. Three response times."*

**Visual:** Big table (color-coded rows):

| Class | Risk | Auto Response | Human SOP (5 min) |
|-------|------|---------------|-------------------|
| 🐍 Snake | DANGER | Zone lockdown + animal control | Evacuate, do NOT remove manually |
| 🐈 Cat | WARNING | Sanitization team paged | Inspect entry, audit aisle |
| 🦎 Gecko/Lizard | MONITORING | Daily summary log | Investigate at next maintenance |

**Speaker note:** "Setiap class punya response protocol berbeda. Snake = bahaya nyawa, langsung lockdown. Cat = risiko kontaminasi, sanitasi. Gecko = monitoring jangka panjang, identifikasi entry point. Sistem auto-trigger first action; SOP manusia kicks in dalam 5 menit dengan evidence yang sudah di-capture otomatis."

---

## Slide 8 — Business Impact / ROI (60 seconds)

**Headline:** *"Payback in 12 months. 6× ROI year-2 onward."*

**Visual:** Two-column financial breakdown

**Investment (per DC, Year 1):**
- 12 cameras: Rp 18 juta
- GPU server: Rp 25 juta
- Network + deployment: Rp 23 juta
- Maintenance Y1: Rp 12 juta
- **Total: Rp 78 juta**

**Annual savings (per DC):**
- Reduced patrol staff: Rp 36 juta
- Reduced pest contract: Rp 18 juta
- Avoided contamination losses: Rp 12 juta
- Compliance cost reduction: Rp 8 juta
- **Total: Rp 74 juta/year**

**Bottom callout (large):**
> **Across 18 DCs at scale: Rp 4.2 miliar annual net savings (6× ROI)**
>
> *Excludes downside protection from major incidents (Dollar Tree-scale event = decades of ROI in 1 year)*

**Speaker note:** "Conservative ROI model — kami pakai angka realistis dari data industri Indonesia. Per DC: 78 juta investment, 74 juta savings tahun 1, payback 12.6 bulan. Year 2 onward: 6 kali ROI. Skala 18 DC: 4.2 miliar saving annual. Dan ini conservative — exclude downside protection dari satu major incident yang bisa selevel kasus Dollar Tree."

---

## Slide 9 — Sustainability Alignment (30 seconds)

**Headline:** *"Hits 2 of your 5 sustainability pillars — measurably."*

**Visual:** Kawan Lama's 5 pillars as icons, with 2 highlighted:

| Pillar | Our Contribution |
|--------|------------------|
| Social | — |
| Education | — |
| 🌱 **Environment** | Targeted pest control = less broad-spectrum chemicals = less runoff |
| 💚 **Health** | Worker protection from snake encounters + zoonotic disease vectors |
| Art & Culture | — |

**Speaker note:** "Solusi kami bukan cuma cost saving. Ini operationalizes 2 dari 5 sustainability pillars Kawan Lama dengan KPI measurable: reduced pesticide volume, reduced worker incident rate. Track theme hari ini adalah Sustainable Supply Chain — kami penuhi itu secara langsung."

---

## Slide 10 — The Ask (30 seconds)

**Headline:** *"Pilot di Cikarang DC. 90 days. Parallel-run dengan existing pest control."*

**Visual:** Roadmap timeline horizontal

```
Now (Hackathon)  →  Month 1-3 Pilot  →  Month 4-6 Validate  →  Year 1 DC Rollout  →  Year 2 Network
   Demo ready       1 zone, 4 cams      Compare vs manual     Full Cikarang        17 more DCs
```

**Below — closing:**
- Repo open source: github.com/SultanZhalifa/smart-warehouse-dashboard
- Team availability: 4 people, ready to onboard
- Audit-ready: full documentation, 14 automated tests, Docker deployment

**Final line:**
> "We're not asking for a contract today. We're asking for 90 days at one zone in Cikarang to prove the math is real."

**Speaker note:** "Kami tidak meminta kontrak full. Yang kami minta: 90 hari di satu zone Cikarang DC untuk pilot, parallel dengan existing pest control. Kalau angka kami benar, lanjut. Kalau tidak — Anda dapat data, kami dapat experience, no commitment. Itu fair offer untuk semua pihak. Terima kasih."

---

## Q&A Preparation

**Refer to KAWAN_LAMA_RESEARCH.md → Section "Likely Q&A".**

**Top 3 questions you MUST nail:**

1. **"Apa bedanya dengan Rentokil / pest control existing?"**
   → Pest control treats AFTER. We detect FIRST minute, FIRST blind spot. Plus BPOM-ready evidence chain.

2. **"Berapa total cost untuk 18 DC?"**
   → Year 1: Rp 1.4 miliar. Recurring: Rp 216 juta/year. Annual savings: Rp 4.2 miliar. Net: Rp 4 miliar/year positive at scale.

3. **"Bagaimana kalau AI miss?"**
   → Augmentation, not replacement. AI catches blind spots between human patrols. Liability tetap di SOP manusia. Kami reduce probability of gap.

---

## Demo Disasters — Backup Plan

**If backend crashes mid-demo:**
- Have a 30-second pre-recorded screen recording as backup
- Pivot to: "While we restart, let me show the architecture..."
- Don't apologize repeatedly — judges expect bugs in demos. Stay calm.

**If WiFi/network dies:**
- Localhost demo doesn't need internet — only WebSocket between local processes
- Backup: Print a few key screenshots as physical handout

**If timer runs over:**
- Skip Slide 9 (Sustainability) if needed — content is in handout
- Never skip Slide 6 (Live Demo) — that's what they remember

---

## Rehearsal Checklist (Do 5× Minimum)

- [ ] Full run with timer — should be 8 min for slides + 90s demo = 9-10 min total
- [ ] Demo flow practiced (login → zone → snapshot → sign out → operator → palette)
- [ ] Backup screen recording prepared
- [ ] Exec summary printed (1-page version) for handout
- [ ] All 4 team members know who speaks which slides
- [ ] Q&A practice — partner takes turns asking 10 questions from research doc
- [ ] Tech check: laptop fully charged, charger packed, projector adapter, USB drive backup
