"""
Smart Warehouse — Authentication Routes
=========================================
Username-based login, invitation flow, token verification,
forced password change, and email-based password recovery.
All invite tokens and reset codes are persisted to SQLite DB
so they survive server restarts.
"""

import time
import hashlib
import logging
import secrets
import random
import string
import re

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Header
from pydantic import BaseModel

from config import (
    active_sessions,
    login_rate_limiter, forgot_pw_rate_limiter, invite_rate_limiter,
    check_rate_limit, record_attempt,
    verify_token, require_role,
)
from database import get_db

router = APIRouter(prefix="/api", tags=["Authentication"])


def _revoke_user_sessions(user_id: int):
    """Invalidate all active sessions for a given user_id."""
    tokens_to_remove = [
        tok for tok, sess in active_sessions.items()
        if sess.get("user_id") == user_id
    ]
    for tok in tokens_to_remove:
        del active_sessions[tok]


# ─── Request Models ───
class LoginRequest(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ForgotPasswordRequest(BaseModel):
    email: str


class ResetPasswordRequest(BaseModel):
    email: str
    code: str
    new_password: str


class InviteRequest(BaseModel):
    email: str
    username: str
    role: str = "operator"


class AcceptInviteRequest(BaseModel):
    token: str
    name: str
    password: str


# ─── Helpers ───
def _hash_password(plain: str):
    """Hash a password (bcrypt preferred, SHA-256 fallback)."""
    try:
        import bcrypt
        return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode(), ""
    except ImportError:
        salt = secrets.token_hex(16)
        return hashlib.sha256((plain + salt).encode()).hexdigest(), salt


def _verify_password(plain: str, stored_hash: str, salt: str) -> bool:
    """Verify a password against its stored hash (bcrypt or legacy SHA-256)."""
    salt = salt or ""
    try:
        import bcrypt
        if stored_hash.startswith("$2b$") or stored_hash.startswith("$2a$"):
            return bcrypt.checkpw(plain.encode(), stored_hash.encode())
        # Legacy SHA-256
        return hashlib.sha256((plain + salt).encode()).hexdigest() == stored_hash
    except ImportError:
        return hashlib.sha256((plain + salt).encode()).hexdigest() == stored_hash


# ─── Input Validation ───
_USERNAME_RE = re.compile(r'^[a-zA-Z0-9_.-]{3,30}$')
_EMAIL_RE = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')


def _validate_username(username: str):
    if not _USERNAME_RE.match(username):
        raise HTTPException(
            status_code=400,
            detail="Username must be 3-30 characters (letters, numbers, underscore, dot, dash)."
        )


def _validate_password(password: str):
    if len(password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters.")
    if len(password) > 128:
        raise HTTPException(status_code=400, detail="Password must be at most 128 characters.")


def _validate_email(email: str):
    if not _EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Invalid email format.")


def _sanitize_name(name: str) -> str:
    import re as _re
    clean = _re.sub(r'<[^>]+>', '', name).strip()
    if len(clean) > 100:
        clean = clean[:100]
    if not clean:
        raise HTTPException(status_code=400, detail="Name cannot be empty.")
    return clean


# ─── DB helpers: invite tokens ───
def _db_save_invite(token: str, username: str, email: str, role: str, expires: float):
    with get_db() as conn:
        conn.cursor().execute(
            "INSERT OR REPLACE INTO invite_tokens (token, username, email, role, expires, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?)",
            (token, username, email, role, expires, time.time())
        )


def _db_get_invite(token: str) -> dict | None:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT username, email, role, expires FROM invite_tokens WHERE token=?", (token,)
        )
        row = cursor.fetchone()
    if row:
        return {"username": row[0], "email": row[1], "role": row[2], "expires": row[3]}
    return None


def _db_delete_invite(token: str):
    with get_db() as conn:
        conn.cursor().execute("DELETE FROM invite_tokens WHERE token=?", (token,))


def _db_cleanup_expired_invites():
    with get_db() as conn:
        conn.cursor().execute("DELETE FROM invite_tokens WHERE expires<?", (time.time(),))


# ─── DB helpers: password reset codes ───
def _db_save_reset_code(email: str, code: str, expires: float):
    with get_db() as conn:
        conn.cursor().execute(
            "INSERT OR REPLACE INTO password_reset_codes (email, code, expires, attempts) "
            "VALUES (?, ?, ?, 0)",
            (email, code, expires)
        )


def _db_get_reset_code(email: str) -> dict | None:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT code, expires, attempts FROM password_reset_codes WHERE email=?", (email,)
        )
        row = cursor.fetchone()
    if row:
        return {"code": row[0], "expires": row[1], "attempts": row[2]}
    return None


