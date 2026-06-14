# PestGuard AI — One-Pager Handout
> Print this on A4. Distribute to judges before pitch.

---

## PESTGUARD AI
### AI-Powered Bio-Hazard & Pest Detection for PT. Kawan Lama
**Team Andalusia · AI Open Innovation Challenge 2026**

---

### THE PROBLEM

PT. Kawan Lama operates **18 distribution centers** with **60,000+ SKUs** across **240,000 m²** flagship facilities. Manual pest surveillance has **structural blind spots**:
- Blind zones between racking, behind pallets
- Detection latency: hours to days
- Coverage gaps at 3-shift handovers
- BPOM Reg. 22/2025 — mandatory recall reporting now active

**Cost of failure (real precedent):**
> US Dollar Tree DC, 2024 — **Rp 670 miliar criminal penalty** for rodent infestation across distribution center.

---

### THE SOLUTION

Real-time multi-zone AI surveillance with custom-trained YOLO11.

| Metric | Value |
|--------|-------|
| Detection accuracy (mAP50) | **94.0%** |
| Inference speed | **1.9 ms/frame** |
| Training images | 16,047 (4 classes) |
| Architecture | FastAPI + React + WebSocket + SQLite |
| RBAC | 3 roles (Admin/Manager/Operator), backend-enforced |
| Deployment | `docker compose up` (single command) |

**3-tier risk classification:**
- **Snake** — DANGER — Zone lockdown + animal control
- **Cat** — WARNING — Sanitization + inventory inspection
- **Gecko/Lizard** — MONITOR — Daily summary + entry-point inspection

**BPOM-ready evidence chain:** Auto-snapshot per detection, retention 7 days / 1,000 file rolling, DB-linked.

---

### BUSINESS IMPACT (Conservative, Per DC, Annual)

| | Year 1 | Year 2+ |
|---|---:|---:|
| **Investment** | Rp 78 jt | Rp 12 jt |
| **Savings** | Rp 74 jt | Rp 74 jt |
| **Net** | -Rp 4 jt (payback) | **+Rp 62 jt** |

**At scale across 18 DCs: Rp 4.2 miliar annual net savings — 6.2× ROI**

*Excludes downside protection from major incidents.*

---

### SUSTAINABILITY ALIGNMENT

Direct contribution to Kawan Lama's sustainability pillars and UN SDGs:
- **Environment (SDG 12)** — Targeted pest response reduces broad-spectrum chemicals
- **Health (SDG 3)** — Worker protection from snake encounters + zoonotic disease prevention
- **Social (SDG 8)** — Eliminates 3 AM patrol shifts; AI surveils, humans respond

---

### THE ASK

**90-day pilot at Cikarang DC, 1 zone, parallel-run with existing pest control.**

If our numbers hold → scale to full DC, then to network.
If not → you keep the data. We keep the experience. No commitment.

---

### TEAM

**Risly Maria Theresia Worung** — Product Owner
**Sultan Zhalifunnas Musyaffa** — Scrum Master
**Misha Andalusia** — Frontend Lead
**Fathir Barhouti Awlya** — Backend & AI Lead

Email: sultanzhalifunnasmusyaffa@gmail.com
GitHub: github.com/SultanZhalifa/PestGuard-AI
Live demo: pestguard-ai.vercel.app

---

*Built for AI Open Innovation Challenge 2026 — Sustainable Supply Chain Track (Blibli × Cikarang Dry Port × PT. Kawan Lama)*
