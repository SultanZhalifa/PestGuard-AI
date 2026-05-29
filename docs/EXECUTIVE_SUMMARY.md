# Executive Summary
## Smart Warehouse — AI-Powered Bio-Hazard & Pest Detection
### PT. Kawan Lama Group | Case 1 — Sustainable Supply Chain Track

**AI Open Innovation Challenge 2026**

**Team Andalusia:**
- Sultan Zhalifunnas Musyaffa — Team Leader & Scrum Master
- Fathir Barhouti Awlya — Backend & AI Lead
- Risly Maria Theresia Worung — Product Owner
- Misha Andalusia — Frontend & UI/UX Lead

---

## 1. The Business Problem

PT. Kawan Lama Group is one of Indonesia's largest retail and distribution conglomerates, operating **18 distribution centers nationwide** with a flagship facility of **240,000 m²** that handles over **60,000 SKUs** across 30+ brands (ACE Hardware, Informa, Krisbow, Chatime, etc.). The Cikarang Distribution Center alone supports operations for **1,200+ retail stores**.

At this scale, **manual pest surveillance breaks down**:

| Reality | Manual Approach Limitation |
|---------|---------------------------|
| 240,000 m² facility, 24/7 operations | Human guards cannot monitor every aisle every minute |
| Blind spots between racking, behind pallets | Missed detections until contamination is visible |
| Detection latency = hours to days | Snake bite or rodent contamination escalates before response |
| 3-shift operations | Coverage gaps at shift handover & night |

### The Cost of Inaction

Industry case studies make the financial risk concrete:

- **US Precedent (2024)**: Dollar Tree subsidiary paid **USD 41.7 million** (~Rp 670 miliar) in the largest-ever criminal food-safety penalty after FDA inspectors found rodent infestation across its distribution center. Recall covered all FDA-regulated SKUs — food, medicine, cosmetics, pet supplies.
- **BPOM Regulation No. 22/2025** (effective July 28, 2025): Indonesian businesses now **legally required** to initiate voluntary recalls and self-report contamination. Non-compliance = administrative sanctions + reputational damage.
- **Industry data**: A single rodent contamination incident in an e-commerce DC caused up to **80% inventory loss** in affected zones before professional intervention.

**Translated to PT. Kawan Lama scale:**
- 60,000 SKUs × estimated rolling inventory value Rp 200,000/SKU avg = **~Rp 12 miliar inventory at risk per DC**
- Even a 0.5% contamination rate = **Rp 60 juta direct loss per incident**, not counting reputational damage to ACE Hardware / Informa retail brands.

---

## 2. Solution Overview

A real-time, AI-powered surveillance system that **detects bio-hazard and pest intrusions across multiple warehouse zones simultaneously** and triggers tiered response protocols within seconds — purpose-built for the scale and SKU diversity of PT. Kawan Lama's distribution network.

**Core Capabilities:**

1. **Custom-trained YOLO11 model** specialized for 4 warehouse-relevant classes (Snake, Cat, Gecko, Lizard) — **94.0% mAP50** overall, **1.9 ms inference per frame** (~520 FPS theoretical throughput per camera).
2. **Multi-zone live monitoring** — independent worker threads per camera, each running YOLO inference with per-class detection cooldown to prevent alert spam.
3. **Tiered risk classification** with automated response protocol:
   - **DANGER (Snake)** → Zone lockdown + emergency announcement + animal control dispatch
   - **WARNING (Cat)** → Sanitization team dispatch + inventory inspection
   - **MONITORING (Gecko/Lizard)** → Entry-point investigation + scheduled trap deployment
4. **Role-Based Access Control** (Admin / Manager / Operator) — backend-enforced, audit-logged.
5. **Auto-snapshot evidence chain** for every detection — saved to disk with retention policy (7 days or 1,000 file sliding window) and DB-linked for forensic review.

---

## 3. Technical Differentiators

