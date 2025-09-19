#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🚀 BGPack - Local Development Setup"
echo "=================================="

# Check if Java is available
if ! command -v java &> /dev/null; then
    print_warning "Java not found. Setting up local JDK..."
    
    # Create tools directory
    mkdir -p tools
    
    # Download JDK if not exists
    if [ ! -d "tools/jdk-17.0.2" ]; then
        print_status "Downloading OpenJDK 17..."
        cd tools
        
        if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
            # Windows
            curl -k -L -o openjdk-17_windows-x64_bin.zip "https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_windows-x64_bin.zip"
            unzip -q openjdk-17_windows-x64_bin.zip
            rm openjdk-17_windows-x64_bin.zip
        else
            # Linux/Mac
            curl -L -o openjdk-17_linux-x64_bin.tar.gz "https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_linux-x64_bin.tar.gz"
            tar -xzf openjdk-17_linux-x64_bin.tar.gz
            rm openjdk-17_linux-x64_bin.tar.gz
        fi
        
        cd ..
        print_success "JDK 17 downloaded and extracted"
    else
        print_success "JDK 17 already available"
    fi
    
    # Set JAVA_HOME
    export JAVA_HOME="$(pwd)/tools/jdk-17.0.2"
    export PATH="$JAVA_HOME/bin:$PATH"
    print_success "JAVA_HOME set to: $JAVA_HOME"
else
    print_success "Java found: $(java -version 2>&1 | head -n 1)"
fi

# Check if frontend dependencies are installed
if [ ! -d "frontend/node_modules" ]; then
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    print_success "Frontend dependencies installed"
else
    print_success "Frontend dependencies already installed"
fi

# Start backend in background
print_status "Starting backend server..."
cd backend
export JAVA_HOME="$(pwd)/../tools/jdk-17.0.2"
export PATH="$JAVA_HOME/bin:$PATH"
./mvnw spring-boot:run &
BACKEND_PID=$!
cd ..
echo $BACKEND_PID > .backend.pid
print_success "Backend started (PID: $BACKEND_PID)"

# Wait for backend to start
print_status "Waiting for backend to start..."
sleep 10

# Start frontend
print_status "Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..
echo $FRONTEND_PID > .frontend.pid
print_success "Frontend started (PID: $FRONTEND_PID)"

print_success "🎉 BGPack is running!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8080"
echo ""
echo "To stop: ./stop-app.sh"
echo "Or manually: kill $BACKEND_PID $FRONTEND_PID"
