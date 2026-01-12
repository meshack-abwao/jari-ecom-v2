@echo off
echo ========================================
echo   JARI.ECOM V2 - INSTALL DEPENDENCIES
echo ========================================
echo.

echo [1/3] Installing API dependencies...
cd /d "%~dp0api"
call npm install
if errorlevel 1 (
    echo ERROR: API install failed!
    pause
    exit /b 1
)
echo API dependencies installed!
echo.

echo [2/3] Installing Dashboard dependencies...
cd /d "%~dp0dashboard"
call npm install
if errorlevel 1 (
    echo ERROR: Dashboard install failed!
    pause
    exit /b 1
)
echo Dashboard dependencies installed!
echo.

echo [3/3] Installing Store dependencies...
cd /d "%~dp0store"
call npm install
if errorlevel 1 (
    echo ERROR: Store install failed!
    pause
    exit /b 1
)
echo Store dependencies installed!
echo.

echo ========================================
echo   ALL DEPENDENCIES INSTALLED!
echo ========================================
echo.
echo Next: Run START-API.bat first, then START-ALL.bat
echo.
pause
