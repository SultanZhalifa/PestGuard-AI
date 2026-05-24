"""
Smart Warehouse — Configuration & Constants
=============================================
Centralized configuration, environment variable loading,
and shared in-memory state for the application.
"""

import os
import time
import threading
from pathlib import Path
from collections import defaultdict
from typing import Optional
from dotenv import load_dotenv
from fastapi import HTTPException, Header

# ─── Load environment variables ───
load_dotenv()

# ─── Paths ───
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = os.getenv("DB_PATH", str(BASE_DIR / "warehouse.db"))

# ─── Security ───
SECRET_KEY = os.getenv("SECRET_KEY", "smartwarehouse-dev-key-change-in-production")
CORS_ORIGINS = [o.strip() for o in os.getenv(
    "CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")]

# ─── AI Detection Scope (Case 1: Bio-Hazard & Pest Detection) ───
TRACKED_CLASSES = {"Snake", "Cat", "Gecko", "Lizard"}
DANGER_CLASSES = {"Snake"}          # Bio-Hazard → danger
WARNING_CLASSES = {"Cat"}           # Contamination → warning
# Gecko, Lizard                     # Monitoring → info

# Normalize class names from any model output to standard names
CLASS_NAME_MAP = {
    "snake": "Snake", "cat": "Cat", "gecko": "Gecko", "lizard": "Lizard",
    "tokek": "Gecko", "cicak": "Gecko", "kadal": "Lizard",
    "ular": "Snake", "kucing": "Cat",
}

# Indonesian translation for TTS alerts
TRANSLATE_DICT = {
    "Snake": "ular", "Cat": "kucing", "Gecko": "gecko", "Lizard": "kadal"
}

# ─── Timing Constants ───
DETECTION_COOLDOWN_SECONDS = 10.0
TTS_COOLDOWN_SECONDS = 8.0
DEFAULT_THRESHOLD = int(os.getenv("DEFAULT_THRESHOLD", "50"))

# ─── Inference Performance ───
INFERENCE_FRAME_SKIP = int(os.getenv("INFERENCE_FRAME_SKIP", "3"))  # Run inference every N frames
INFERENCE_QUEUE_SIZE = 1  # Drop stale frames when inference is busy

# ─── In-Memory Stores ───
# Sessions are intentionally ephemeral — users re-login if server restarts.
# Invite tokens and password reset codes are persisted in SQLite (see database.py).
_sessions_lock = threading.RLock()

active_sessions: dict = {}          # token -> { username, role, expires }


# ─── Thread-safe session helpers ───
def get_session(token: str) -> Optional[dict]:
    with _sessions_lock:
        return active_sessions.get(token)


def set_session(token: str, data: dict):
    with _sessions_lock:
        active_sessions[token] = data


def delete_session(token: str):
    with _sessions_lock:
        active_sessions.pop(token, None)


def delete_all_user_sessions(username: str):
    """Revoke all active sessions for a given user (e.g. on password change)."""
    with _sessions_lock:
        to_delete = [t for t, s in active_sessions.items() if s.get('username') == username]
        for t in to_delete:
            del active_sessions[t]


# Separate rate limiters per endpoint type (prevents cross-contamination)
login_rate_limiter = defaultdict(list)       # ip -> [timestamps]
forgot_pw_rate_limiter = defaultdict(list)   # ip -> [timestamps]
invite_rate_limiter = defaultdict(list)      # ip -> [timestamps]

# ─── App Settings Cache (loaded from DB at startup) ───
APP_SETTINGS = {}


# ─── Rate Limiter ───
def check_rate_limit(rate_limiter: dict, client_ip: str,
                     max_attempts: int = 5, window_seconds: int = 60):
    """Check if IP is rate-limited for the given limiter. Raises 429 if exceeded."""
    now = time.time()
    rate_limiter[client_ip] = [
        t for t in rate_limiter[client_ip] if now - t < window_seconds
    ]
    if len(rate_limiter[client_ip]) >= max_attempts:
        raise HTTPException(
            status_code=429,
            detail="Too many attempts. Please wait a minute before trying again."
        )


def record_attempt(rate_limiter: dict, client_ip: str):
    """Record an attempt for rate limiting on the given limiter."""
    rate_limiter[client_ip].append(time.time())


# ─── Auth Guards (Dependencies) ───
def verify_token(authorization: Optional[str] = Header(None),
                 allow_password_change: bool = False):
    """FastAPI dependency to verify Bearer token in request headers."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.replace("Bearer ", "", 1)
    session = get_session(token)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session.")
    if time.time() > session["expires"]:
        delete_session(token)
        raise HTTPException(status_code=401, detail="Session expired. Please log in again.")

    # Security: block API access until default password is changed
    if session.get("must_change_password") and not allow_password_change:
        raise HTTPException(
            status_code=403,
            detail="You must change your password before accessing the system."
        )

    return session


def require_role(*allowed_roles: str):
    """FastAPI dependency factory: verify token AND check role membership."""
    def checker(authorization: Optional[str] = Header(None)):
        session = verify_token(authorization)
        if session.get("role") not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient permissions. Required role: {' or '.join(allowed_roles)}."
            )
        return session
    return checker


# ─── Rate Limiter Cleanup (prevents memory leak) ───
def _cleanup_rate_limiters():
    """Periodically purge stale IPs from all rate limiters and expired sessions."""
    while True:
        time.sleep(300)  # Every 5 minutes
        now = time.time()
        # Clean rate limiters
        for limiter in [login_rate_limiter, forgot_pw_rate_limiter, invite_rate_limiter]:
            stale_keys = [k for k, v in list(limiter.items()) if all(now - t > 120 for t in v)]
            for k in stale_keys:
                del limiter[k]
        # Clean expired sessions
        with _sessions_lock:
            expired = [t for t, s in list(active_sessions.items()) if now > s.get('expires', 0)]
            for t in expired:
                del active_sessions[t]


threading.Thread(target=_cleanup_rate_limiters, daemon=True).start()
