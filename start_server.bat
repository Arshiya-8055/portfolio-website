@echo off
title Shaik Arshiya Begum - Portfolio Local Server
cls
echo ======================================================================
echo   Shaik Arshiya Begum - Personal Portfolio Local Development Server
echo ======================================================================
echo.
echo Launching your portfolio website in your browser...
echo.

rem Open website in default browser after 1 second delay
start "" http://localhost:5000

rem Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Node.js runtime detected.
    echo [OK] Starting Node.js Express server on http://localhost:5000 ...
    echo.
    echo Press Ctrl+C at any time to stop the server.
    echo ======================================================================
    node server/app.js
    goto end
)

rem If Node is not found, check for Python
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo [Note] Node.js not detected in PATH.
    echo [OK] Using Python companion server for instant local preview...
    echo.
    echo Press Ctrl+C at any time to stop the server.
    echo ======================================================================
    python scripts/dev_server.py
    goto end
)

rem Direct fallback to Python 3.14 installed on machine
if exist "C:\Program Files\Python314\python.exe" (
    echo [Note] Node.js not detected in PATH.
    echo [OK] Using Python 3.14 companion server on http://localhost:5000 ...
    echo.
    echo Press Ctrl+C at any time to stop the server.
    echo ======================================================================
    "C:\Program Files\Python314\python.exe" scripts/dev_server.py
    goto end
)

echo [!] Could not locate Node.js or Python.
echo Please install Node.js from https://nodejs.org or check your PATH.
pause

:end
