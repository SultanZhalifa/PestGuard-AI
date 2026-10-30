"""
Smart Warehouse — Camera Zones Routes
=======================================
Multi-zone camera management with real-time
status tracking via database persistence.
"""

import ipaddress
import os
import socket
from pathlib import Path
from urllib.parse import urlsplit
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from config import verify_token, require_role, BASE_DIR
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
                # New zone — insert with default source
                cursor.execute(
                    "INSERT INTO camera_zones (id, name, location, source, status) "
                    "VALUES (?, ?, ?, ?, ?)",
                    (z["id"], z["name"], z["location"], z["source"], z["status"])
                )
            else:
                existing = row[0] or ""
                new_src = z["source"]
                # Always update if:
                # 1. Existing source is empty or equals the zone id (placeholder)
                # 2. Existing source is a file path that no longer exists on disk
                #    but the new default path does exist (handles project folder renames)
                should_update = (
                    not existing
                    or existing == z["id"]
                    or (
                        new_src
                        and existing != new_src
                        and not existing.isdigit()
                        and not existing.lower().startswith(("rtsp://", "http://", "https://"))
                        and not os.path.exists(existing)
                        and os.path.exists(new_src)
                    )
                )
                if should_update and new_src:
                    cursor.execute(
                        "UPDATE camera_zones SET source=? WHERE id=?",
                        (new_src, z["id"])
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
    if source.lower().startswith("rtsp://"):
        return "cctv"
    if source.lower().startswith(("http://", "https://")):
        return "stream"
    return "video"


STREAM_SCHEMES = ("rtsp", "rtsps", "http", "https")


def _validate_source(raw: str) -> str:
    """Security: only allow a webcam index, a stream URL, or a file in demo_videos/.

    The source is handed to cv2.VideoCapture, which opens local files and any
    URL, so a blocklist of strings isn't enough. LAN addresses stay allowed
    because warehouse CCTV lives on the local network; loopback, link-local
    (cloud metadata), unspecified and multicast addresses are rejected after
    DNS resolution.
    """
    src = raw.strip()
    if not src:
        return ""
    if src.isdigit():
        if int(src) > 9:
            raise HTTPException(status_code=400, detail="Webcam index must be 0-9.")
        return src

    parts = urlsplit(src)
    if parts.scheme:
        if parts.scheme.lower() not in STREAM_SCHEMES or not parts.hostname:
            raise HTTPException(status_code=400, detail="Use an rtsp://, http:// or https:// stream URL.")
        try:
            infos = socket.getaddrinfo(parts.hostname, None)
        except (socket.gaierror, UnicodeError):
            raise HTTPException(status_code=400, detail="Camera host could not be resolved.")
        for info in infos:
            ip = ipaddress.ip_address(info[4][0].split("%")[0])
            if ip.is_loopback or ip.is_link_local or ip.is_unspecified or ip.is_multicast or ip.is_reserved:
                raise HTTPException(status_code=400, detail="Internal network addresses are not allowed.")
        return src

    path = Path(src)
    if not path.is_absolute():
        path = DEMO_VIDEOS_DIR / path
    path = path.resolve()
    if not path.is_relative_to(DEMO_VIDEOS_DIR.resolve()):
        raise HTTPException(status_code=400, detail="Video files must be inside backend/demo_videos/.")
    return str(path)


class ZoneUpdateRequest(BaseModel):
    source: Optional[str] = None
    status: Optional[str] = None
    name: Optional[str] = None


# ─── Update Camera Zone ───
@router.post("/cameras/{zone_id}")
def update_camera_zone(zone_id: str, data: ZoneUpdateRequest,
                       session: dict = Depends(require_role("admin", "manager"))):
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT id FROM camera_zones WHERE id=?", (zone_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Zone not found")

        if data.source is not None:
            src = _validate_source(data.source)
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


# ─── Test Camera Source Connectivity ───
@router.post("/cameras/{zone_id}/test")
def test_camera_source(zone_id: str, session: dict = Depends(require_role("admin", "manager"))):
    """Quick stream validation: open capture, read 1 frame, report result."""
    try:
        import cv2
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="Camera features require OpenCV. Run the backend locally."
        )

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT source FROM camera_zones WHERE id=?", (zone_id,))
        row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Zone not found")

    source = row[0]
    if not source:
        raise HTTPException(status_code=400, detail="No source configured for this zone.")

    cap = None
    try:
        if source.isdigit():
            cap = cv2.VideoCapture(int(source))
        else:
            cap = cv2.VideoCapture(source)

        if not cap or not cap.isOpened():
            return {"status": "fail", "message": f"Cannot open source: {source}"}

        success, frame = cap.read()
        if not success or frame is None:
            return {"status": "fail", "message": "Source opened but no frame received."}

        h, w = frame.shape[:2]
        return {
            "status": "ok",
            "message": f"Connection successful. Frame: {w}x{h}.",
            "resolution": f"{w}x{h}",
        }
    except Exception as e:
        return {"status": "fail", "message": str(e)}
    finally:
        if cap:
            cap.release()
