"""
PestGuard AI — Pytest Configuration & Shared Fixtures
======================================================
Test isolation: every test run uses a fresh, throwaway SQLite database in a
temp directory instead of the live ``warehouse.db``. This guarantees the seed
credentials (admin/admin123, …) are valid regardless of how the real database
has been used, so the suite is deterministic on any machine.

This module executes at conftest-import time — *before* pytest collects the test
modules that do ``from app import app`` — which is the only point early enough
to redirect ``DB_PATH`` before the app's import-time ``init_db()`` runs.
"""

import os
import tempfile
from pathlib import Path

# ── Redirect the database to an isolated temp file BEFORE the app imports ──
# config.py reads os.getenv("DB_PATH", ...) at import, and app.py calls
# init_db() at import. Both happen when test_api.py does `from app import app`,
# so this env var must be set here, at conftest-import time.
_TMP_DB_DIR = tempfile.mkdtemp(prefix="pestguard_test_")
_TEST_DB_PATH = str(Path(_TMP_DB_DIR) / "test_warehouse.db")
os.environ["DB_PATH"] = _TEST_DB_PATH

import pytest  # noqa: E402  (import after env setup is intentional)


@pytest.fixture(scope="session", autouse=True)
def _isolated_database():
    """Create the schema in the temp DB and tidy up after the session."""
    # Importing config/database now binds to the temp DB_PATH set above.
    import config
    import database

    # Defensive: keep module-level constants in sync with the temp path even if
    # they were imported before this fixture ran.
    config.DB_PATH = _TEST_DB_PATH
    database.DB_PATH = _TEST_DB_PATH

    database.init_db()
    # Seed users default to must_change_password=1; clear it so the auth fixture
    # can exercise protected endpoints the way an onboarded user would.
    with database.get_db() as conn:
        conn.cursor().execute("UPDATE users SET must_change_password = 0")

    yield

    # Best-effort cleanup of the temp database directory.
    try:
        for f in Path(_TMP_DB_DIR).glob("test_warehouse.db*"):
            f.unlink(missing_ok=True)
        Path(_TMP_DB_DIR).rmdir()
    except OSError:
        pass
