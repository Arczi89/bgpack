#!/bin/bash

echo "🔧 BGPack - Docker Rebuild & Cache Cleanup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}[1/5]${NC} Stopping all containers..."
docker-compose down
docker-compose -f docker-compose.dev.yml down

echo ""
echo -e "${BLUE}[2/5]${NC} Removing volumes (database data)..."
docker-compose down -v

echo ""
echo -e "${BLUE}[3/5]${NC} Cleaning Docker builder cache..."
docker builder prune -a -f

echo ""
echo -e "${BLUE}[4/5]${NC} Starting PostgreSQL..."
docker-compose -f docker-compose.yml up postgres -d
sleep 5

echo ""
echo -e "${BLUE}[5/5]${NC} Building and starting Backend..."
docker-compose -f docker-compose.dev.yml up backend --build

echo ""
echo -e "${GREEN}✅ Backend rebuild complete!${NC}"
echo ""
echo "Check Backend health:"
echo "  curl http://localhost:8080/api/test"
echo ""
echo "View logs:"
echo "  docker-compose logs -f backend"