def _db_increment_reset_attempts(email: str):
    with get_db() as conn:
        conn.cursor().execute(
            "UPDATE password_reset_codes SET attempts=attempts+1 WHERE email=?", (email,)
        )


def _db_delete_reset_code(email: str):
    with get_db() as conn:
        conn.cursor().execute("DELETE FROM password_reset_codes WHERE email=?", (email,))


# ─── Login ───
@router.post("/login")
def login(request: LoginRequest, req: Request):
    _validate_username(request.username)
    client_ip = req.client.host if req.client else "unknown"
    check_rate_limit(login_rate_limiter, client_ip)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, password_hash, salt, name, role, must_change_password "
            "FROM users WHERE username = ? COLLATE NOCASE",
            (request.username,)
        )
        user = cursor.fetchone()

    if not user:
        record_attempt(login_rate_limiter, client_ip)
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    user_id, stored_hash, salt, name, role, must_change = user

    if not _verify_password(request.password, stored_hash, salt):
        record_attempt(login_rate_limiter, client_ip)
        raise HTTPException(status_code=401, detail="Invalid username or password.")

    # Auto-migrate legacy SHA-256 hash to bcrypt
    if not (stored_hash.startswith("$2b$") or stored_hash.startswith("$2a$")):
        try:
            import bcrypt
            new_hash = bcrypt.hashpw(request.password.encode(), bcrypt.gensalt()).decode()
            with get_db() as conn:
                conn.cursor().execute(
                    "UPDATE users SET password_hash=?, salt='' WHERE id=?",
                    (new_hash, user_id)
                )
        except ImportError:
            pass

    # Generate session
    token = secrets.token_hex(32)
    active_sessions[token] = {
        "user_id": user_id,
        "username": request.username.lower(),
        "role": role,
        "must_change_password": bool(must_change),
        "expires": time.time() + 86400,  # 24h
    }
    return {
        "token": token,
        "user": {
            "username": request.username.lower(),
            "name": name,
            "role": role,
            "must_change_password": bool(must_change),
        },
    }


# ─── Change Password ───
@router.post("/change-password")
def change_password(request: ChangePasswordRequest,
                    authorization: Optional[str] = Header(None)):
    from config import verify_token as _verify
    session = _verify(authorization, allow_password_change=True)
    _validate_password(request.new_password)

    user_id = session.get("user_id")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT password_hash, salt FROM users WHERE id=?", (user_id,))
        row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="User not found.")

    stored_hash, salt = row
    if not _verify_password(request.current_password, stored_hash, salt):
        raise HTTPException(status_code=401, detail="Current password is incorrect.")

    new_hash, new_salt = _hash_password(request.new_password)
    with get_db() as conn:
        conn.cursor().execute(
            "UPDATE users SET password_hash=?, salt=?, must_change_password=0 WHERE id=?",
            (new_hash, new_salt, user_id)
        )

    _revoke_user_sessions(user_id)
    return {"status": "success", "message": "Password changed successfully."}


# ─── Admin Invite System (DB-persisted) ───
@router.post("/invite-user")
def invite_user(request: InviteRequest, req: Request,
                session: dict = Depends(require_role("admin"))):
    _validate_username(request.username)
    _validate_email(request.email)

    # Cleanup stale invites first
    _db_cleanup_expired_invites()

    # Check if username or email already exists in users table
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id FROM users WHERE username = ? COLLATE NOCASE OR email = ?",
            (request.username, request.email)
        )
        if cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail="A user with this username or email already exists."
            )
        # Also check pending invites
        cursor.execute(
            "SELECT token FROM invite_tokens WHERE (username = ? COLLATE NOCASE OR email = ?) AND expires > ?",
            (request.username, request.email, time.time())
        )
        if cursor.fetchone():
            raise HTTPException(
                status_code=400,
                detail="A pending invitation for this username or email already exists."
            )

    invite_token = secrets.token_urlsafe(32)
    expires = time.time() + 86400 * 3  # Valid for 3 days
    _db_save_invite(invite_token, request.username.lower(), request.email, request.role, expires)

    origin = req.headers.get("origin") or str(req.base_url).rstrip("/")
    invite_link = f"{origin}/accept-invite?token={invite_token}"

    return {
        "status": "success",
        "message": f"Invitation generated for {request.email}",
        "invite_link": invite_link,
        "token": invite_token,
        "expires_in_hours": 72,
    }


