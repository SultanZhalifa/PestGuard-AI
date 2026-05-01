# Smart Warehouse - Bio Hazard and Pest Detection

![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![OpenCV](https://img.shields.io/badge/opencv-%23white.svg?style=for-the-badge&logo=opencv&logoColor=white)

An automated AI surveillance system designed for PT. Kawan Lama to maintain the integrity of goods and the safety of workers from wild animal disturbances.

This project was built for the AI Open Innovation Challenge 2026, utilizing Computer Vision (OpenCV) and a full stack React + FastAPI architecture to provide real time alerts for Snakes (Bio Hazards), Cats, and Geckos (Contamination Risks).

---

## Agile Scrum Team (Group 5)

- Product Owner: Risly Maria Theresia Worung (001202400069)
- Scrum Master: Sultan Zhalifunnas Musyaffa (001202400200)
- Frontend Lead Developer: Misha Andalusia (001202400040)
- Backend and AI Lead Developer: Fathir Barhouti Awlya (001202400054)

---

## Features

- Live Video Simulator: Real time MJPEG video streaming from the Python backend via OpenCV with dynamic bounding boxes highlighting animal threats directly on the video feed.
- Interactive Warehouse Zone Map: SVG based floor plan with color coded threat levels (High Alert, Moderate, Clear), clickable zones showing camera status and recent detections, and pulse animations for high risk areas.
- Risk Assessment Matrix: Professional threat classification table categorizing each animal type by severity, likelihood, and risk score with recommended response actions.
- Executive Summary with PDF Export: Comprehensive risk mitigation report with one click PDF generation for management reporting, powered by jsPDF and html2canvas.
- Detection Logs with Advanced Filtering: Full detection history table with search bar, risk level filter tabs (All, Hazard, Contamination, Authorized), summary stat cards, and CSV export functionality.
- Rapid Response Protocols: Detailed step by step Standard Operating Procedures for handling Snake (Bio Hazard), Cat (Contamination), and Gecko (Monitoring) detections.
- Real Time Push Notifications: WebSocket powered instant alerts with toast notifications and WhatsApp/Telegram sharing integration.
- Weekly Detection Trend Analytics: Stacked bar charts and donut charts visualizing detection patterns across all warehouse zones powered by Recharts.
- System Architecture Dashboard: Visual pipeline diagram showing the full technology flow from Camera to AI to Dashboard, with detailed tech specifications.
- Session Based Authentication: Secure login system with session storage that requires re authentication on every new browser session.

---

## Tech Stack

- Frontend: React 19, Vite 8, React Router DOM, Recharts 3, Vanilla CSS
- Backend: Python, FastAPI, Uvicorn
- AI/Vision: YOLO11 Nano (Ultralytics), OpenCV 4 (cv2), NumPy
- Database: SQLite3
- Real time: WebSocket (Bi directional)
- Report Export: jsPDF, html2canvas
- Alerts: pyttsx3 (Text to Speech)

---

## System Architecture

```
Camera/Video --> YOLO11 AI --> FastAPI --> SQLite --> WebSocket --> React Dashboard
  (OpenCV)     (Inference)   (Backend)  (Database)  (Real-time)   (Frontend UI)
```

---

## How to Run Locally

To run this project, you will need two terminals running simultaneously (one for the backend, one for the frontend).

### 1. Start the Python AI Backend
```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment (Windows)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload
```
The backend will run on http://127.0.0.1:8000

### 2. Start the React Frontend Dashboard
```bash
# Open a new terminal and stay in the root directory
# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
The dashboard will be available at http://localhost:5173. Vite will automatically proxy API requests to the Python backend.

### Default Login Credentials
- Email: manager@kawanlama.com
- Password: password123

---

## Project Structure

```
smart-warehouse-dashboard/
  backend/
    main.py              # FastAPI server with YOLO inference, WebSocket, and all API routes
    requirements.txt     # Python dependencies
  src/
    components/
      WarehouseZoneMap.jsx  # Interactive SVG warehouse floor plan
    context/
      WarehouseContext.jsx  # Global state management (auth, logs, alerts, dark mode)
    layouts/
      DashboardLayout.jsx   # Sidebar navigation and top bar
    pages/
      Login.jsx             # Authentication page
      LiveMonitor.jsx       # Live camera feed with real time detection
      DetectionLogs.jsx     # Filterable detection history with CSV export
      RiskAnalysis.jsx      # Executive summary, charts, zone map, and protocols
      Settings.jsx          # System config, preferences, and architecture diagram
  docs/
    SCRUM_ROLES.md          # Agile team roles and responsibilities
    PRODUCT_BACKLOG.md      # Product backlog items with priority
    SPRINT_REPORTS.md       # Weekly sprint progress reports
  public/
    Paw.webp                # Brand logo
```

---

## Executive Summary

Large scale warehouses face challenges with manual monitoring in blind spots. Our automated AI dashboard mitigates these risks by separating alerts into three critical tiers:
1. Bio Hazards (Snakes): Triggers immediate halt of operations, zone lockdown, and notifies animal control. Workers must not attempt manual removal.
2. Contamination Risks (Cats): Logs the entry point, dispatches maintenance crew for inspection and sanitization of affected goods.
3. Monitoring (Geckos/Lizards): Records detection events, identifies and seals entry points, and schedules periodic zone inspections.

By leveraging a scalable AI driven solution, we drastically reduce manual patrol overhead while significantly improving workplace safety and goods integrity for PT. Kawan Lama.
