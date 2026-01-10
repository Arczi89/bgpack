#!/bin/bash

echo "🔧 COMPLETE Fresh Maven & Docker Setup"
echo "======================================"
echo ""

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_step() {
    echo -e "${BLUE}[$1]${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Step 1: Stop everything
print_step "1/9" "Stopping all Docker containers..."
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true
docker-compose -f docker-compose.yml down 2>/dev/null || true
sleep 2
print_success "Containers stopped"

# Step 2: Remove all volumes
print_step "2/9" "Removing all Docker volumes..."
docker volume prune -f --all
docker-compose down -v 2>/dev/null || true
sleep 1
print_success "Volumes removed"

# Step 3: Clean builder cache
print_step "3/9" "Cleaning Docker builder cache..."
docker builder prune -a -f
sleep 1
print_success "Builder cache cleaned"

# Step 4: Remove all images
print_step "4/9" "Removing old Docker images..."
docker image prune -a -f
sleep 1
print_success "Images removed"

# Step 5: Clean local Maven cache
print_step "5/9" "Cleaning local Maven cache..."
rm -rf ~/.m2/repository/org/hibernate/ 2>/dev/null || true
rm -rf ~/.m2/repository/jakarta/ 2>/dev/null || true
rm -rf ~/.m2/repository/org/springframework/ 2>/dev/null || true
rm -rf ~/.m2/repository/com/fasterxml/ 2>/dev/null || true
print_success "Maven cache cleaned"

# Step 6: Start PostgreSQL
print_step "6/9" "Starting PostgreSQL..."
docker-compose -f docker-compose.yml up postgres -d
print_success "PostgreSQL started"

# Step 7: Wait for PostgreSQL
print_step "7/9" "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if docker exec bgpack-postgres pg_isready -U bgpack_user >/dev/null 2>&1; then
        print_success "PostgreSQL is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "PostgreSQL timeout"
        exit 1
    fi
    echo -n "."
    sleep 1
done
echo ""

# Step 8: Clean build with mvnw
print_step "8/9" "Cleaning Maven build..."
cd backend
./mvnw clean -q
if [ $? -ne 0 ]; then
    print_error "Maven clean failed"
    exit 1
fi
print_success "Maven cleaned"

# Step 9: Build with fresh dependencies using mvnw
print_step "9/9" "Building Backend with fresh dependencies..."
./mvnw clean package -DskipTests -U -B -q

if [ -f target/bgpack-backend-0.0.1-SNAPSHOT.jar ]; then
    print_success "Backend built successfully"
else
    print_error "Backend build failed"
    exit 1
fi

cd ..

# Test
print_step "TEST" "Testing Backend..."
sleep 3
if curl -f http://localhost:8080/api/test >/dev/null 2>&1; then
    print_success "Backend is responding!"
    echo ""
    echo -e "${GREEN}========== SUCCESS ==========${NC}"
    echo "Backend is ready on: http://localhost:8080"
    echo "PostgreSQL is ready on: localhost:5432"
    echo ""
    echo "Next steps:"
    echo "  cd frontend && npm start"
    echo ""
else
    print_error "Backend is not responding yet - it may still be starting"
    echo "Check logs with: docker-compose logs -f backend"
fi



