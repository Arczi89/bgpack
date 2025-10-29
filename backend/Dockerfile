# Development/Production Dockerfile for Spring Boot application
FROM maven:3.9-eclipse-temurin-21

WORKDIR /app

# Copy pom.xml and checkstyle.xml first for dependency caching
COPY pom.xml checkstyle.xml ./

# Download dependencies (cache layer)
RUN mvn dependency:go-offline -B || true

# Copy source code
COPY src ./src

# Build the application (for production)
RUN mvn clean package -DskipTests

# Expose ports
EXPOSE 8080 5005

# Default command (can be overridden in docker-compose)
CMD ["java", "-jar", "target/bgpack-backend-0.0.1-SNAPSHOT.jar"]
