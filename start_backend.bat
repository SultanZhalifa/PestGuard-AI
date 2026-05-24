@echo off
cd /d "c:\Tugas + Hackathon\smartwarehouse-ai\backend"
"c:\Tugas + Hackathon\smartwarehouse-ai\backend\venv\Scripts\python.exe" -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload > "%TEMP%\sw_backend.log" 2>&1
