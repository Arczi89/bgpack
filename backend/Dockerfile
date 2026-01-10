# Multi-stage build for Spring Boot application
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy Maven configuration files
COPY .mvn ./.mvn
COPY pom.xml checkstyle.xml ./
COPY mvnw ./

# Download dependencies (with proper resolution)
RUN mvn clean dependency:resolve -U -DskipTests -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests -B -q

# Runtime stage
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy built JAR from builder
COPY --from=builder /app/target/bgpack-backend-0.0.1-SNAPSHOT.jar application.jar

# Expose ports
EXPOSE 8080 5005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD java -cp /app/application.jar com.bgpack.health.HealthCheck || exit 1

# Run application
ENTRYPOINT ["java", "-jar", "application.jar"]
