@echo off

echo 🐳 BGPack - Docker Setup
echo ========================

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] docker-compose not found. Trying 'docker compose'...
    set COMPOSE_CMD=docker compose
) else (
    set COMPOSE_CMD=docker-compose
)

REM Build and start services
echo [INFO] Building and starting BGPack services...
%COMPOSE_CMD% up --build -d

REM Wait for services to be ready
echo [INFO] Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
%COMPOSE_CMD% ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo [SUCCESS] 🎉 BGPack is running!
    echo.
    echo Frontend: http://localhost:3000
    echo Backend:  http://localhost:8080
    echo.
    echo To stop: docker-compose down
    echo To view logs: docker-compose logs -f
) else (
    echo [WARNING] Some services may not have started properly. Check logs with:
    echo %COMPOSE_CMD% logs
)

pause
