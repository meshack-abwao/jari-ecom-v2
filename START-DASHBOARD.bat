@echo off
echo ========================================
echo   JARI.ECOM V2 - DASHBOARD
echo ========================================
echo.
echo Starting Dashboard on http://localhost:5173
echo.
cd /d "%~dp0dashboard"
call npm run dev
