"""
Smart Warehouse — Settings Routes
===================================
System configuration management with
persistent database storage and in-memory cache.
"""

from typing import Dict

from fastapi import APIRouter, Depends

from config import verify_token, require_role, APP_SETTINGS, DEFAULT_THRESHOLD
from database import get_db, load_settings_cache, record_audit  # load_settings_cache used after writes

router = APIRouter(prefix="/api", tags=["Settings"])


# ─── Get Settings (any authenticated user) ───
@router.get("/settings")
def get_settings(session: dict = Depends(verify_token)):
    return APP_SETTINGS


# ─── Update Settings (admin or manager only) ───
ALLOWED_SETTINGS_KEYS = {"cameraUrl", "threshold", "notifications", "darkMode", "cameraZone"}


@router.post("/settings")
def update_settings(settings: Dict, session: dict = Depends(require_role("admin", "manager"))):
    with get_db() as conn:
        cursor = conn.cursor()
        for k, v in settings.items():
            if k not in ALLOWED_SETTINGS_KEYS:
                continue  # Security: ignore unknown keys
            val_str = "true" if v is True else "false" if v is False else str(v)
            cursor.execute(
                "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
                (k, val_str),
            )

    load_settings_cache()
    changed = ", ".join(k for k in settings if k in ALLOWED_SETTINGS_KEYS)
    record_audit("settings.update", actor=session.get("username"), role=session.get("role"),
                 detail=f"Updated: {changed}")
    return {"status": "success", "message": "Settings saved successfully."}


# ─── Reset Settings to Defaults (admin only) ───
@router.post("/settings/reset")
def reset_settings(session: dict = Depends(require_role("admin"))):
    defaults = {
        "cameraUrl": "0",
        "threshold": str(DEFAULT_THRESHOLD),
        "notifications": "true",
        "darkMode": "false",
        "cameraZone": "Zone A",
    }

    with get_db() as conn:
        cursor = conn.cursor()
        for k, v in defaults.items():
            cursor.execute(
                "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (k, v)
            )

    load_settings_cache()
    record_audit("settings.reset", actor=session.get("username"), role=session.get("role"),
                 detail="All settings restored to defaults")
    return {"status": "success", "message": "All settings restored to defaults."}
