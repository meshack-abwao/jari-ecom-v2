@echo off
echo ========================================
echo   JARI.ECOM V2 - API TESTS
echo ========================================
echo.
echo Make sure API is running on localhost:3001
echo.
cd /d "%~dp0"
node test-api.js
echo.
pause
