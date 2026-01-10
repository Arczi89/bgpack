@echo off
REM Start PostgreSQL and pgAdmin for development

echo Starting BGPack development environment with Docker Compose...
echo Building and starting services...

docker-compose -f docker-compose.yml up -d

echo.
echo ================================
echo Database services started!
echo ================================
echo.
echo Services running:
echo   PostgreSQL: localhost:5432
echo     Username: bgpack_user
echo     Password: bgpack_pass
echo     Database: bgpack
echo.
echo   pgAdmin: http://localhost:8080
echo     Email: admin@bgpack.com
echo     Password: admin123
echo.
echo Database migrations will run automatically on first startup.
echo Wait a moment for PostgreSQL to be ready...
echo.
echo To check the status:
echo   docker-compose logs -f
echo.
echo To stop services:
echo   docker-compose down
echo.
pause

