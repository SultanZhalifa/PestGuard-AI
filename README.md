# 🏭 Smart Warehouse - Bio-Hazard & Pest Detection

![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![OpenCV](https://img.shields.io/badge/opencv-%23white.svg?style=for-the-badge&logo=opencv&logoColor=white)

An automated AI surveillance system designed for **PT. Kawan Lama** to maintain the integrity of goods and the safety of workers from wild animal disturbances. 

This project was built for the Hackathon Case 1 challenge, utilizing Computer Vision (OpenCV) and a full-stack React + FastAPI architecture to provide real-time alerts for Snakes (Bio-Hazards), Cats, and Geckos (Contamination Risks).

---

## 👥 Agile Scrum Team (Group 5)

*   **Product Owner:** Risly Maria Theresia Worung (001202400069)
*   **Scrum Master:** Sultan Zhalifunnas Musyaffa (001202400200)
*   **Frontend Lead Developer:** Misha Andalusia (001202400040)
*   **Backend & AI Lead Developer:** Fathir Barhouti Awlya (001202400054)

---

## ✨ Features

- **Live Video Simulator**: Real-time MJPEG video streaming from the Python backend via OpenCV.
- **Dynamic Bounding Boxes**: Visual AI detection highlighting animal threats directly on the video feed.
- **Real-Time Alert Logging**: Historical data table with search and filtering for all pest detections.
- **Executive Summary Dashboard**: Weekly detection trend charts and Risk Distribution analytics powered by Recharts.
- **Rapid Response Protocols**: Built-in UI guidelines for handling severe hazards vs mild contaminations.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, React Router DOM, Recharts, Vanilla CSS
- **Backend:** Python, FastAPI, Uvicorn
- **AI/Vision:** OpenCV (cv2), NumPy

---

## 🚀 How to Run Locally

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
*The backend will run on `http://127.0.0.1:8000`*

### 2. Start the React Frontend Dashboard
```bash
# Open a new terminal and stay in the root directory
# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
*The dashboard will be available at `http://localhost:5173`. Vite will automatically proxy API requests to the Python backend.*

---

## 📈 Executive Summary

Large-scale warehouses face challenges with manual monitoring in blind spots. Our automated AI dashboard mitigates these risks by separating alerts into two critical tiers:
1. **Bio-Hazards (Snakes):** Triggers immediate halt of operations and notifies animal control.
2. **Contamination Risks (Cats/Geckos):** Logs the entry point for end-of-shift maintenance and cleaning to prevent goods spoilage.

By leveraging an scalable AI-driven solution, we drastically reduce manual patrol overhead while significantly improving workplace safety.
