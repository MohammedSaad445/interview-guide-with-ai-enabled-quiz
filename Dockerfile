# Multi-stage Dockerfile for Interview Guide with AI-enabled Quiz
# This builds both the React frontend (via Maven) and the Spring Boot backend

# Stage 1: Build stage
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy the entire project
COPY . .

# Build the project (this will also build the frontend via frontend-maven-plugin)
# The Maven build will:
# 1. Install Node.js and npm locally
# 2. Install frontend dependencies
# 3. Build the Vite/React frontend
# 4. Bundle the frontend into the Spring Boot application
RUN mvn clean package -DskipTests -f backend/quiz/pom.xml

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

# Copy the built JAR from the builder stage
COPY --from=builder /app/backend/quiz/target/*.jar app.jar

# Expose port 8080 (Spring Boot default)
EXPOSE 8080

# Health check to verify the application is running
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/api/topics || exit 1

# Set environment variables (can be overridden at runtime)
ENV JAVA_OPTS="-Xms256m -Xmx512m" \
    GOOGLE_API_KEY=${GOOGLE_API_KEY:-} \
    LOG_LEVEL=INFO

# Run the application
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

