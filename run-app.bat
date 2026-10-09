@echo off
title DoubtSolver AI - Production Server
cd /d "%~dp0"
echo ===================================================
echo     DoubtSolver AI - Engineering Study Assistant
echo     Running at: http://localhost:3000
echo ===================================================
echo.
echo Opening browser...
start http://localhost:3000
echo.
echo Server is running. Press Ctrl+C to stop.
echo.
npx next start -p 3000
pause
