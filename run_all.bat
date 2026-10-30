@echo off
echo ========================================================
echo Starting NetEvidence AI Full-Stack Application
echo ========================================================
start "NetEvidence AI - Backend" cmd /c "run_backend.bat"
timeout /t 3 >nul
start "NetEvidence AI - Frontend" cmd /c "run_frontend.bat"
echo Both servers launched!
echo Open your browser at: http://localhost:5173
pause
