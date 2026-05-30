"""
Smart Warehouse — AI Chat Route (Powered by Google Gemini)
===========================================================
LLM-powered chatbot menggunakan Google Gemini 2.0 Flash yang dapat menjawab
pertanyaan natural language tentang data deteksi gudang secara cerdas.

Context-aware: inject data real-time dari database (statistik, zona, peak hours,
deteksi terakhir) ke dalam setiap prompt Gemini — ini adalah pola RAG sederhana.

Fallback: jika GEMINI_API_KEY tidak dikonfigurasi, gunakan rule-based NLP.
"""

import datetime
import logging
import os
import re

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from config import verify_token
from database import get_db

router = APIRouter(prefix="/api", tags=["AI Chat"])

# ── Lazy-load Gemini (hanya init sekali, hanya jika API key ada) ─────────────
_gemini_model = None
_gemini_initialized = False


def _get_gemini():
    """Lazy-initialize Gemini model. Returns None jika API key tidak ada."""
    global _gemini_model, _gemini_initialized
    if _gemini_initialized:
        return _gemini_model

    _gemini_initialized = True
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        logging.warning("[GEMINI] No GEMINI_API_KEY set — using rule-based fallback.")
        return None

    try:
        import google.generativeai as genai  # type: ignore
        genai.configure(api_key=api_key)
        _gemini_model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=(
                "Kamu adalah AI Security Assistant untuk sistem PestGuard AI PT. Kawan Lama Group. "
                "Spesialisasimu adalah analisis keamanan gudang berbasis Computer Vision dan AI.\n\n"

                "Konteks sistem:\n"
                "- Sistem mendeteksi: Snake (Bio-Hazard/DANGER), Cat (Kontaminasi/WARNING), "
                "  Gecko/Lizard (Monitoring/INFO)\n"
                "- Menggunakan YOLO11 custom-trained model dengan CLAHE preprocessing\n"
                "- Multi-zone camera monitoring dengan real-time WebSocket alerts\n\n"

                "Panduan menjawab:\n"
                "1. Selalu gunakan Bahasa Indonesia yang profesional namun mudah dipahami staf gudang\n"
                "2. Format jawaban dengan markdown: **bold**, bullet points (•)\n"
                "3. Selalu berikan rekomendasi aksi konkret berdasarkan data yang diberikan\n"
                "4. Jika ada deteksi ular/bio-hazard, TEKANKAN urgensi dan protokol keselamatan K3\n"
                "5. Jangan membuat data — hanya gunakan data yang diberikan dalam context\n"
                "6. Untuk pertanyaan di luar topik gudang/keamanan, arahkan kembali ke topik relevan\n"
                "7. Selalu akhiri dengan rekomendasi tindak lanjut yang spesifik"
            )
        )
        logging.info("[GEMINI] Model initialized: gemini-2.0-flash")
        return _gemini_model
    except Exception as e:
        logging.error("[GEMINI] Failed to initialize: %s", e)
        _gemini_model = None
        return None


# ── Database Context Builder ─────────────────────────────────────────────────

