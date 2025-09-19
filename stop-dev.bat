@echo off
echo 🛑 Stopping BGPack Development Environment
echo ==========================================

echo [INFO] Stopping backend container...
docker-compose down

echo [INFO] Stopping frontend processes...
taskkill /f /im node.exe 2>nul

echo [SUCCESS] All services stopped
pause

