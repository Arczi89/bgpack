#!/bin/bash

echo "🧹 TOTAL AGGRESSIVE CLEAN & BUILD (No Run)"
echo "=========================================="

set -e

# 1. Stop and remove everything related to this project
echo "[1/5] Stopping and removing all project resources..."
docker-compose -f docker-compose.dev.yml down -v --rmi all --remove-orphans

# 2. Aggressive Docker Cleanup (removes everything not in use)
echo "[2/5] Performing aggressive Docker system prune..."
docker system prune -a --volumes -f

# 3. Clean Maven local artifacts (optional but ensures freshness)
echo "[3/5] Cleaning target folders..."
cd backend
./mvnw clean

# 4. Build Backend
echo "[4/5] Building Backend JAR..."
./mvnw package -DskipTests -U -B

# 5. Summary
echo ""
if [ -f target/bgpack-backend-0.0.1-SNAPSHOT.jar ]; then
    echo "✅ SUCCESS: Backend built and ready at backend/target/"
    echo "🚀 You can now run: docker-compose -f docker-compose.dev.yml up --build"
else
    echo "❌ ERROR: Build failed, JAR not found."
    exit 1
fi