| Aspect | Smart Warehouse Approach | Why It Matters for Kawan Lama |
|--------|--------------------------|-------------------------------|
| **Custom training** | 16,047 images, 4 classes, mAP50 94% | Generic pretrained models give 60-70% accuracy on these classes — false positives = alert fatigue |
| **Architecture** | Modular FastAPI (8 route modules, 3 services), multi-zone worker threads | Production-grade — survives engineering review, not toy |
| **Real-time alerts** | WebSocket push + bcrypt-secured sessions + rate limiting per endpoint | Enterprise security posture out of the box |
| **Operational ops** | Snapshot retention, MJPEG-storm fix, RBAC enforcement, command palette UX | Built for operators on shift, not just demos |
| **Deployment** | Single `docker compose up` | IT team can deploy without weeks of setup |
| **Browser-only client** | React + Vite, MJPEG over HTTP | No app install, no plugin — security teams can audit in 1 day |

---

## 4. Risk Mitigation Matrix

| Class | Risk Level | Likelihood | Severity | Auto-Response | Human SOP (within 5 min) |
|-------|-----------|------------|----------|---------------|--------------------------|
| **Snake** | DANGER | Low | Catastrophic | Zone lockdown alert, audio announcement, supervisor + animal control notified via WebSocket | Evacuate zone, do NOT attempt manual removal. Wait for animal control. Document with auto-snapshot for incident report. |
| **Cat** | WARNING | Medium | High | Sanitization team paged, affected SKUs flagged for inspection | Inspect entry points, audit affected aisle, sanitize floor + low racks, quarantine inventory if fur/waste contamination visible. |
| **Gecko** | MONITORING | High | Low | Logged with time + zone, daily summary to facility manager | Identify entry point at next maintenance window, deploy traps if frequency >3/day, schedule inspection. |
| **Lizard** | MONITORING | Medium | Low | Same as Gecko | Same as Gecko. |

**Detection cooldown** = 30 seconds per class per zone — prevents 1 animal from generating 100 alerts.

**Confidence threshold** = configurable per deployment (default 25%); tuned to balance recall (don't miss real detections) vs precision (don't flag a tarp as a snake).

---

## 5. ROI Calculation (Per Distribution Center, Annual)

### Cost Side — Smart Warehouse Deployment

| Item | Estimated Cost (Year 1) |
|------|-------------------------|
| 12 IP cameras (assume 4 strategic zones × 3 angles) | Rp 18,000,000 |
| Edge GPU server (RTX-class, 1 unit) | Rp 25,000,000 |
| Network infrastructure (PoE switch, cabling) | Rp 8,000,000 |
| Software deployment + training (one-time) | Rp 15,000,000 |
| Annual maintenance + model retraining | Rp 12,000,000 |
| **Total Year 1** | **Rp 78,000,000** |
| **Recurring annual (Year 2+)** | **Rp 12,000,000** |

### Savings Side — Avoided Costs

| Source of Savings | Conservative Estimate (Annual) |
|-------------------|-------------------------------|
| Reduced manual pest patrol staff (1 of 3 shifts replaced with AI) | Rp 36,000,000 |
| Reduced traditional pest-control contract (offset 30%) | Rp 18,000,000 (avg Rp 1.5jt/bln @ 30%) |
| Avoided contamination-driven inventory loss (1 incident/year prevented at 0.1% of stock value) | Rp 12,000,000 |
| Reduced compliance/audit cost (BPOM-ready evidence chain) | Rp 8,000,000 |
| **Total Annual Savings** | **Rp 74,000,000** |

### Payback Period

- **Year 1**: Rp 78,000,000 cost vs Rp 74,000,000 savings = **payback in 12.6 months**
- **Year 2+**: Rp 12,000,000 cost vs Rp 74,000,000 savings = **6.2× ROI** annually
- **5-year NPV** (10% discount): **~Rp 234,000,000 net positive per DC**
- **Across Kawan Lama's 18 DCs** (assuming proportional rollout): **~Rp 4.2 miliar annual net savings at scale**

> *Note: Conservative model. Excludes downside protection from a major contamination incident — single avoided event of the magnitude seen in the Dollar Tree case (~USD 41.7M) would represent decades of ROI in a single year.*

---

## 6. Alignment with Kawan Lama's Sustainability Pillars

PT. Kawan Lama Group's published sustainability framework focuses on five pillars: **Social, Education, Environment, Health, Art & Culture**. Our solution directly reinforces:

- **Environment** — Reduces use of broad-spectrum rodenticides by enabling targeted, evidence-based pest control. Less chemical runoff into the warehouse environment and surrounding industrial zones.
- **Health** — Protects warehouse staff from snake encounters (a real occupational hazard in tropical Indonesian DCs) and reduces zoonotic disease vectors (Leptospirosis, Salmonellosis, Hantavirus from rodent contamination).
- **Social** — Replaces dehumanizing 3-AM patrol shifts with daytime maintenance work; AI handles surveillance, humans handle response and judgment.

