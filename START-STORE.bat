@echo off
echo ========================================
echo   JARI.ECOM V2 - STORE
echo ========================================
echo.
echo Starting Store on http://localhost:5174
echo.
cd /d "%~dp0store"
call npm run dev
