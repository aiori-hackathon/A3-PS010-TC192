@echo off
echo ========================================================
echo Starting NetEvidence AI Backend (FastAPI + Uvicorn)
echo ========================================================
set PYTHONPATH=%CD%\backend
.\venv\Scripts\python backend\app\database\init_db.py
.\venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload --app-dir backend
pause
