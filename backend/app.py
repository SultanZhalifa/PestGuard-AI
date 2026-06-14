"""
Smart Warehouse API — Application Entry Point
================================================
FastAPI application factory with modular route registration,
CORS middleware, WebSocket support, and background services.

Architecture:
    config.py          → Constants, env vars, shared state
    database.py        → Thread-safe SQLite + schema management
    services/
        detector.py    → YOLO11 model + HUD rendering
        tts.py         → Text-to-speech alerts
        websocket_manager.py → WebSocket broadcasting
    routes/
        auth.py        → Login, Register, Token, Password Reset
        logs.py        → Detection logs CRUD + CSV export
        settings.py    → System settings management
        analytics.py   → Charts, heatmap, system status
        camera.py      → Camera control + video streaming
"""

import asyncio
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

from config import CORS_ORIGINS, active_sessions
from database import init_db, load_settings_cache
from services.websocket_manager import manager
import services.websocket_manager as ws_module

# ─── Import Route Modules ───
from routes.auth import router as auth_router
from routes.logs import router as logs_router
from routes.settings import router as settings_router
from routes.analytics import router as analytics_router
from routes.analytics import set_inference_time_getter
from routes.camera import router as camera_router, start_video_thread, get_inference_time
from routes.zones import router as zones_router, init_camera_zones
from routes.model_info import router as model_info_router
from routes.users import router as users_router
from routes.chat import router as chat_router
from routes.audit import router as audit_router
from services.snapshot_retention import start_retention_thread


# ─── Lifespan (modern startup/shutdown) ───
@asynccontextmanager
async def lifespan(application: FastAPI):
    """Application lifespan: startup and shutdown events."""
    ws_module.global_loop = asyncio.get_running_loop()
    yield


# ─── Create Application ───    
app = FastAPI(
    title="PestGuard AI API",
    version="2.0.0",
    description="""
## AI-Powered Bio-Hazard & Pest Detection System

Real-time warehouse surveillance API that detects and classifies bio-hazards and pests
using a custom-trained YOLO11 model.

### Detection Classes
- **Snake** → Bio-Hazard (Danger) — Immediate evacuation alert
- **Cat** → Contamination (Warning) — Sanitization required
- **Gecko/Lizard** → Monitoring (Info) — Entry point inspection

### Architecture
- **Modular FastAPI** backend with route-based separation
- **Thread-safe SQLite** with WAL mode for concurrent access
- **WebSocket** push notifications with exponential backoff
- **bcrypt** password hashing with SHA-256 auto-migration
- **29 automated tests** via pytest

Built for the **AI Open Innovation Challenge 2026** — PT. Kawan Lama Group.
    """,
    contact={
        "name": "Team Andalusia — PestGuard AI",
        "url": "https://github.com/SultanZhalifa/PestGuard-AI",
    },
    license_info={
        "name": "MIT License",
    },
    openapi_tags=[
        {"name": "Authentication", "description": "Login, registration, and password management"},
        {"name": "Detection Logs", "description": "CRUD operations for AI detection events"},
        {"name": "Settings", "description": "System configuration management"},
        {"name": "Analytics", "description": "Real-time charts, trends, and status"},
        {"name": "Camera", "description": "Camera control, video streaming, and AI inference"},
        {"name": "System", "description": "Health check, model info, and system metadata"},
    ],
    lifespan=lifespan,
)

# ─── CORS Middleware ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Security Headers Middleware ───
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    # Don't cache API responses (except static/stream endpoints)
    if not request.url.path.startswith(("/api/video_feed", "/api/snapshots")):
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    return response


# ─── Global Exception Handlers ───
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return clean 422 with field-level details."""
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": exc.errors(),
        },
    )


@app.exception_handler(ValidationError)
async def pydantic_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": "Data validation error", "errors": exc.errors()},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """Catch-all — prevents stack traces leaking to clients in production."""
    import logging
    logging.getLogger("uvicorn.error").error(
        "Unhandled exception on %s %s: %s",
        request.method, request.url.path, exc, exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred."},
    )

# ─── Register Route Modules ───
app.include_router(auth_router)
app.include_router(logs_router)
app.include_router(settings_router)
app.include_router(analytics_router)
app.include_router(camera_router)
app.include_router(zones_router)
app.include_router(model_info_router)
app.include_router(users_router)
app.include_router(chat_router)
app.include_router(audit_router)

# ─── Wire cross-module dependencies ───
set_inference_time_getter(get_inference_time)


# ─── WebSocket Endpoint ───
@app.websocket("/api/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    # Security: verify token from query param (WebSocket can't send headers)
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Missing auth token")
        return
    session = active_sessions.get(token)
    if not session or time.time() > session.get("expires", 0):
        await websocket.close(code=4001, reason="Invalid or expired token")
        return

    await manager.connect(websocket)
    try:
        # Heartbeat: ping every 25s to prevent idle proxy drops
        async def _heartbeat():
            while True:
                await asyncio.sleep(25)
                try:
                    await websocket.send_text('{"type":"ping"}')
                except Exception:
                    break

        heartbeat_task = asyncio.create_task(_heartbeat())
        try:
            while True:
                await websocket.receive_text()
        finally:
            heartbeat_task.cancel()
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket)


# ─── Initialize ───
init_db()
init_camera_zones()
load_settings_cache()
start_video_thread()
start_retention_thread()


# ─── Run Server ───
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

