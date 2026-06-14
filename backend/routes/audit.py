"""
PestGuard AI — Audit Log Routes (Admin only)
=============================================
Read-only access to the security & compliance audit trail.
Entries are written by record_audit() across auth, settings, users, and logs.
"""

from fastapi import APIRouter, Depends

from config import require_role
from database import fetch_audit

router = APIRouter(prefix="/api", tags=["System"])


@router.get("/audit-log")
def get_audit_log(limit: int = 100, session: dict = Depends(require_role("admin"))):
    """Return the most recent audit entries (newest first). Admin only."""
    limit = max(1, min(int(limit), 500))
    return {"entries": fetch_audit(limit)}
