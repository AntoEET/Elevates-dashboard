@echo off
title Elevates Dashboard
color 0B
cls

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║           ELEVATES EXECUTIVE AI DASHBOARD                 ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
echo    Starting Elevates Dashboard...
echo.

cd /d "C:\Users\AnthonyMaroleau\OneDrive - The Good Eating Company Ltd\Desktop\elevates-dashboard"

echo    Checking if port 3000 is available...
netstat -ano | findstr :3000 | findstr LISTENING >nul 2>&1

if %errorlevel% equ 0 (
    echo    ⚠️  Port 3000 is already in use!
    echo.
    echo    Choose an option:
    echo    1. Stop existing process and restart
    echo    2. Run on different port (3001)
    echo    3. Open existing dashboard (if already running)
    echo    4. Cancel
    echo.
    set /p choice="Enter your choice (1-4): "

    if "!choice!"=="1" (
        echo.
        echo    Stopping process on port 3000...
        for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000 ^| findstr LISTENING') do (
            taskkill /F /PID %%a >nul 2>&1
        )
        timeout /t 2 /nobreak >nul
        goto start_dashboard
    ) else if "!choice!"=="2" (
        echo.
        echo    Starting on port 3001...
        start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3001/command-center"
        npm run dev -- -p 3001
        goto end
    ) else if "!choice!"=="3" (
        echo.
        echo    Opening existing dashboard...
        start http://localhost:3000/command-center
        timeout /t 2 /nobreak >nul
        goto end
    ) else (
        echo.
        echo    Cancelled.
        timeout /t 2 /nobreak >nul
        goto end
    )
)

:start_dashboard
echo.
echo    ════════════════════════════════════════════════════════════
echo.
echo    🚀 Dashboard URL: http://localhost:3000/command-center
echo.
echo    Opening in your browser...
echo    ════════════════════════════════════════════════════════════
echo.

:: Open browser after a short delay
start "" cmd /c "timeout /t 3 /nobreak >nul && start http://localhost:3000/command-center"

:: Start the dev server on port 3000
npm run dev -- -p 3000

:end
