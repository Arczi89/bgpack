@echo off
setlocal enabledelayedexpansion

echo 🧹 TOTAL AGGRESSIVE CLEAN ^& BUILD (No Run)
echo ==========================================

REM 1. Stop and remove project resources
echo [1/5] Stopping and removing all project resources...
docker-compose -f docker-compose.dev.yml down -v --rmi all --remove-orphans

REM 2. Aggressive Docker Cleanup
echo [2/5] Performing aggressive Docker system prune...
docker system prune -a --volumes -f

REM 3. Clean Target
echo [3/5] Cleaning target folders...
cd backend
call mvnw.cmd clean
if !errorlevel! neq 0 (
    echo [ERROR] Maven clean failed
    exit /b 1
)

REM 4. Build
echo [4/5] Building Backend JAR...
call mvnw.cmd package -DskipTests -U -B
if !errorlevel! neq 0 (
    echo [ERROR] Build failed
    exit /b 1
)

REM 5. Summary
echo.
if exist "target\bgpack-backend-0.0.1-SNAPSHOT.jar" (
    echo [SUCCESS] Backend built and ready in backend\target\
    echo [INFO] You can now run: docker-compose -f docker-compose.dev.yml up --build
) else (
    echo [ERROR] JAR not found.
)
cd ..