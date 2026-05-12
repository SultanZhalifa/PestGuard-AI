"""
Smart Warehouse — Analytics & Status Routes
=============================================
Real-time analytics (trend charts, risk distribution, zone heatmap)
and system status endpoint — all derived from actual detection data.
"""

import datetime

from fastapi import APIRouter, Depends

from config import verify_token
from database import get_db

router = APIRouter(prefix="/api", tags=["Analytics"])

# Forward reference — set by camera module after initialization
_get_inference_time = lambda: 0


def set_inference_time_getter(fn):
    """Allow camera module to register its inference time getter."""
    global _get_inference_time
    _get_inference_time = fn


# ─── Analytics ───
@router.get("/analytics")
def get_analytics(time_range: str = "weekly", auth: bool = Depends(verify_token)):
    with get_db() as conn:
        cursor = conn.cursor()

        # ── Risk Distribution ──
        cursor.execute("SELECT risk, COUNT(*) FROM logs GROUP BY risk")
        dist_rows = cursor.fetchall()
        distribution = [
            {"name": "Bio-Hazard (Snake)", "value": 0, "color": "var(--alert-danger)"},
            {"name": "Contamination (Cat)", "value": 0, "color": "var(--alert-warning)"},
            {"name": "Monitoring (Gecko/Lizard)", "value": 0, "color": "var(--alert-success)"},
        ]
        for row in dist_rows:
            if row[0] == "danger":
                distribution[0]["value"] = row[1]
            elif row[0] == "warning":
                distribution[1]["value"] = row[1]
            elif row[0] == "info":
                distribution[2]["value"] = row[1]

        # ── Trend Chart ──
        today = datetime.date.today()
        trend = []

        def _make_slot(snake=0, cat=0, gecko=0):
            return {"Snake": snake, "Cat": cat, "Gecko": gecko}

        if time_range == "daily":
            today_str = today.strftime("%Y-%m-%d")
            slots = {f"{h:02d}": _make_slot() for h in range(24)}
            cursor.execute(
                "SELECT SUBSTR(time, 1, 2) AS hr, type, COUNT(*) FROM logs "
                "WHERE date=? GROUP BY hr, type",
                (today_str,),
            )
            for hr, typ, cnt in cursor.fetchall():
                if hr in slots:
                    if typ in ("Gecko", "Lizard"):
                        slots[hr]["Gecko"] += cnt
                    elif typ in slots[hr]:
                        slots[hr][typ] += cnt
            trend = [{"name": f"{h}:00", **slots[h]} for h in sorted(slots)]

        elif time_range == "monthly":
            dates = [(today - datetime.timedelta(days=i)) for i in range(29, -1, -1)]
            date_strs = [d.strftime("%Y-%m-%d") for d in dates]
            slots = {ds: _make_slot() for ds in date_strs}
            cursor.execute(
                f"SELECT date, type, COUNT(*) FROM logs "
                f"WHERE date IN ({','.join('?' * len(date_strs))}) GROUP BY date, type",
                date_strs,
            )
            for ds, typ, cnt in cursor.fetchall():
                if typ in ("Gecko", "Lizard"):
                    slots[ds]["Gecko"] += cnt
                elif typ in slots[ds]:
                    slots[ds][typ] += cnt
            trend = [
                {"name": d.strftime("%d/%m"), **slots[d.strftime("%Y-%m-%d")]}
                for d in dates
            ]

        else:  # weekly (default)
            day_names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            dates = [(today - datetime.timedelta(days=i)) for i in range(6, -1, -1)]
            date_strs = [d.strftime("%Y-%m-%d") for d in dates]
            slots = {ds: _make_slot() for ds in date_strs}
            cursor.execute(
                f"SELECT date, type, COUNT(*) FROM logs "
                f"WHERE date IN ({','.join('?' * len(date_strs))}) GROUP BY date, type",
                date_strs,
            )
            for ds, typ, cnt in cursor.fetchall():
                if typ in ("Gecko", "Lizard"):
                    slots[ds]["Gecko"] += cnt
                elif typ in slots[ds]:
                    slots[ds][typ] += cnt
            trend = [
                {"name": day_names[d.weekday()], **slots[d.strftime("%Y-%m-%d")]}
                for d in dates
            ]

        # ── Zone Heatmap ──
        cursor.execute("SELECT location, COUNT(*) FROM logs GROUP BY location")
        zone_rows = cursor.fetchall()
        total_logs = sum(r[1] for r in zone_rows) if zone_rows else 1
        zone_activity = []
        for row in zone_rows:
            intensity = min(100, int((row[1] / total_logs) * 100))
            zone_activity.append({"zone": row[0], "intensity": intensity})
        if not zone_activity:
            zone_activity = [
                {"zone": "Zone A", "intensity": 0},
                {"zone": "Zone B", "intensity": 0},
                {"zone": "Zone C", "intensity": 0},
                {"zone": "Zone D", "intensity": 0},
            ]

    return {"trend": trend, "distribution": distribution, "zone_activity": zone_activity}


