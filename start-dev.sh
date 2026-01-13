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

echo "BGPack - Development Setup"
echo "============================="

# Function to check if port is in use
check_port() {
    local port=$1
    if curl -f http://localhost:$port > /dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Check if Docker PostgreSQL is running
print_status "Checking PostgreSQL status..."
if docker ps | grep -q bgpack-postgres; then
    print_success "PostgreSQL is already running"
else
    print_status "Starting PostgreSQL in Docker..."
    docker-compose -f docker-compose.yml up postgres -d
    if [ $? -ne 0 ]; then
        print_error "Failed to start PostgreSQL"
        exit 1
    fi

    # Wait for PostgreSQL to be ready
    print_status "Waiting for PostgreSQL to be ready..."
    sleep 5

    # Check if PostgreSQL is ready
    for i in {1..30}; do
        if docker exec bgpack-postgres pg_isready -U bgpack_user > /dev/null 2>&1; then
            print_success "PostgreSQL is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            print_warning "PostgreSQL might still be initializing..."
        fi
        sleep 1
    done
fi

# Check if ports are already in use
if check_port 8080; then
    print_warning "Port 8080 is already in use - backend might already be running"
fi

if check_port 3000; then
    print_warning "Port 3000 is already in use - frontend might already be running"
fi

# Check if user wants to run backend locally
if [ "$1" = "--local" ] || [ "$1" = "-l" ]; then
    print_status "Starting backend locally..."
    ./start-backend-local.sh
    if [ $? -ne 0 ]; then
        print_error "Failed to start backend locally"
        exit 1
    fi
    BACKEND_TYPE="Local"
else
    # Start backend in Docker
    print_status "Building backend with latest changes..."
    cd backend
    export JAVA_HOME=../tools/jdk-21
    ./mvnw clean package -DskipTests
    if [ $? -ne 0 ]; then
        print_error "Failed to build backend"
        exit 1
    fi
    cd ..
    
    print_status "Starting backend in Docker with debugging enabled..."
    docker-compose -f docker-compose.dev.yml up --build backend -d
    
    # Wait for backend to be ready
    print_status "Waiting for backend to start..."
    sleep 10
    
    # Check if backend is running
    if curl -f http://localhost:8080/api/test > /dev/null 2>&1; then
        print_success "Backend is running on http://localhost:8080"
    else
        print_warning "Backend might still be starting..."
    fi
    BACKEND_TYPE="Docker"
fi

# Check if frontend is already running on port 3000
if check_port 3000; then
    print_warning "Frontend is already running on http://localhost:3000"
    print_status "Skipping frontend startup..."
    FRONTEND_PID=""
else
    # Start frontend locally
    print_status "Starting frontend locally..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..

    # Save PID for cleanup
    echo $FRONTEND_PID > .frontend.pid
    print_success "Frontend started with PID: $FRONTEND_PID"
fi

print_success "BGPack is running!"
echo ""
echo "Backend ($BACKEND_TYPE):  http://localhost:8080"
echo "Frontend (Local):         http://localhost:3000"
echo "PostgreSQL (Docker):      localhost:5432"
echo ""
echo "To stop: ./stop-dev.sh"
if [ "$BACKEND_TYPE" = "Docker" ]; then
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Or manually: docker-compose -f docker-compose.dev.yml down && kill $FRONTEND_PID"
    else
        echo "Or manually: docker-compose -f docker-compose.dev.yml down"
        echo "Note: Frontend was already running, stop it manually if needed"
    fi
else
    if [ ! -z "$FRONTEND_PID" ]; then
        echo "Or manually: ./stop-backend-local.sh && kill $FRONTEND_PID"
    else
        echo "Or manually: ./stop-backend-local.sh"
        echo "Note: Frontend was already running, stop it manually if needed"
    fi
fi
