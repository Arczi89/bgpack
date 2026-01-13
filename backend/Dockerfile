# Multi-stage build for Spring Boot application
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy Maven configuration files
COPY .mvn ./.mvn
COPY pom.xml checkstyle.xml ./
COPY mvnw ./

# Download dependencies
RUN mvn clean dependency:resolve -U -DskipTests -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests -B -q

# Runtime stage - we use Maven image to support mvn spring-boot:run in dev
FROM maven:3.9-eclipse-temurin-21-alpine
WORKDIR /app

# Copy built JAR from builder (for production-like runs)
COPY --from=builder /app/target/bgpack-backend-0.0.1-SNAPSHOT.jar application.jar
# Copy pom.xml and src for development (needed for mvn spring-boot:run)
COPY pom.xml .
COPY src ./src

# Expose ports
EXPOSE 8080 5005

# Health check using the custom class
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD java -cp /app/application.jar:target/classes com.bgpack.health.HealthCheck || exit 1

# Default run command
CMD ["java", "-jar", "application.jar"]