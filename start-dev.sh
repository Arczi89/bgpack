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

echo "🚀 BGPack - Development Setup"
echo "============================="

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
    print_status "Starting backend in Docker..."
    docker-compose up backend -d
    
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

# Start frontend locally
print_status "Starting frontend locally..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

# Save PID for cleanup
echo $FRONTEND_PID > .frontend.pid

print_success "🎉 BGPack is running!"
echo ""
echo "Backend ($BACKEND_TYPE):  http://localhost:8080"
echo "Frontend (Local):         http://localhost:3000"
echo ""
echo "To stop: ./stop-dev.sh"
if [ "$BACKEND_TYPE" = "Docker" ]; then
    echo "Or manually: docker-compose down && kill $FRONTEND_PID"
else
    echo "Or manually: ./stop-backend-local.sh && kill $FRONTEND_PID"
fi
