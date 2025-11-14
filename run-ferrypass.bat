@echo off
REM Script para iniciar FerryPass Backend e Frontend
REM Usar: run-ferrypass.bat

echo.
echo 🚢 ========================================
echo 🚢 Iniciando FerryPass...
echo 🚢 ========================================
echo.

REM Definir porta
set PORT=8080

REM Terminal 1: Backend
start "FerryPass Backend" cmd /k "set PORT=8080 && cd /d C:\Users\Gaby\Desktop\sistema\backend && node src/server.js"

REM Aguardar um pouco
timeout /t 3 /nobreak

REM Terminal 2: Frontend
start "FerryPass Frontend" cmd /k "cd /d C:\Users\Gaby\Desktop\sistema\frontend && npm run dev"

REM Terminal 3: Info
start "FerryPass Info" cmd /k "echo. && echo ✅ Backend: http://localhost:8080 && echo ✅ Frontend: http://localhost:5173 && echo. && pause"

echo.
echo ✅ Servidores iniciados!
echo    - Backend: http://localhost:8080
echo    - Frontend: http://localhost:5173
echo.
