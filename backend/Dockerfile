# Use existing bgpack-backend image as base to avoid Docker Hub issues
FROM bgpack-backend:latest

WORKDIR /app

# Copy the new JAR file over the old one
COPY target/bgpack-backend-0.0.1-SNAPSHOT.jar target/bgpack-backend-0.0.1-SNAPSHOT.jar

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/bgpack-backend-0.0.1-SNAPSHOT.jar"]