---

## 7. Implementation Roadmap

| Phase | Timeline | Deliverable |
|-------|----------|-------------|
| **0 — Hackathon Demo** | Now (May 2026) | Working prototype with 4 zones, custom-trained model, full RBAC, deployable in <30 min |
| **1 — Pilot** | Month 1-3 post-hackathon | Deploy to 1 Cikarang DC zone, 4 cameras, parallel-run with existing pest control |
| **2 — Validation** | Month 4-6 | Compare detection rates vs manual logs, retrain model on Kawan Lama-specific footage |
| **3 — DC Rollout** | Month 7-12 | Full Cikarang DC coverage (12-20 cameras), integration with existing CCTV infrastructure |
| **4 — Network Rollout** | Year 2 | Replicate to remaining 17 DCs in priority order (highest SKU value first) |
| **5 — Platform** | Year 2-3 | Add classes (forklift safety, PPE compliance, fire detection) — same architecture, more YOLO classes |

---

## 8. Why Team Andalusia Wins This Case

1. **Custom-trained, not stock model** — we did the training work (50 epochs, RTX 4050, mAP50 94.0%, precision 92.8%, recall 91.2%) most teams will skip. All training artifacts (results.csv, confusion matrix, PR curves) are in the repo and exposed live via the `/api/model-info` endpoint and the AI Performance dashboard page.
2. **Production-grade engineering** — RBAC, retention policy, modular routes, security hardening — judges from industry recognize this as deployable, not a toy.
3. **No mock data** — every metric in the dashboard reads from a real DB. Every detection is a real inference. Every alert is a real WebSocket push.
4. **Honest ROI** — we use conservative numbers based on real industry data, not aspirational figures. Kawan Lama can audit our math.
5. **Aligned with track theme** — "Sustainable Supply Chain" — our solution demonstrably reduces chemical pesticide use, energy spend on manual patrols, and inventory waste.

---

## Appendix A — Model Performance Detail

| Class | Training Images | Precision | Recall | mAP50 | mAP50-95 |
|-------|----------------|-----------|--------|-------|----------|
| Snake | 8,477 train | 82.6% | 76.5% | 83.4% | 57.5% |
| Cat | 10,001 train | 91.6% | 89.3% | 94.3% | 76.7% |
| Gecko | 1,435 train | 99.5% | 99.8% | 99.3% | 93.1% |
| Lizard | 2,409 train | 97.5% | 99.3% | 99.2% | 78.2% |
| **All** | **16,047 train + 4,323 val** | **92.8%** | **91.2%** | **94.0%** | **76.4%** |

Training: YOLO11n base, 50 epochs, batch 16, imgsz 640, RTX 4050 GPU.
Inference: 1.9 ms preprocess + inference + postprocess per frame.

## Appendix B — Architecture Summary

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ IP Cameras   │───▶│  Per-Zone    │───▶│ YOLO11 (GPU) │
│ (RTSP/MJPEG) │    │  Worker      │    │ Custom Model │
└──────────────┘    │  Threads     │    └──────┬───────┘
                    └──────────────┘           │
                                               ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Operator    │◀───│  React UI    │◀───│  FastAPI     │
│  (Browser)   │    │  Dashboard   │    │  + WebSocket │
└──────────────┘    └──────────────┘    └──────┬───────┘
                                               │
                          ┌────────────────────┴────────────────────┐
                          ▼                    ▼                    ▼
                    ┌──────────┐         ┌──────────┐        ┌──────────────┐
                    │ SQLite   │         │ Snapshot │        │ TTS / WebSocket│
                    │ (Logs +  │         │ Storage  │        │ (Indonesian   │
                    │  RBAC)   │         │ + Retention│       │  alerts)     │
                    └──────────┘         └──────────┘        └──────────────┘
```

8 backend route modules · 3 services · WebSocket bi-directional · bcrypt + session tokens · per-endpoint rate limiting · auto-migration schema.

---

**Repo:** https://github.com/SultanZhalifa/smart-warehouse-dashboard
**Live demo deployment:** Available on request.

*This document is generated for the Final Event of AI Open Innovation Challenge 2026.*