def _build_warehouse_context(cursor) -> str:
    """
    Bangun snapshot data warehouse real-time untuk di-inject ke prompt Gemini.
    Ini adalah implementasi RAG (Retrieval-Augmented Generation) sederhana.
    """
    today = datetime.date.today().strftime("%Y-%m-%d")
    now_str = datetime.datetime.now().strftime("%d/%m/%Y %H:%M WIB")

    # Total risk distribution
    cursor.execute("SELECT COUNT(*), risk FROM logs GROUP BY risk")
    risk_rows = cursor.fetchall()
    total = sum(r[0] for r in risk_rows)
    danger = next((r[0] for r in risk_rows if r[1] == "danger"), 0)
    warning = next((r[0] for r in risk_rows if r[1] == "warning"), 0)
    info_cnt = next((r[0] for r in risk_rows if r[1] == "info"), 0)

    # Per-type count
    cursor.execute("SELECT type, COUNT(*) FROM logs GROUP BY type ORDER BY COUNT(*) DESC")
    type_rows = cursor.fetchall()
    type_str = "\n".join(f"  - {t}: {c} deteksi" for t, c in type_rows) if type_rows else "  - Belum ada data"

    # Today stats
    cursor.execute("SELECT COUNT(*) FROM logs WHERE date=?", (today,))
    today_total = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM logs WHERE date=? AND risk='danger'", (today,))
    today_danger = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM logs WHERE date=? AND risk='warning'", (today,))
    today_warning = cursor.fetchone()[0]

    # Last 5 detections
    cursor.execute(
        "SELECT type, location, risk, date, time, confidence FROM logs ORDER BY id DESC LIMIT 5"
    )
    recent = cursor.fetchall()
    recent_str = "\n".join(
        f"  [{i+1}] {r[0]} di {r[1]} (risk={r[2]}, conf={r[5]}, {r[3]} {r[4]})"
        for i, r in enumerate(recent)
    ) if recent else "  - Belum ada deteksi"

    # Zone statistics
    cursor.execute(
        "SELECT location, COUNT(*) as total, "
        "SUM(CASE WHEN risk='danger' THEN 1 ELSE 0 END) as danger_count "
        "FROM logs GROUP BY location ORDER BY COUNT(*) DESC"
    )
    zone_rows = cursor.fetchall()
    zone_str = "\n".join(
        f"  - {z[0]}: {z[1]} total ({z[2] or 0} bahaya, {int((z[2] or 0)/z[1]*100) if z[1] else 0}% risk)"
        for z in zone_rows
    ) if zone_rows else "  - Belum ada data zona"

    # Peak hours (last 30 days)
    cutoff = (datetime.date.today() - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
    cursor.execute(
        "SELECT SUBSTR(time,1,2) as hr, COUNT(*) FROM logs WHERE date>=? GROUP BY hr ORDER BY COUNT(*) DESC LIMIT 5",
        (cutoff,)
    )
    peaks = cursor.fetchall()
    peak_str = ", ".join(f"{p[0]}:00 ({p[1]} deteksi)" for p in peaks) if peaks else "Belum cukup data"

    # Night risk (18:00 - 06:00)
    cursor.execute(
        "SELECT COUNT(*) FROM logs WHERE date>=? AND "
        "(CAST(SUBSTR(time,1,2) AS INTEGER) >= 18 OR CAST(SUBSTR(time,1,2) AS INTEGER) <= 6)",
        (cutoff,)
    )
    night_count = cursor.fetchone()[0]
    night_pct = int(night_count / max(total, 1) * 100)

    # Overall risk assessment
    if today_danger > 0:
        risk_status = "WASPADA TINGGI — Ada insiden Bio-Hazard aktif hari ini!"
    elif danger > 0:
        risk_status = "WASPADA SEDANG — Ada riwayat insiden Bio-Hazard. Pantau terus."
    elif total == 0:
        risk_status = "TIDAK ADA DATA — Belum ada deteksi tercatat. Pastikan kamera aktif."
    else:
        risk_status = "KONDISI AMAN — Tidak ada ancaman Bio-Hazard aktif."

    return f"""
╔══════════════════════════════════════════════════════════════╗
║     DATA REAL-TIME SMART WAREHOUSE — PT. KAWAN LAMA GROUP   ║
╚══════════════════════════════════════════════════════════════╝
Timestamp: {now_str}
Status Sistem: AI Detection AKTIF | YOLO11 Custom Model

━━━ RINGKASAN EKSEKUTIF ━━━
Status Keamanan: {risk_status}

━━━ STATISTIK KESELURUHAN ━━━
Total deteksi (all time): {total}
• Bio-Hazard (Ular/Snake): {danger} kejadian [KRITIS]
• Kontaminasi (Kucing/Cat): {warning} kejadian [SEDANG]
• Monitoring (Gecko/Kadal): {info_cnt} kejadian [RENDAH]

Per jenis objek:
{type_str}

━━━ AKTIVITAS HARI INI ({today}) ━━━
Total: {today_total} deteksi
• Bahaya (Snake): {today_danger}
• Kontaminasi (Cat): {today_warning}
• Monitoring: {today_total - today_danger - today_warning}

━━━ 5 DETEKSI TERAKHIR ━━━
{recent_str}

━━━ ANALISIS PER ZONA ━━━
{zone_str}

━━━ ANALISIS WAKTU (30 hari terakhir) ━━━
Jam puncak risiko: {peak_str}
Deteksi malam hari (18:00-06:00): {night_count} ({night_pct}% dari total)

━━━ PROTOKOL SOP ━━━
Snake/Ular → BAHAYA: Evakuasi zona, hubungi pest control, isolasi area
Cat/Kucing → SEDANG: Karantina produk, sanitasi, periksa akses masuk
Gecko/Kadal → RENDAH: Dokumentasi, periksa celah ventilasi

Kontak Darurat: Pest Control 24H | K3 Manager | Security Supervisor
══════════════════════════════════════════════════════════════
"""


# ── Rule-based Fallback (jika Gemini tidak tersedia) ─────────────────────────

def _classify_intent(msg: str) -> str:
    m = msg.lower()
    if re.search(r"zona?.*(baha|risiko|aman|aktif|paling|mana|tertinggi)", m): return "zone_risk"
    if re.search(r"zone?.*(danger|risk|safe|most|which|highest)", m): return "zone_risk"
    if re.search(r"(jam|waktu|kapan|pukul|peak|hour|sering|terjadi|pattern|pola)", m): return "peak_hours"
    if re.search(r"(terakhir|last|terbaru|latest|baru saja|recent)", m): return "last_detection"
    if re.search(r"(ular|snake)", m): return "count_snake"
    if re.search(r"(kucing|cat)", m): return "count_cat"
    if re.search(r"(gecko|cicak|lizard|kadal)", m): return "count_gecko"
    if re.search(r"(total|berapa|jumlah|count|how many|statistik|stat)", m): return "total_stats"
    if re.search(r"(ringkasan|summary|laporan|report|rekap|singkat)", m): return "summary"
    if re.search(r"(aman|safe|status|kondisi|situation)", m): return "safety_status"
    if re.search(r"(help|bantuan|bisa apa|apa saja|fitur)", m): return "help"
    return "unknown"


def _fallback_response(message: str, cursor) -> str:
    intent = _classify_intent(message)
    today = datetime.date.today().strftime("%Y-%m-%d")

    if intent == "help":
        return (
            "**AI Warehouse Assistant** siap membantu!\n\n"
            "Tanyakan tentang:\n"
            "• \"Zona mana yang paling berbahaya?\"\n"
            "• \"Berapa total deteksi ular?\"\n"
            "• \"Kapan terakhir ada insiden?\"\n"
            "• \"Jam berapa paling sering ada deteksi?\"\n"
            "• \"Buatkan ringkasan laporan keamanan\"\n\n"
            "_Tip: Konfigurasikan GEMINI_API_KEY untuk AI response yang lebih cerdas._"
        )

    if intent == "total_stats":
        cursor.execute("SELECT COUNT(*), risk FROM logs GROUP BY risk")
        rows = cursor.fetchall()
        total = sum(r[0] for r in rows)
        danger = next((r[0] for r in rows if r[1] == "danger"), 0)
        warning = next((r[0] for r in rows if r[1] == "warning"), 0)
        info_cnt = next((r[0] for r in rows if r[1] == "info"), 0)
        cursor.execute("SELECT COUNT(*) FROM logs WHERE date=?", (today,))
        today_total = cursor.fetchone()[0]
        return (
            f"**Statistik Deteksi Keseluruhan**\n\n"
            f"• Total seluruh waktu: **{total} deteksi**\n"
            f"• Hari ini: **{today_total} deteksi**\n\n"
            f"**Breakdown per kategori:**\n"
            f"• [BAHAYA] Bio-Hazard (Ular): {danger} kejadian\n"
            f"• [SEDANG] Kontaminasi (Kucing): {warning} kejadian\n"
            f"• [AMAN] Monitoring (Gecko/Lizard): {info_cnt} kejadian"
        )

    if intent == "zone_risk":
        cursor.execute(
            "SELECT location, COUNT(*), SUM(CASE WHEN risk='danger' THEN 1 ELSE 0 END) "
            "FROM logs GROUP BY location ORDER BY COUNT(*) DESC"
        )
        zones = [{"zone": r[0], "total": r[1], "danger": r[2] or 0} for r in cursor.fetchall()]
        if not zones:
            return "Belum ada data deteksi. Aktifkan kamera untuk mulai monitoring."
        lines = ["**Analisis Risiko Per Zona**\n"]
        for z in zones:
            pct = int((z["danger"] / z["total"]) * 100) if z["total"] > 0 else 0
            tag = "[BAHAYA]" if z["danger"] > 0 else "[AMAN]"
            lines.append(f"• **{z['zone']}**: {z['total']} deteksi ({pct}% bahaya) {tag}")
        lines.append(f"\n**Zona paling berbahaya: {zones[0]['zone']}**")
        return "\n".join(lines)

    if intent == "last_detection":
        cursor.execute(
            "SELECT type, location, risk, date, time, confidence FROM logs ORDER BY id DESC LIMIT 1"
        )
        row = cursor.fetchone()
        if not row:
            return "Belum ada deteksi tercatat. Gudang masih bersih."
        action = "Segera lakukan evakuasi!" if row[2] == "danger" else "Lakukan pemeriksaan rutin."
        return (
            f"**Deteksi Terakhir:**\n\n"
            f"• Objek: **{row[0]}**\n"
            f"• Lokasi: **{row[1]}**\n"
            f"• Risk: {row[2].upper()}\n"
            f"• Waktu: {row[3]} pukul {row[4]}\n"
            f"• Confidence AI: **{row[5]}**\n\n"
            f"{action}"
        )

    if intent == "count_snake":
        cursor.execute("SELECT COUNT(*) FROM logs WHERE LOWER(type)='snake'")
        count = cursor.fetchone()[0]
        return (
            f"**Deteksi Bio-Hazard — Ular**\n\n"
            f"• Total: **{count} kejadian**\n"
            f"• Status: {'[KRITIS] Segera tingkatkan patroli!' if count > 0 else '[AMAN] Tidak ada deteksi ular.'}"
        )

    if intent == "count_cat":
        cursor.execute("SELECT COUNT(*) FROM logs WHERE LOWER(type)='cat'")
        count = cursor.fetchone()[0]
        return f"**Deteksi Kontaminasi — Kucing**\n\n• Total: **{count} kejadian**"

    if intent == "peak_hours":
        cursor.execute(
            "SELECT SUBSTR(time,1,2) as hr, COUNT(*) FROM logs GROUP BY hr ORDER BY COUNT(*) DESC LIMIT 3"
        )
        peaks = cursor.fetchall()
        if not peaks:
            return "Belum cukup data untuk analisis pola waktu."
        lines = ["**Jam Puncak Risiko**\n"]
        for i, p in enumerate(peaks):
            lines.append(f"#{i+1} **{p[0]}:00** — {p[1]} deteksi")
        lines.append("\n**Rekomendasi:** Tingkatkan patroli pada jam tersebut.")
        return "\n".join(lines)

    if intent == "safety_status":
        cursor.execute("SELECT COUNT(*) FROM logs WHERE date=? AND risk='danger'", (today,))
        today_danger = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM logs WHERE risk='danger'")
        total_danger = cursor.fetchone()[0]
        if today_danger > 0:
            return f"**Status: [WASPADA TINGGI]**\n\nAda {today_danger} insiden Bio-Hazard hari ini. Koordinasikan penanganan segera!"
        elif total_danger > 0:
            return "**Status: [WASPADA SEDANG]**\n\nAda riwayat Bio-Hazard. Lanjutkan monitoring intensif."
        return "**Status: [AMAN]**\n\nTidak ada ancaman aktif. Pertahankan monitoring rutin."

    if intent == "summary":
        cursor.execute("SELECT COUNT(*), risk FROM logs GROUP BY risk")
        rows = cursor.fetchall()
        total = sum(r[0] for r in rows)
        danger = next((r[0] for r in rows if r[1] == "danger"), 0)
        cursor.execute("SELECT location, COUNT(*) FROM logs GROUP BY location ORDER BY COUNT(*) DESC LIMIT 1")
        top_zone = cursor.fetchone()
        cursor.execute("SELECT type, location, time FROM logs ORDER BY id DESC LIMIT 1")
        last = cursor.fetchone()
        return (
            f"**Ringkasan Keamanan Gudang**\n"
            f"_Generated: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M')}_\n\n"
            f"• Total deteksi: {total}\n"
            f"• Bio-Hazard: {danger} kejadian\n"
            f"• Zona paling aktif: {top_zone[0] if top_zone else 'N/A'}\n"
            f"• Deteksi terakhir: {f'{last[0]} di {last[1]} ({last[2]})' if last else 'N/A'}\n\n"
            f"{'[KRITIS] Tindakan segera diperlukan!' if danger > 0 else '[AMAN] Kondisi dalam batas normal.'}"
        )

    return (
        "Maaf, saya belum memahami pertanyaan tersebut.\n\n"
        "Coba tanyakan:\n"
        "• \"Zona mana paling berbahaya?\"\n"
        "• \"Berapa total deteksi?\"\n"
        "• \"Kapan terakhir ada insiden?\"\n"
        "• \"Buatkan ringkasan laporan\"\n\n"
        "Atau ketik **\"bantuan\"** untuk melihat semua pertanyaan yang bisa dijawab."
    )


# ── Main Endpoint ─────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
async def chat(req: ChatRequest, session=Depends(verify_token)):
    """
    AI Chat — powered by Google Gemini 2.0 Flash dengan RAG pattern.
    Inject real-time warehouse data sebagai context ke setiap prompt.
    Mendukung Bahasa Indonesia dan English.
    """
    message = req.message.strip()
    gemini = _get_gemini()

    with get_db() as conn:
        cursor = conn.cursor()
        context = _build_warehouse_context(cursor)

        if gemini is None:
            # Graceful fallback ke rule-based NLP
            answer = _fallback_response(message, cursor)
            responder = "PestGuard AI v2.0 (Rule-based — set GEMINI_API_KEY for Gemini)"
            powered_by = "rule-based"
        else:
            try:
                prompt = (
                    f"Berikut adalah data real-time dari sistem PestGuard AI:\n\n"
                    f"{context}\n\n"
                    f"Pertanyaan dari operator gudang: {message}"
                )
                response = gemini.generate_content(prompt)
                answer = response.text
                responder = "PestGuard AI v3.0 — Powered by Google Gemini 2.0 Flash"
                powered_by = "gemini-2.0-flash"
            except Exception as e:
                logging.error("[GEMINI] Generation error: %s", e)
                answer = _fallback_response(message, cursor)
                responder = "PestGuard AI v2.0 (Gemini error — fallback)"
                powered_by = "rule-based-fallback"

    return {
        "question": message,
        "answer": answer,
        "responder": responder,
        "powered_by": powered_by,
        "timestamp": datetime.datetime.now().isoformat(),
        "context_injected": True,
    }
