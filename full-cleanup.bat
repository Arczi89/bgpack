@echo off
setlocal enabledelayedexpansion

echo 🔧 COMPLETE Fresh Maven and Docker Setup
echo ======================================
echo.

REM Step 1: Stop everything
echo [1/9] Stopping all Docker containers...
docker-compose -f docker-compose.dev.yml down 2>nul
docker-compose -f docker-compose.yml down 2>nul
timeout /t 2 /nobreak > nul
echo [SUCCESS] Containers stopped
echo.

REM Step 2: Remove volumes
echo [2/9] Removing Docker volumes...
docker volume prune -f --all
timeout /t 1 /nobreak > nul
echo [SUCCESS] Volumes removed
echo.

REM Step 3: Clean builder cache
echo [3/9] Cleaning Docker builder cache...
docker builder prune -a -f
timeout /t 1 /nobreak > nul
echo [SUCCESS] Builder cache cleaned
echo.

REM Step 4: Remove images
echo [4/9] Removing old Docker images...
docker image prune -a -f
timeout /t 1 /nobreak > nul
echo [SUCCESS] Images removed
echo.

REM Step 5: Clean Maven cache
echo [5/9] Cleaning local Maven cache...
if exist "%USERPROFILE%\.m2\repository\org\hibernate" rmdir /s /q "%USERPROFILE%\.m2\repository\org\hibernate" 2>nul
if exist "%USERPROFILE%\.m2\repository\jakarta" rmdir /s /q "%USERPROFILE%\.m2\repository\jakarta" 2>nul
if exist "%USERPROFILE%\.m2\repository\org\springframework" rmdir /s /q "%USERPROFILE%\.m2\repository\org\springframework" 2>nul
if exist "%USERPROFILE%\.m2\repository\com\fasterxml" rmdir /s /q "%USERPROFILE%\.m2\repository\com\fasterxml" 2>nul
echo [SUCCESS] Maven cache cleaned
echo.

REM Step 6: Start PostgreSQL
echo [6/9] Starting PostgreSQL...
docker-compose -f docker-compose.yml up postgres -d
echo [SUCCESS] PostgreSQL started
echo.

REM Step 7: Wait for PostgreSQL
echo [7/9] Waiting for PostgreSQL to be ready...
for /L %%i in (1,1,30) do (
    docker exec bgpack-postgres pg_isready -U bgpack_user > nul 2>&1
    if !errorlevel! equ 0 (
        echo [SUCCESS] PostgreSQL is ready
        goto postgres_ready
    )
    echo -n .
    timeout /t 1 /nobreak > nul
)
echo [ERROR] PostgreSQL timeout
exit /b 1

:postgres_ready
echo.

REM Step 8: Clean Maven build
echo [8/9] Cleaning Maven build...
cd backend
call mvnw.cmd clean -q
if !errorlevel! neq 0 (
    echo [ERROR] Maven clean failed
    cd ..
    exit /b 1
)
echo [SUCCESS] Maven cleaned
echo.

REM Step 9: Build with fresh dependencies
echo [9/9] Building Backend with fresh dependencies...
call mvnw.cmd clean package -DskipTests -U -B -q
if !errorlevel! neq 0 (
    echo [ERROR] Backend build failed
    cd ..
    exit /b 1
)
if exist "target\bgpack-backend-0.0.1-SNAPSHOT.jar" (
    echo [SUCCESS] Backend built successfully
) else (
    echo [ERROR] Backend JAR not found
    cd ..
    exit /b 1
)
cd ..
)
cd ..
echo.

echo [TEST] Testing Backend...
timeout /t 3 /nobreak > nul
curl -f http://localhost:8080/api/test > nul 2>&1
if !errorlevel! equ 0 (
    echo [SUCCESS] Backend is responding!
    echo.
    echo ========== SUCCESS ==========
    echo Backend is ready on: http://localhost:8080
    echo PostgreSQL is ready on: localhost:5432
    echo.
    echo Next steps:
    echo   cd frontend
    echo   npm start
) else (
    echo [WARNING] Backend is not responding yet - it may still be starting
    echo Check logs with: docker-compose logs -f backend
)
echo.
pause


