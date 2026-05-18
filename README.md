# SmartWarehouse AI

> AI-Powered Object Detection & Inventory Management System — built for Software Engineering course, President University.

**GitHub:** [github.com/SultanZhalifa/smart-warehouse](https://github.com/SultanZhalifa/smart-warehouse)

---

## Overview

SmartWarehouse AI is a full-stack inventory management system that uses computer vision to detect and track stock items in real time through a connected web dashboard. Built by a team of five as a group project for the Software Engineering course.

## Features

- **Real-time Object Detection** — YOLOv8/YOLOv11 model detects stock items via connected camera feed
- **Live Dashboard** — React frontend displays live inventory status, alerts, and zone monitoring
- **Alert System** — Automated notifications for low stock, unauthorized access, or anomalies
- **User Management** — Role-based access with admin-invite authentication flow
- **Environment Monitoring** — Tracks temperature, humidity, and environmental conditions
- **Docker Deployment** — Fully containerized with Docker Compose for easy deployment

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Recharts |
| Backend | Python, FastAPI |
| AI / CV | YOLOv8, YOLOv11, OpenCV |
| Database | PostgreSQL |
| Auth | JWT, Admin-Invite Flow |
| Deploy | Docker, Docker Compose |

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Python 3.10+
- Node.js 18+

### Run with Docker

```bash
git clone https://github.com/SultanZhalifa/smart-warehouse
cd smart-warehouse
cp .env.example .env
docker-compose up --build
```

Open `http://localhost:5173` for the dashboard, `http://localhost:8000/docs` for API.

### Run without Docker

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Project Structure

```
smartwarehouse-ai/
├── backend/
│   ├── routes/          # API endpoints (auth, zones, alerts)
│   ├── models/          # Database models
│   ├── config.py        # App configuration
│   └── main.py          # FastAPI entry point
├── src/
│   ├── pages/           # React pages (Dashboard, LiveMonitor, etc.)
│   ├── components/      # Reusable UI components
│   └── main.jsx
├── docker-compose.yml
└── README.md
```

## Team

Group 5 — Software Engineering Course, President University

---

Built by Sultan Zhalifunnas Musyaffa & Team
