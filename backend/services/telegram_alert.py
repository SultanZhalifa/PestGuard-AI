"""
Smart Warehouse — Telegram Alert Service
=========================================
Sends real-time notifications to Telegram when bio-hazard or pest is detected.

Setup:
1. Create a bot via @BotFather on Telegram to get BOT_TOKEN
2. Send a message to the bot, then check https://api.telegram.org/bot<TOKEN>/getUpdates
   to get your CHAT_ID
3. Fill TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in the .env file
"""

import logging
import os
import threading
import requests

TELEGRAM_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

RISK_LABEL = {
    "danger": "[BIO-HAZARD KRITIS]",
    "warning": "[KONTAMINASI]",
    "info": "[MONITORING]",
}

SOP_TEXT = {
    "danger": (
        "\n\n*TINDAKAN SEGERA (0-30 detik):*\n"
        "- Aktifkan alarm zona\n"
        "- Umumkan evakuasi via speaker\n"
        "- Hubungi pest control segera\n"
        "- JANGAN dekati hewan berbahaya"
    ),
    "warning": (
        "\n\n*TINDAKAN (0-5 menit):*\n"
        "- Karantina produk di area terdeteksi\n"
        "- Pastikan akses produk tertutup\n"
        "- Lakukan sanitasi area setelah dikeluarkan"
    ),
    "info": (
        "\n\n*TINDAKAN (hari ini):*\n"
        "- Catat lokasi dan dokumentasikan\n"
        "- Periksa celah dan ventilasi zona"
    ),
}


def send_telegram_alert(
    class_name: str,
    zone_name: str,
    confidence: float,
    risk_level: str,
    snapshot_filename: str = "",
):
    """
    Send alert notification to Telegram asynchronously (non-blocking).
    Silently skips if TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured.
    """
    if not TELEGRAM_TOKEN or not TELEGRAM_CHAT_ID:
        return

    def _send():
        level_text = RISK_LABEL.get(risk_level, risk_level.upper())
        sop = SOP_TEXT.get(risk_level, "")
        conf_pct = int(confidence * 100)

        # Confidence bar (ASCII block characters — safe for all Telegram clients)
        filled = conf_pct // 10
        bar = "#" * filled + "-" * (10 - filled)

        message = (
            f"*SMART WAREHOUSE ALERT*\n"
            f"Status: {level_text}\n"
            f"Objek Terdeteksi: `{class_name}`\n"
            f"Zona: `{zone_name}`\n"
            f"Confidence AI: `{conf_pct}%` [{bar}]\n\n"
            f"Sistem: SmartWarehouse AI\n"
            f"PT. Kawan Lama Group"
            f"{sop}"
        )

        try:
            requests.post(
                f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
                json={
                    "chat_id": TELEGRAM_CHAT_ID,
                    "text": message,
                    "parse_mode": "Markdown",
                },
                timeout=5,
            )
            logging.info("[TELEGRAM] Alert sent: %s at %s", class_name, zone_name)
        except Exception as e:
            logging.error("[TELEGRAM] Failed to send alert: %s", e)

    threading.Thread(target=_send, daemon=True).start()
