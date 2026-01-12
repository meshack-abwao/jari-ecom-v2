@echo off
echo ========================================
echo   JARI.ECOM V2 - RUN MIGRATIONS
echo ========================================
echo.
echo Running database migrations...
echo.
cd /d "%~dp0api"
call npm run migrate
if errorlevel 1 (
    echo.
    echo ERROR: Migration failed!
    echo Make sure DATABASE_URL is set correctly in api\.env
    pause
    exit /b 1
)
echo.
echo ========================================
echo   MIGRATIONS COMPLETE!
echo ========================================
pause