@router.post("/accept-invite")
def accept_invite(request: AcceptInviteRequest, req: Request):
    client_ip = req.client.host if req.client else "unknown"
    check_rate_limit(invite_rate_limiter, client_ip, max_attempts=5, window_seconds=120)

    invite = _db_get_invite(request.token)
    if not invite:
        record_attempt(invite_rate_limiter, client_ip)
        raise HTTPException(status_code=400, detail="Invalid or expired invitation token.")

    if time.time() > invite["expires"]:
        record_attempt(invite_rate_limiter, client_ip)
        _db_delete_invite(request.token)
        raise HTTPException(status_code=400, detail="Invitation has expired.")

    _validate_password(request.password)
    request.name = _sanitize_name(request.name)

    pw_hash, salt = _hash_password(request.password)

    with get_db() as conn:
        try:
            conn.cursor().execute(
                "INSERT INTO users (username, email, password_hash, salt, name, role, must_change_password) "
                "VALUES (?, ?, ?, ?, ?, ?, 0)",
                (invite["username"], invite["email"], pw_hash, salt, request.name, invite["role"])
            )
        except Exception:
            raise HTTPException(
                status_code=400,
                detail="Failed to create account. Username or email may already be in use."
            )

    _db_delete_invite(request.token)
    return {"status": "success", "message": "Account created successfully. You can now log in."}


# ─── Logout ───
@router.post("/logout")
def logout(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = authorization.replace("Bearer ", "")
    active_sessions.pop(token, None)
    return {"status": "success", "message": "Logged out successfully."}


# ─── Token Verification ───
@router.get("/verify-token")
def verify_token_endpoint(session: dict = Depends(verify_token)):
    return {
        "status": "valid",
        "user": {
            "username": session.get("username"),
            "role": session.get("role"),
        },
    }


# ─── Forgot Password (DB-persisted, admin-viewable) ───
@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, req: Request):
    client_ip = req.client.host if req.client else "unknown"
    check_rate_limit(forgot_pw_rate_limiter, client_ip, max_attempts=3, window_seconds=120)
    record_attempt(forgot_pw_rate_limiter, client_ip)

    # Security: always return same response to prevent user enumeration
    generic_response = {
        "status": "success",
        "message": "If an account with that email exists, a reset code has been generated. Contact your administrator to obtain the code.",
    }

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email=?", (request.email,))
        user = cursor.fetchone()

    if not user:
        return generic_response  # Don't reveal that email doesn't exist

    code = "".join(random.choices(string.digits, k=6))
    _db_save_reset_code(request.email, code, time.time() + 600)

    # OTP shown on server console only — never sent over the network
    logging.warning("[SECURITY] Password reset OTP for %s: %s (expires in 10 min)", request.email, code)

    return generic_response


# ─── Admin: View Active Reset Codes ───
@router.get("/admin/reset-codes")
def list_reset_codes(session: dict = Depends(require_role("admin"))):
    """Admin-only endpoint to view all active (non-expired) password reset codes."""
    now = time.time()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT email, code, expires, attempts FROM password_reset_codes WHERE expires > ?",
            (now,)
        )
        rows = cursor.fetchall()

    return {
        "reset_codes": [
            {
                "email": row[0],
                "code": row[1],
                "expires_in_seconds": int(row[2] - now),
                "attempts_used": row[3],
            }
            for row in rows
        ]
    }


# ─── Reset Password ───
@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest):
    stored = _db_get_reset_code(request.email)

    if not stored:
        raise HTTPException(
            status_code=400, detail="No reset code found. Please request a new one."
        )

    if time.time() > stored["expires"]:
        _db_delete_reset_code(request.email)
        raise HTTPException(
            status_code=400, detail="Reset code has expired. Please request a new one."
        )

    if stored["attempts"] >= 3:
        _db_delete_reset_code(request.email)
        raise HTTPException(
            status_code=400,
            detail="Too many failed attempts. Please request a new reset code.",
        )

    if stored["code"] != request.code:
        _db_increment_reset_attempts(request.email)
        remaining = 3 - (stored["attempts"] + 1)
        raise HTTPException(
            status_code=400,
            detail=f"Invalid reset code. {remaining} attempt(s) remaining.",
        )

    if len(request.new_password) < 6:
        raise HTTPException(
            status_code=400, detail="Password must be at least 6 characters."
        )

    new_hash, new_salt = _hash_password(request.new_password)

    with get_db() as conn:
        conn.cursor().execute(
            "UPDATE users SET password_hash=?, salt=?, must_change_password=0 WHERE email=?",
            (new_hash, new_salt, request.email),
        )

    _db_delete_reset_code(request.email)
    return {
        "status": "success",
        "message": "Password updated successfully. You can now log in.",
    }
