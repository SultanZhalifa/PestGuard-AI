# PestGuard AI
### AI-Powered Bio-Hazard & Pest Detection System
**AI Open Innovation Challenge 2026 -- PT. Kawan Lama Group | Logistics Category**

---

<div align="center">

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![YOLO11](https://img.shields.io/badge/YOLO11-Custom_Trained-00FFFF?style=for-the-badge)
![Gemini](https://img.shields.io/badge/Gemini_2.0_Flash-AI_Chat-4285F4?style=for-the-badge&logo=google)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)

</div>

---

## Problem Statement

Gudang PT. Kawan Lama Group menghadapi risiko bio-hazard dan kontaminasi akibat masuknya hewan liar (ular, kucing, gecko/kadal) ke area penyimpanan produk. Sistem inspeksi manual tidak efektif untuk gudang berskala besar dan tidak beroperasi 24/7.

PestGuard AI menyelesaikan masalah ini dengan sistem deteksi real-time berbasis Computer Vision (YOLO11) yang memantau seluruh zona gudang secara otomatis, 24 jam sehari.

---

## Key Features

| Feature | Description |
|---|---|
| **Bio-Hazard Detection** | YOLO11 custom model mendeteksi Ular (DANGER), Kucing (WARNING), Gecko/Kadal (MONITOR) |
| **Low-Light Enhancement** | CLAHE preprocessing meningkatkan akurasi di kondisi gudang malam hari |
| **Real-time WebSocket Alerts** | Push notification ke dashboard dalam kurang dari 1 detik dari deteksi |
| **Browser Audio Alarm** | Web Audio API menghasilkan alarm beep saat DANGER terdeteksi |
| **Telegram Notifications** | Alert otomatis ke Telegram Bot untuk semua risk level |
| **Gemini AI Chat** | LLM-powered chatbot dengan RAG pattern, inject data real-time ke setiap prompt |
| **Multi-Zone Monitoring** | Pantau hingga 4 zona kamera secara bersamaan |
| **SOP Matrix** | Protokol penanganan per jenis hewan (0-30 detik, 1-5 menit, dst.) |
| **ROI Calculator** | Kalkulasi penghematan biaya vs pest control manual |
| **Risk Analytics** | Trend chart, zone heatmap, peak hours analysis |
| **Report Generator** | Export laporan deteksi ke PDF/CSV |
| **Role-Based Access** | Admin, Manager, Operator dengan hak akses berbeda |
| **Docker Ready** | Deploy dengan satu perintah |

---

## System Architecture

```
+-------------------------------------------------------------+
|                       PESTGUARD AI                          |
+------------------+------------------+-----------------------+
|   CAMERA LAYER   |   AI/ML LAYER    |   ALERT LAYER         |
|                  |                  |                       |
|  Multi-zone      |  YOLO11 Custom   |  WebSocket Push       |
|  RTSP/Webcam     |  CLAHE Preproc   |  Browser Audio Alarm  |
|  720p @ 30fps    |  CUDA/CPU Auto   |  Telegram Bot         |
|  Frame Skip=3    |  320px Inference |  TTS (Indonesian)     |
+------------------+------------------+-----------------------+
|                    BACKEND (FastAPI)                        |
|                                                             |
|  +---------+ +----------+ +-----------+ +--------------+   |
|  |  Auth   | |  Camera  | | Analytics | |  Gemini AI   |   |
|  |  Routes | |  Routes  | |  Routes   | |  Chat (RAG)  |   |
|  +---------+ +----------+ +-----------+ +--------------+   |
|                                                             |
|  SQLite WAL + Thread-Safe Connections                       |
+-------------------------------------------------------------+
|                   FRONTEND (React + Vite)                   |
|                                                             |
|  LiveMonitor | Analytics | Ask AI | SOP & ROI | AI Perf    |
+-------------------------------------------------------------+
```

---

## AI Model Details

### Custom YOLO11 -- warehouse_pest.pt

| Parameter | Value |
|---|---|
| **Architecture** | YOLO11-Nano (fine-tuned) |
| **Framework** | Ultralytics YOLO11 |
| **Training Resolution** | 640px |
| **Inference Resolution** | 320px (optimized untuk speed) |
| **Device** | CUDA GPU / CPU (auto-detect) |
| **Preprocessing** | CLAHE (clipLimit=2.5, tileGrid=8x8) |
| **Model Size** | ~5.2 MB |

### Detection Classes & Risk Mapping

| Class | Risk Level | Action | Response Time |
|---|---|---|---|
| **Snake** | DANGER (Bio-Hazard) | Evakuasi zona, hubungi pest control | 0-30 detik |
| **Cat** | WARNING (Kontaminasi) | Karantina produk, sanitasi area | 0-5 menit |
| **Gecko/Lizard** | INFO (Monitoring) | Dokumentasi, periksa celah masuk | Hari ini |

### Dataset Card

| Property | Details |
|---|---|
| **Sources** | Roboflow Public + Custom warehouse footage |
| **Classes** | Snake, Cat, Gecko, Lizard |
| **Augmentation** | Horizontal flip, brightness ±30%, rotation ±15°, mosaic |
| **Split** | 70% train / 20% val / 10% test |
| **Low-light samples** | Included (gudang malam hari) |
| **Partial occlusion** | Included (hewan tersembunyi di barang) |

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19, Vite, Recharts | Dashboard & visualisasi |
| **Backend** | Python 3.12, FastAPI | REST API + WebSocket |
| **AI/CV** | YOLO11, OpenCV, CLAHE | Object detection & preprocessing |
| **Database** | SQLite (WAL mode) | Detection logs & settings |
| **AI Chat** | Google Gemini 2.0 Flash | RAG-powered warehouse assistant |
| **Auth** | bcrypt + session tokens | Role-based access control |
| **Alerts** | WebSocket + Telegram API + Web Audio | Multi-channel notifications |
| **Deployment** | Docker + Docker Compose | Containerized deployment |

---

## Quick Start

### Option 1: Docker (Recommended)

```bash
git clone https://github.com/SultanZhalifa/PestGuard-AI
cd PestGuard-AI
cp backend/.env.example backend/.env
# Edit backend/.env: tambahkan GEMINI_API_KEY dan TELEGRAM_BOT_TOKEN
docker-compose up --build
```

### Option 2: Manual

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python main.py

# Frontend (terminal baru)
cd ..
npm install
npm run dev
```

**Akses:**
- Dashboard: http://localhost:5173
- API Docs: http://localhost:8000/docs

### Testing & Quality

```bash
# Frontend: lint, unit tests, production build
npm run lint
npm test
npm run build

# Backend: API test suite (isolated temp DB, no setup needed)
cd backend && pytest -q
```

Continuous integration (GitHub Actions, `.github/workflows/ci.yml`) runs all of
the above on every push and pull request to `main`.

### Default Login

| Username | Password | Role |
|---|---|---|
| `admin` | *(lihat terminal saat startup)* | Admin |
| `manager` | *(lihat terminal saat startup)* | Manager |
| `operator` | *(lihat terminal saat startup)* | Operator |

---

## Project Structure

```
PestGuard-AI/
├── backend/
│   ├── routes/
│   │   ├── auth.py              # Login, register, password reset
│   │   ├── camera.py            # Multi-zone camera + YOLO inference
│   │   ├── analytics.py         # Trend charts, heatmap, peak hours
│   │   ├── chat.py              # Gemini AI chat (RAG pattern)
│   │   ├── logs.py              # Detection logs CRUD + CSV export
│   │   ├── model_info.py        # YOLO metrics + training artifacts
│   │   ├── zones.py             # Camera zone management
│   │   └── users.py             # User management
│   ├── services/
│   │   ├── detector.py          # YOLO11 + HUD bounding box renderer
│   │   ├── tts.py               # Indonesian text-to-speech alerts
│   │   ├── telegram_alert.py    # Telegram Bot notifications
│   │   └── websocket_manager.py # WebSocket broadcast manager
│   ├── config.py                # Constants, env vars, auth guards
│   ├── database.py              # SQLite WAL + schema migrations
│   └── requirements.txt
├── src/
│   ├── pages/
│   │   ├── LiveMonitor.jsx      # Real-time camera + alert dashboard
│   │   ├── DetectionLogs.jsx    # Detection history + search/filter
│   │   ├── RiskAnalysis.jsx     # Analytics, charts, zone heatmap
│   │   ├── AIPerformance.jsx    # YOLO metrics, training curves
│   │   ├── AskAI.jsx            # Gemini AI chat interface
│   │   ├── SOPMitigasi.jsx      # SOP protocols + ROI calculator
│   │   └── UserManagement.jsx   # Admin: user CRUD + invite system
│   ├── components/
│   │   ├── CameraGrid.jsx       # Multi-zone camera grid
│   │   ├── WarehouseZoneMap.jsx # Interactive warehouse map
│   │   ├── ReportGenerator.jsx  # PDF/CSV report export
│   │   └── CommandPalette.jsx   # Ctrl+K quick navigation
│   └── layouts/
│       └── DashboardLayout.jsx  # Sidebar + WebSocket + audio alarm
├── docker-compose.yml
└── Dockerfile
```

---

## Business Value (ROI)

Estimasi untuk 1 gudang PT. Kawan Lama:

| Metric | Value |
|---|---|
| Biaya pest control manual | Rp 15-30 juta per bulan |
| OPEX PestGuard AI | Rp 3 juta per bulan |
| **Penghematan per tahun** | **Rp 144-324 juta per gudang** |
| Break-even period | 4-6 bulan |
| ROI 3 tahun | lebih dari 200% |

---

## Team

**Team Andalusia -- AI Open Innovation Challenge 2026**
Logistics Sector · PT. Kawan Lama Group Case Study
