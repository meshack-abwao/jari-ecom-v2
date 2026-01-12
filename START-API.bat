@echo off
echo ========================================
echo   JARI.ECOM V2 - API SERVER
echo ========================================
echo.
echo Starting API on http://localhost:3001
echo.
cd /d "%~dp0api"
call npm run dev
