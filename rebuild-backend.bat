@echo off
REM BGPack - Docker Rebuild & Cache Cleanup (Windows)

echo 🔧 BGPack - Docker Rebuild and Cache Cleanup
echo ==========================================
echo.

echo [1/5] Stopping all containers...
docker-compose down
docker-compose -f docker-compose.dev.yml down

echo.
echo [2/5] Removing volumes (database data)...
docker-compose down -v

echo.
echo [3/5] Cleaning Docker builder cache...
docker builder prune -a -f

echo.
echo [4/5] Starting PostgreSQL...
docker-compose -f docker-compose.yml up postgres -d
timeout /t 5 /nobreak > nul

echo.
echo [5/5] Building and starting Backend...
docker-compose -f docker-compose.dev.yml up backend --build

echo.
echo [SUCCESS] Backend rebuild complete!
echo.
echo Check Backend health:
echo   curl http://localhost:8080/api/test
echo.
echo View logs:
echo   docker-compose logs -f backend
echo.
pause


