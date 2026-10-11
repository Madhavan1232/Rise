@echo off
setlocal

title Rise Platform - Dev Launcher

echo ===================================================
echo               Starting Rise Platform
echo ===================================================
echo.

:: Get directory path where this batch file is located
set "ROOT_DIR=%~dp0"

echo [1/2] Starting Backend Server (Express)...
start "Rise Backend (Express)" /D "%ROOT_DIR%server" cmd /k npm run dev

echo [2/2] Starting Frontend Client (Vite)...
start "Rise Frontend (Vite)" /D "%ROOT_DIR%client" cmd /k npm run dev

echo.
echo ===================================================
echo Both services are starting in dedicated windows!
echo   - Backend:  http://localhost:5000
echo   - Frontend: http://localhost:5173
echo ===================================================
echo.
echo (You can safely close this launcher window)
echo.
timeout /t 5
