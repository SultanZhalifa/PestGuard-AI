"""
Smart Warehouse — Camera Zones Routes
=======================================
Multi-zone camera management with real-time
status tracking via database persistence.
"""

from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from config import verify_token, BASE_DIR
from database import get_db

router = APIRouter(prefix="/api", tags=["Camera"])

DEMO_VIDEOS_DIR = BASE_DIR / "demo_videos"

# Default zone configuration. Sources resolve to absolute paths under
# backend/demo_videos/. Zone A defaults to webcam, Zone D stays offline.
DEFAULT_ZONES = [
    {"id": "zone-a", "name": "Zone A", "location": "Main Warehouse",
     "source": "0", "status": "standby"},
    {"id": "zone-b", "name": "Zone B", "location": "Storage Area",
     "source": str(DEMO_VIDEOS_DIR / "Cat.mp4"), "status": "standby"},
    {"id": "zone-c", "name": "Zone C", "location": "Loading Dock",
     "source": str(DEMO_VIDEOS_DIR / "Gecko.mp4"), "status": "standby"},
    {"id": "zone-d", "name": "Zone D", "location": "Entrance Gate",
     "source": str(DEMO_VIDEOS_DIR / "Snake.mp4"), "status": "standby"},
]


def init_camera_zones():
    """Create camera_zones table and seed/upgrade default zones (idempotent)."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''CREATE TABLE IF NOT EXISTS camera_zones (
            id TEXT PRIMARY KEY,
            name TEXT,
            location TEXT,
            source TEXT DEFAULT '',
            status TEXT DEFAULT 'standby',
            last_detection TEXT DEFAULT '',
            detection_count INTEGER DEFAULT 0
        )''')

        for z in DEFAULT_ZONES:
            cursor.execute("SELECT source FROM camera_zones WHERE id=?", (z["id"],))
            row = cursor.fetchone()
            if row is None:
                cursor.execute(
                    "INSERT INTO camera_zones (id, name, location, source, status) "
                    "VALUES (?, ?, ?, ?, ?)",
                    (z["id"], z["name"], z["location"], z["source"], z["status"])
                )
            else:
                # Upgrade source path if existing row has empty/legacy value but
                # default config now provides a real video. Don't overwrite if
                # user has manually customised it.
                existing = row[0] or ""
                if z["source"] and (existing == "" or existing == z["id"]):
                    cursor.execute(
                        "UPDATE camera_zones SET source=? WHERE id=?",
                        (z["source"], z["id"])
                    )


# ─── Get All Camera Zones ───
@router.get("/cameras")
def get_camera_zones(auth: bool = Depends(verify_token)):
    # Defer import to avoid circular import (camera.py imports from this module
    # for paths but this endpoint queries live worker state).
    from routes.camera import get_zone_runtime_status

    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='camera_zones'"
        )
        if not cursor.fetchone():
            init_camera_zones()

        cursor.execute(
            "SELECT id, name, location, source, status, last_detection, detection_count "
            "FROM camera_zones ORDER BY id"
        )
        rows = cursor.fetchall()

        zones = []
        for r in rows:
            zone_id, name, location, source, status, last_det, det_count = r

            cursor.execute(
                "SELECT COUNT(*) FROM logs WHERE location LIKE ?",
                (f"%{name}%",)
            )
            real_count = cursor.fetchone()[0]

            cursor.execute(
                "SELECT time, risk FROM logs WHERE location LIKE ? ORDER BY id DESC LIMIT 1",
                (f"%{name}%",)
            )
            last_row = cursor.fetchone()
            last_time = last_row[0] if last_row else ""
            last_risk = last_row[1] if last_row else "info"

            runtime_status = get_zone_runtime_status(zone_id, fallback=status)

            zones.append({
                "id": zone_id,
                "name": name,
                "location": location,
                "source": source,
                "source_type": _classify_source(source),
                "status": runtime_status,
                "has_source": bool(source),
                "last_detection": last_time,
                "detection_count": real_count,
                "last_risk": last_risk,
            })

    return zones


def _classify_source(source: str) -> str:
    """Identify source type for the UI badge."""
    if not source:
        return "none"
    if source in ("0", "1") or source.isdigit():
        return "webcam"
    if source.lower().startswith(("rtsp://", "http://", "https://")):
        return "stream"
    return "video"


class ZoneUpdateRequest(BaseModel):
    source: Optional[str] = None
    status: Optional[str] = None
    name: Optional[str] = None


# ─── Update Camera Zone ───
@router.post("/cameras/{zone_id}")
def update_camera_zone(zone_id: str, data: ZoneUpdateRequest, auth: bool = Depends(verify_token)):
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM camera_zones WHERE id=?", (zone_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Zone not found")

        if data.source is not None:
            # Security: validate camera source to prevent SSRF and path traversal
            src = data.source.strip()
            if src and not src.isdigit():
                # Block dangerous protocols
                if src.lower().startswith(("file://", "ftp://", "gopher://")):
                    raise HTTPException(status_code=400, detail="Invalid source protocol.")
                # Block path traversal
                if ".." in src:
                    raise HTTPException(status_code=400, detail="Invalid source path.")
                # Block obvious internal network targets
                if any(internal in src.lower() for internal in [
                    "169.254.", "127.0.0.1", "localhost", "0.0.0.0",
                    "metadata.google", "metadata.aws",
                ]):
                    raise HTTPException(status_code=400, detail="Internal network addresses are not allowed.")
            cursor.execute(
                "UPDATE camera_zones SET source=? WHERE id=?",
                (src, zone_id)
            )
        if data.status is not None:
            cursor.execute(
                "UPDATE camera_zones SET status=? WHERE id=?",
                (data.status, zone_id)
            )
        if data.name is not None:
            cursor.execute(
                "UPDATE camera_zones SET name=? WHERE id=?",
                (data.name, zone_id)
            )

    return {"status": "success", "message": f"Zone {zone_id} updated."}
