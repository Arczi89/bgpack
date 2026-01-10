t@echo off
echo BGPack - Development Setup
echo =============================
echo.

REM Check if Docker is running
echo [INFO] Checking Docker status...
docker ps > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Check if PostgreSQL is already running
echo [INFO] Checking PostgreSQL status...
docker ps | findstr bgpack-postgres > nul
if %errorlevel% equ 0 (
    echo [SUCCESS] PostgreSQL is already running
) else (
    echo [INFO] Starting PostgreSQL in Docker...
    docker-compose -f docker-compose.yml up postgres -d
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to start PostgreSQL
        pause
        exit /b 1
    )

    REM Wait for PostgreSQL to be ready
    echo [INFO] Waiting for PostgreSQL to be ready...
    timeout /t 5 /nobreak > nul

    REM Check if PostgreSQL is ready (simple check)
    for /L %%i in (1,1,30) do (
        docker exec bgpack-postgres pg_isready -U bgpack_user > nul 2>&1
        if %errorlevel% equ 0 (
            echo [SUCCESS] PostgreSQL is ready
            goto postgres_ready
        )
        timeout /t 1 /nobreak > nul
    )
    echo [WARNING] PostgreSQL might still be initializing...
)

:postgres_ready
echo.
echo [INFO] Starting backend in Docker with debugging enabled...
docker-compose -f docker-compose.dev.yml up backend -d

echo [INFO] Waiting for backend to start...
timeout /t 10 /nobreak > nul

echo [INFO] Starting frontend locally...
cd frontend
start "BGPack Frontend" cmd /k "npm start"
cd ..

echo.
echo [SUCCESS] BGPack is running!
echo.
echo Backend (Docker):  http://localhost:8080
echo Frontend (Local):  http://localhost:3000
echo PostgreSQL (Docker): localhost:5432
echo.
echo To stop: ./stop-dev.bat
pause