# ─── Peak Hours (Predictive Risk) ───
@router.get("/analytics/peak-hours")
def get_peak_hours(auth: bool = Depends(verify_token)):
    """
    Analyzes historical detection timestamps to identify peak risk hours per zone.
    Returns hourly detection counts for the last 30 days + a per-zone breakdown.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cutoff = (datetime.date.today() - datetime.timedelta(days=30)).strftime("%Y-%m-%d")

        # ── Global hourly heatmap (all zones, last 30d) ──
        cursor.execute(
            "SELECT CAST(SUBSTR(time,1,2) AS INTEGER) AS hr, COUNT(*) "
            "FROM logs WHERE date>=? GROUP BY hr ORDER BY hr",
            (cutoff,)
        )
        global_slots = {h: 0 for h in range(24)}
        for hr, cnt in cursor.fetchall():
            if 0 <= hr <= 23:
                global_slots[hr] = cnt
        global_hourly = [
            {"hour": f"{h:02d}:00", "count": global_slots[h], "label": f"{h:02d}:00"}
            for h in range(24)
        ]

        # ── Top 3 peak hours ──
        sorted_hours = sorted(global_slots.items(), key=lambda x: x[1], reverse=True)
        peak_hours = [
            {"hour": f"{h:02d}:00", "count": c, "risk_score": min(100, int(c * 10))}
            for h, c in sorted_hours[:3] if c > 0
        ]

        # ── Per-zone peak hour breakdown ──
        cursor.execute(
            "SELECT location, CAST(SUBSTR(time,1,2) AS INTEGER) AS hr, COUNT(*) "
            "FROM logs WHERE date>=? GROUP BY location, hr",
            (cutoff,)
        )
        zone_map: dict[str, dict[int, int]] = {}
        for loc, hr, cnt in cursor.fetchall():
            if loc not in zone_map:
                zone_map[loc] = {}
            if 0 <= hr <= 23:
                zone_map[loc][hr] = cnt

        zone_peaks = []
        for zone, hrs in zone_map.items():
            if hrs:
                worst_hr = max(hrs, key=hrs.get)
                total = sum(hrs.values())
                zone_peaks.append({
                    "zone": zone,
                    "peak_hour": f"{worst_hr:02d}:00",
                    "peak_count": hrs[worst_hr],
                    "total_30d": total,
                    "risk_score": min(100, int((hrs[worst_hr] / max(total, 1)) * 100 + total * 5)),
                })
        zone_peaks.sort(key=lambda x: x["risk_score"], reverse=True)

        # ── Tonight prediction (18:00-06:00 window) ──
        cursor.execute(
            "SELECT CAST(SUBSTR(time,1,2) AS INTEGER) AS hr, COUNT(*) "
            "FROM logs WHERE date>=? AND (CAST(SUBSTR(time,1,2) AS INTEGER) >= 18 "
            "OR CAST(SUBSTR(time,1,2) AS INTEGER) <= 6) GROUP BY hr",
            (cutoff,)
        )
        night_counts = sum(cnt for _, cnt in cursor.fetchall())
        cursor.execute("SELECT COUNT(*) FROM logs WHERE date>=?", (cutoff,))
        total_30d = cursor.fetchone()[0] or 1
        night_pct = int((night_counts / total_30d) * 100)

    return {
        "hourly": global_hourly,
        "peak_hours": peak_hours,
        "zone_peaks": zone_peaks,
        "night_risk_pct": night_pct,
        "period_days": 30,
    }


# ─── System Status ───
@router.get("/status")
def get_status(auth: bool = Depends(verify_token)):
    today = datetime.date.today().strftime("%Y-%m-%d")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT location FROM logs WHERE date=?", (today,))
        zones = [row[0] for row in cursor.fetchall()]

    return {
        "status": "Active",
        "active_zones": zones if zones else ["Zone A"],
        "current_detections": [],
        "ai_performance": {
            "inference_time": _get_inference_time(),
            "model": "YOLO11-Nano",
        },
    }
