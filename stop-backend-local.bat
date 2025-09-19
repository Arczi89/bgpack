@echo off
setlocal

echo 🛑 Stopping BGPack Local Backend
echo =================================

REM Stop backend process
echo [INFO] Stopping local backend...
if exist .backend.pid (
    set /p BACKEND_PID=<.backend.pid
    taskkill /f /pid %BACKEND_PID% >nul 2>&1
    if not errorlevel 1 (
        echo [SUCCESS] Backend process %BACKEND_PID% stopped
    ) else (
        echo [WARNING] Backend process %BACKEND_PID% was not running
    )
    del .backend.pid
) else (
    echo [WARNING] No backend PID file found
)

REM Kill any remaining Java processes
echo [INFO] Killing any remaining Spring Boot processes...
taskkill /f /im java.exe >nul 2>&1

echo [SUCCESS] Local backend stopped

