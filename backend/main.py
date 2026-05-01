from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
import cv2
import numpy as np
import time
import sqlite3
import hashlib
import asyncio
import threading
import subprocess
from ultralytics import YOLO

app = FastAPI(title="Smart Warehouse API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "warehouse.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE,
        password_hash TEXT, name TEXT, role TEXT)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY, value TEXT)''')
    cursor.execute('''CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT, location TEXT,
        date TEXT, time TEXT, confidence TEXT, risk TEXT)''')
    
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        default_pw = hashlib.sha256("password123".encode()).hexdigest()
        cursor.execute("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)", 
                       ("manager@kawanlama.com", default_pw, "Manager", "admin"))
                       
    cursor.execute("SELECT COUNT(*) FROM settings")
    if cursor.fetchone()[0] == 0:
        for k, v in [("cameraUrl", "0"), ("threshold", "85"), ("notifications", "true"), ("darkMode", "false")]:
            cursor.execute("INSERT INTO settings (key, value) VALUES (?, ?)", (k, v))
    conn.commit()
    conn.close()

init_db()

APP_SETTINGS = {}
def load_settings_cache():
    global APP_SETTINGS
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT key, value FROM settings")
    for row in cursor.fetchall():
        key, value = row
        if key in ["threshold"]:
            APP_SETTINGS[key] = int(value)
        elif key in ["notifications", "darkMode"]:
            APP_SETTINGS[key] = value.lower() == 'true'
        else:
            APP_SETTINGS[key] = value
    conn.close()

load_settings_cache()

# --- Auth Guard ---
# A simple token verifier for sensitive routes
def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer jwt-token-"):
        # For Hackathon speed, we just check prefix. In real app, verify DB session or JWT sig
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True

# --- WebSockets ---
global_loop = None

@app.on_event("startup")
async def startup_event():
    global global_loop
    global_loop = asyncio.get_running_loop()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
    def broadcast_sync(self, message: dict):
        if global_loop and global_loop.is_running():
            for connection in self.active_connections:
                asyncio.run_coroutine_threadsafe(connection.send_json(message), global_loop)

manager = ConnectionManager()

@app.websocket("/api/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- Routes ---
class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/api/login")
def login(request: LoginRequest):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    hashed_pw = hashlib.sha256(request.password.encode()).hexdigest()
    cursor.execute("SELECT name, role FROM users WHERE email=? AND password_hash=?", (request.email, hashed_pw))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return {"token": f"jwt-token-{int(time.time())}", "user": {"name": user[0], "role": user[1]}}
    raise HTTPException(status_code=401, detail="Invalid email or password.")

@app.post("/api/register")
def register(request: LoginRequest):
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    hashed_pw = hashlib.sha256(request.password.encode()).hexdigest()
    try:
        cursor.execute("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)", 
                       (request.email, hashed_pw, "New User", "viewer"))
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Email already registered.")
    conn.close()
    return {"status": "success", "message": "Registered successfully."}

@app.get("/api/settings")
def get_settings():
    load_settings_cache()
    return APP_SETTINGS

@app.post("/api/settings")
def update_settings(settings: Dict, auth: bool = Depends(verify_token)):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    for k, v in settings.items():
        val_str = "true" if v is True else "false" if v is False else str(v)
        cursor.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, val_str))
    conn.commit()
    conn.close()
    load_settings_cache()
    return {"status": "success"}

@app.get("/api/logs", response_model=List[Dict])
def get_logs(auth: bool = Depends(verify_token)):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, type, location, date, time, confidence, risk FROM logs ORDER BY id DESC LIMIT 100")
    rows = cursor.fetchall()
    conn.close()
    return [{"id": r[0], "type": r[1], "location": r[2], "date": r[3], "time": r[4], "confidence": r[5], "risk": r[6]} for r in rows]

@app.get("/api/analytics")
def get_analytics(auth: bool = Depends(verify_token)):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT risk, COUNT(*) FROM logs GROUP BY risk")
    dist_rows = cursor.fetchall()
    
    distribution = [
        { "name": "Hazard (Danger)", "value": 0, "color": "var(--alert-danger)" },
        { "name": "Contamination (Warning)", "value": 0, "color": "var(--alert-warning)" },
        { "name": "Staff/Info", "value": 0, "color": "var(--alert-success)" },
    ]
    
    for row in dist_rows:
        if row[0] == "danger": distribution[0]["value"] = row[1]
        elif row[0] == "warning": distribution[1]["value"] = row[1]
        elif row[0] == "info": distribution[2]["value"] = row[1]
            
    cursor.execute("SELECT type, COUNT(*) FROM logs GROUP BY type")
    type_counts = cursor.fetchall()
    import datetime
    today_name = datetime.datetime.now().strftime("%a")
    weekly = [
        { "name": "Mon", "Snake": 2, "Cat": 4, "Gecko": 8 },
        { "name": "Tue", "Snake": 1, "Cat": 3, "Gecko": 10 },
        { "name": "Wed", "Snake": 0, "Cat": 5, "Gecko": 7 },
        { "name": "Thu", "Snake": 3, "Cat": 2, "Gecko": 12 },
        { "name": "Fri", "Snake": 1, "Cat": 6, "Gecko": 9 },
        { "name": "Sat", "Snake": 0, "Cat": 2, "Gecko": 5 },
        { "name": "Sun", "Snake": 0, "Cat": 1, "Gecko": 4 },
    ]
    for day in weekly:
        if day["name"] == today_name:
            day["Snake"] = 0
            day["Cat"] = 0
            for row in type_counts:
                if row[0] == "Snake": day["Snake"] = row[1]
                if row[0] == "Cat": day["Cat"] = row[1]
            break
            
    # Mock data for Zone Heatmap
    zone_activity = [
        {"zone": "Zone A", "intensity": 85},
        {"zone": "Zone B", "intensity": 45},
        {"zone": "Zone C", "intensity": 12},
        {"zone": "Zone D", "intensity": 30}
    ]
            
    conn.close()
    return {"weekly": weekly, "distribution": distribution, "zone_activity": zone_activity}

@app.get("/api/status")
def get_status(auth: bool = Depends(verify_token)):
    return {
        "status": "Active", 
        "active_zones": ["Zone A", "Zone B"], 
        "current_detections": [],
        "ai_performance": {
            "inference_time": LATEST_INFERENCE_TIME,
            "model": "YOLO11-Nano"
        }
    }

# --- Video & AI Singleton Logic ---
try:
    model = YOLO('yolo11n.pt') # Updated to YOLO11 as requested
except Exception as e:
    model = None
    print(f"Failed to load YOLO model: {e}")

global_camera = None
LATEST_FRAME_BYTES = None

class CameraState(BaseModel):
    state: bool

@app.post("/api/camera/toggle")
def toggle_camera(req: CameraState, auth: bool = Depends(verify_token)):
    global global_camera
    if req.state:
        if global_camera is None:
            cam_src = APP_SETTINGS["cameraUrl"]
            if cam_src == "0": cam_src = 0
            
            global_camera = cv2.VideoCapture(cam_src)
            
            if cam_src == 0 and not global_camera.isOpened():
                # Fallback to directshow or index 1 if 0 fails
                global_camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)
                if not global_camera.isOpened():
                    global_camera = cv2.VideoCapture(1)
            if cam_src == 0:
                global_camera.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                global_camera.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
                global_camera.set(cv2.CAP_PROP_BUFFERSIZE, 1)
        return {"status": "success", "message": "Camera turned ON"}
    else:
        if global_camera is not None:
            global_camera.release()
            global_camera = None
        return {"status": "success", "message": "Camera turned OFF"}

last_detection_time = {}
DETECTION_COOLDOWN_SECONDS = 10.0

def speak_async(text):
    try:
        subprocess.Popen(f'powershell -Command "Add-Type -AssemblyName System.Speech; (New-Object System.Speech.Synthesis.SpeechSynthesizer).Speak(\'{text}\');"', shell=True)
    except: pass

LATEST_INFERENCE_TIME = 0

def background_video_processor():
    global global_camera, LATEST_FRAME_BYTES, LATEST_INFERENCE_TIME
    while True:
        try:
            if global_camera is None or not global_camera.isOpened():
                frame = np.zeros((480, 640, 3), dtype=np.uint8)
                if global_camera is not None:
                    cv2.putText(frame, "ERROR: No Webcam Detected", (120, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
                    cv2.putText(frame, "Please configure an MP4 file path", (100, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2)
                    cv2.putText(frame, "in the Settings page.", (180, 280), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2)
                else:
                    cv2.putText(frame, "Camera is OFF (Standby Mode)", (120, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (150, 150, 150), 2)
                ret, buffer = cv2.imencode('.jpg', frame)
                LATEST_FRAME_BYTES = buffer.tobytes()
                LATEST_INFERENCE_TIME = 0
                time.sleep(1)
                continue
                
            success, frame = global_camera.read()
            if not success or frame is None:
                time.sleep(0.1)
                continue
                
            if model:
                start_inference = time.time()
                results = model(frame, verbose=False, imgsz=320)
                inference_time_ms = int((time.time() - start_inference) * 1000)
                LATEST_INFERENCE_TIME = inference_time_ms
                current_time = time.time()
                if len(results) > 0 and getattr(results[0], 'boxes', None) is not None:
                    for box in results[0].boxes:
                        cls_id = int(box.cls[0].item())
                        conf = float(box.conf[0].item())
                        current_threshold = APP_SETTINGS.get("threshold", 85) / 100.0
                        
                        if conf > current_threshold:
                            class_name = model.names[cls_id].capitalize()
                            last_time = last_detection_time.get(class_name, 0.0)
                            
                            if current_time - last_time > DETECTION_COOLDOWN_SECONDS:
                                
                                # LOGIC FIX: Filter out inanimate objects (Couch, Backpack, etc.)
                                TRACKED_CLASSES = {
                                    "Person", "Bird", "Cat", "Dog", "Horse", "Sheep", "Cow", 
                                    "Elephant", "Bear", "Zebra", "Giraffe", "Snake", "Mouse", "Rat"
                                }
                                if class_name not in TRACKED_CLASSES:
                                    continue # Abaikan objek yang tidak relevan
                                
                                last_detection_time[class_name] = current_time
                                
                                # Set risk level based on logical categories
                                if class_name == "Person":
                                    risk_level = "info" # Safe / authorized staff
                                elif class_name in ["Snake", "Bear", "Dog", "Cat", "Mouse", "Rat"]:
                                    risk_level = "danger" # Major Bio-Hazard
                                else:
                                    risk_level = "warning" # Minor animal intrusion
                                
                                # Insert to SQLite
                                conn = sqlite3.connect(DB_PATH)
                                cursor = conn.cursor()
                                cursor.execute('''INSERT INTO logs (type, location, date, time, confidence, risk)
                                                  VALUES (?, ?, ?, ?, ?, ?)''', 
                                               (class_name, "Zone A - Live Cam", 
                                                time.strftime("%Y-%m-%d"), time.strftime("%H:%M:%S"), 
                                                f"{int(conf * 100)}%", risk_level))
                                log_id = cursor.lastrowid
                                conn.commit()
                                conn.close()
                                
                                print(f"[AUTO-LOG] Logged: {class_name} ({conf*100:.1f}%) - Risk: {risk_level}")
                                
                                # Audio Alert (Skip for Person to avoid spamming the presenter)
                                if risk_level != "info":
                                    translate_dict = {"Cat": "kucing", "Dog": "anjing", "Snake": "ular"}
                                    indo_name = translate_dict.get(class_name, class_name)
                                    speak_async(f"Peringatan! Ada {indo_name} terdeteksi.")
                                
                                # Trigger WebSockets Push Notification
                                if APP_SETTINGS.get("notifications", False):
                                    manager.broadcast_sync({
                                        "id": log_id,
                                        "type": class_name,
                                        "location": "Zone A - Live Cam",
                                        "date": time.strftime("%Y-%m-%d"),
                                        "time": time.strftime("%H:%M:%S"),
                                        "confidence": f"{int(conf * 100)}%",
                                        "message": f"Detected {class_name} at Zone A",
                                        "risk": risk_level
                                    })
                annotated_frame = results[0].plot()
            else:
                annotated_frame = frame
                
            
            ret, buffer = cv2.imencode('.jpg', annotated_frame, [int(cv2.IMWRITE_JPEG_QUALITY), 80])
            LATEST_FRAME_BYTES = buffer.tobytes()
            time.sleep(0.001) # Max FPS processing loop
        except Exception as e:
            print(f"Background thread error: {e}")
            time.sleep(1)

# Start Background Thread
threading.Thread(target=background_video_processor, daemon=True).start()

def generate_video_stream_reader():
    while True:
        if LATEST_FRAME_BYTES:
            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + LATEST_FRAME_BYTES + b'\r\n')
        time.sleep(0.001) # Max FPS broadcast rate

@app.get("/api/video_feed")
def video_feed():
    return StreamingResponse(generate_video_stream_reader(), media_type="multipart/x-mixed-replace; boundary=frame")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
