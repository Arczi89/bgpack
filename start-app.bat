@echo off

echo 🚀 BGPack - Local Development Setup
echo ==================================

REM Check if Java is available
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Java not found. Setting up local JDK...
    
    REM Create tools directory
    if not exist "tools" mkdir tools
    
    REM Download JDK if not exists
    if not exist "tools\jdk-17.0.2" (
        echo [INFO] Downloading OpenJDK 17...
        cd tools
        
        powershell -Command "Invoke-WebRequest -Uri 'https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip' -OutFile 'openjdk-17_windows-x64_bin.zip'"
        powershell -Command "Expand-Archive -Path 'openjdk-17_windows-x64_bin.zip' -DestinationPath '.' -Force"
        del openjdk-17_windows-x64_bin.zip
        
        cd ..
        echo [SUCCESS] JDK 17 downloaded and extracted
    ) else (
        echo [SUCCESS] JDK 17 already available
    )
    
    REM Set JAVA_HOME
    set JAVA_HOME=%~dp0tools\jdk-17.0.2
    set PATH=%JAVA_HOME%\bin;%PATH%
    echo [SUCCESS] JAVA_HOME set to: %JAVA_HOME%
) else (
    echo [SUCCESS] Java found
)

REM Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
    echo [SUCCESS] Frontend dependencies installed
) else (
    echo [SUCCESS] Frontend dependencies already installed
)

REM Start backend in background
echo [INFO] Starting backend server...
cd backend
set JAVA_HOME=%~dp0..\tools\jdk-17.0.2
set PATH=%JAVA_HOME%\bin;%PATH%
start /B mvnw.cmd spring-boot:run
cd ..
echo [SUCCESS] Backend started

REM Wait for backend to start
echo [INFO] Waiting for backend to start...
timeout /t 10 /nobreak >nul

REM Start frontend
echo [INFO] Starting frontend server...
cd frontend
start /B npm start
cd ..
echo [SUCCESS] Frontend started

echo [SUCCESS] 🎉 BGPack is running!
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8080
echo.
echo Press any key to stop...
pause >nul

REM Stop processes
taskkill /F /IM java.exe 2>nul
taskkill /F /IM node.exe 2>nul
echo [SUCCESS] All services stopped
