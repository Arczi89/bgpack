@echo off
echo BGPack - Development Setup
echo =============================

echo [INFO] Starting backend in Docker...
docker-compose up backend -d

echo [INFO] Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo [INFO] Starting frontend locally...
cd frontend
start "BGPack Frontend" cmd /k "npm start"
cd ..

echo [SUCCESS] BGPack is running!
echo.
echo Backend (Docker):  http://localhost:8080
echo Frontend (Local):  http://localhost:3000
echo.
echo To stop: ./stop-dev.bat
pause
