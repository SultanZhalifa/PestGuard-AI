"""
Snapshot Retention Policy
==========================
Background cleanup of old detection snapshots so disk usage stays bounded.

Rules (whichever triggers first):
  - Delete snapshot files older than RETENTION_DAYS days
  - Cap total snapshot count at MAX_SNAPSHOT_COUNT (oldest first eviction)

Also clears snapshot_path references in the DB once the underlying file is gone,
so the UI does not show broken thumbnails.

Runs hourly in a daemon thread started from app.py.
"""

import os
import time
import threading
from pathlib import Path

from database import get_db

RETENTION_DAYS = 7
MAX_SNAPSHOT_COUNT = 1000
CLEANUP_INTERVAL_SECONDS = 60 * 60  # 1 hour

SNAPSHOT_DIR = Path(__file__).resolve().parent.parent / "snapshots"

_cleanup_thread = None


def _list_snapshots_with_mtime():
    """Return sorted list of (path, mtime) for all .jpg files. Newest last."""
    if not SNAPSHOT_DIR.exists():
        return []
    entries = []
    for entry in SNAPSHOT_DIR.iterdir():
        if entry.is_file() and entry.suffix.lower() in (".jpg", ".jpeg", ".png"):
            try:
                entries.append((entry, entry.stat().st_mtime))
            except OSError:
                continue
    entries.sort(key=lambda x: x[1])  # oldest first
    return entries


def _delete_files(paths):
    """Delete files and clear matching DB rows' snapshot_path."""
    deleted_names = []
    for p in paths:
        try:
            p.unlink()
            deleted_names.append(p.name)
        except OSError as e:
            print(f"[RETENTION] Failed to delete {p.name}: {e}")

    if not deleted_names:
        return 0

    # Clear DB references so UI does not show broken thumbnails
    try:
        with get_db() as conn:
            cursor = conn.cursor()
            placeholders = ",".join("?" * len(deleted_names))
            cursor.execute(
                f"UPDATE logs SET snapshot_path='' WHERE snapshot_path IN ({placeholders})",
                deleted_names,
            )
    except Exception as e:
        print(f"[RETENTION] Failed to clear DB references: {e}")

    return len(deleted_names)


def cleanup_once():
    """Run a single cleanup pass. Returns number of files deleted."""
    entries = _list_snapshots_with_mtime()
    if not entries:
        return 0

    now = time.time()
    cutoff = now - (RETENTION_DAYS * 86400)

    to_delete = []

    # Rule 1: age-based deletion
    for path, mtime in entries:
        if mtime < cutoff:
            to_delete.append(path)

    # Rule 2: count-based deletion (oldest first)
    remaining = [e for e in entries if e[0] not in to_delete]
    if len(remaining) > MAX_SNAPSHOT_COUNT:
        excess = len(remaining) - MAX_SNAPSHOT_COUNT
        for path, _ in remaining[:excess]:
            to_delete.append(path)

    if not to_delete:
        return 0

    deleted_count = _delete_files(to_delete)
    if deleted_count:
        print(
            f"[RETENTION] Deleted {deleted_count} snapshot(s) "
            f"(age > {RETENTION_DAYS}d or count > {MAX_SNAPSHOT_COUNT})"
        )
    return deleted_count


def _retention_loop():
    """Background loop — runs cleanup_once() every hour."""
    # Run once on startup to clean any backlog
    try:
        cleanup_once()
    except Exception as e:
        print(f"[RETENTION] Startup cleanup error: {e}")

    while True:
        time.sleep(CLEANUP_INTERVAL_SECONDS)
        try:
            cleanup_once()
        except Exception as e:
            print(f"[RETENTION] Cleanup error: {e}")


def start_retention_thread():
    """Start the daemon thread. Idempotent."""
    global _cleanup_thread
    if _cleanup_thread is not None and _cleanup_thread.is_alive():
        return
    _cleanup_thread = threading.Thread(
        target=_retention_loop, daemon=True, name="snapshot-retention"
    )
    _cleanup_thread.start()
    print(
        f"[RETENTION] Started — keeping {MAX_SNAPSHOT_COUNT} most recent snapshots, "
        f"max age {RETENTION_DAYS} days"
    )
