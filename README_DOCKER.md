# Docker Setup Guide - Interview Guide with AI-enabled Quiz

## Overview

This project includes Docker support for containerizing both the React frontend and Spring Boot backend as a single application.

## Required Files

The Docker setup consists of these required files:

1. **Dockerfile** - Multi-stage build for frontend and backend
2. **docker-compose.yml** - Service orchestration
3. **.dockerignore** - Build context optimization
4. **.env.example** - Environment variables template

---

## Prerequisites

- **Docker**: Version 20.10 or higher ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose**: Version 2.0 or higher
- **Google Gemini API Key**: Get free API key at https://aistudio.google.com/app/apikey

---

## Quick Start (3 Steps)

### Step 1: Setup Environment Variables

```powershell
# Copy the example environment file
Copy-Item .env.example .env

# Edit .env and add your Google Gemini API key
notepad .env
```

Required in `.env`:
```
GOOGLE_API_KEY=your-google-gemini-api-key-here
```

### Step 2: Build and Start

```powershell
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f interview-guide
```

### Step 3: Access Application

- **Frontend**: http://localhost:8080
- **API Endpoint**: http://localhost:8080/api/topics

---

## Docker Compose Commands

```powershell
# Start services in background
docker-compose up -d

# Start and view logs
docker-compose up

# Stop services
docker-compose stop

# Start services again
docker-compose start

# Restart services
docker-compose restart

# Stop and remove containers
docker-compose down

# View logs
docker-compose logs -f interview-guide

# Execute command in container
docker-compose exec interview-guide sh
```

---

## Manual Docker Commands

### Build Image

```powershell
# Build the Docker image
docker build -t interview-guide:latest .
```

### Run Container

```powershell
# Run with environment file
docker run -d `
  -p 8080:8080 `
  --env-file .env `
  --name interview-guide-app `
  interview-guide:latest

# Run with direct environment variable
docker run -d `
  -p 8080:8080 `
  -e GOOGLE_API_KEY="your-api-key" `
  --name interview-guide-app `
  interview-guide:latest

# Run with custom memory settings
docker run -d `
  -p 8080:8080 `
  --env-file .env `
  -e JAVA_OPTS="-Xms512m -Xmx1024m" `
  --name interview-guide-app `
  interview-guide:latest
```

### Container Management

```powershell
# View running containers
docker ps

# View all containers
docker ps -a

# View container logs
docker logs interview-guide-app
docker logs -f interview-guide-app  # Follow logs

# Stop container
docker stop interview-guide-app

# Start container
docker start interview-guide-app

# Remove container
docker rm interview-guide-app

# View container stats
docker stats interview-guide-app
```

### Image Management

```powershell
# View images
docker images

# Remove image
docker rmi interview-guide:latest

# Remove unused images
docker image prune -f
```

---

## Environment Variables

### Required

- **GOOGLE_API_KEY**: Your Google Gemini API key (required for AI features)
  - Get free: https://aistudio.google.com/app/apikey

### Optional (Defaults Provided)

| Variable | Default | Description |
|----------|---------|-------------|
| JAVA_OPTS | `-Xms256m -Xmx512m` | JVM memory settings |
| LOG_LEVEL | `INFO` | Logging level (INFO, DEBUG, WARN, ERROR) |
| TZ | `UTC` | Timezone |

### Example .env File

```env
GOOGLE_API_KEY=your-google-gemini-api-key
JAVA_OPTS=-Xms512m -Xmx1024m
LOG_LEVEL=INFO
TZ=UTC
```

---

## How It Works

### Build Process

The Dockerfile uses a multi-stage build:

1. **Builder Stage**:
   - Uses Maven 3.9 with Java 17
   - Installs Node.js and npm locally
   - Builds React frontend (Vite)
   - Builds Spring Boot backend
   - Creates a single executable JAR with bundled frontend

2. **Runtime Stage**:
   - Uses lightweight Alpine Linux
   - Copies the built JAR
   - Exposes port 8080
   - Includes health checks

### Architecture

```
┌─────────────────────────────────────────────────┐
│         Docker Container (Port 8080)             │
├─────────────────────────────────────────────────┤
│  Spring Boot Backend (Java 17)                   │
│  ├── REST API (/api/*)                           │
│  ├── Google Gemini Integration                   │
│  └── Static Frontend Assets (React/Vite Built)   │
├─────────────────────────────────────────────────┤
│  React Frontend (Served by Spring Boot)          │
│  ├── React Components                            │
│  ├── Vite Build Output                           │
│  └── Tailwind CSS Styling                        │
└─────────────────────────────────────────────────┘
```

---

## Health Checks

The container includes an automatic health check that monitors:

```
http://localhost:8080/api/topics
```

- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Startup Period**: 40 seconds
- **Retries**: 3 consecutive failures to mark unhealthy

The container will automatically restart if unhealthy.

---

## Troubleshooting

### 1. GOOGLE_API_KEY Not Set

**Error**: `Error: GOOGLE_API_KEY environment variable is not set`

**Solution**:
```powershell
Copy-Item .env.example .env
notepad .env  # Add your API key
docker-compose down
docker-compose up -d
```

### 2. Port 8080 Already in Use

**Error**: `Error response from daemon: bind: address already in use`

**Solution**:
```powershell
# Option A: Stop the service using port 8080
netstat -ano | findstr :8080

# Option B: Change port in docker-compose.yml
# Change "8080:8080" to "9080:8080"
# Then access at http://localhost:9080
```

### 3. Container Crashes

**Check logs**:
```powershell
docker-compose logs interview-guide

# Or for specific container
docker logs interview-guide-app
```

**Common causes**:
- Missing GOOGLE_API_KEY
- Insufficient memory (increase JAVA_OPTS)
- Port conflict

### 4. Out of Memory Error

**Solution**: Increase JVM memory in .env file:
```env
JAVA_OPTS=-Xms512m -Xmx2048m
```

### 5. Slow Build

**First build takes 5-10 minutes** because it:
- Downloads Maven dependencies
- Installs Node.js and npm
- Builds React frontend
- Builds Spring Boot application

**Subsequent builds use Docker cache** and are much faster.

---

## Performance

### Build Time
- **First build**: 5-10 minutes (includes all dependencies)
- **Subsequent builds**: 1-3 minutes (uses Docker cache)

### Runtime
- **Image size**: ~300-400 MB
- **Memory usage**: 256-512 MB (configurable)
- **Startup time**: 30-40 seconds
- **CPU usage**: Minimal at idle

### Resource Limits (docker-compose.yml)

```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

Adjust these based on your infrastructure.

---

## Common Use Cases

### Local Development

```powershell
# Start for development
docker-compose up

# Keep logs visible, press Ctrl+C to stop
# Changes to source code require rebuild:
docker-compose build --no-cache
docker-compose up
```

### Testing

```powershell
# Run with test logging
docker run -d `
  -p 8080:8080 `
  --env-file .env `
  -e LOG_LEVEL=DEBUG `
  --name test-app `
  interview-guide:latest

docker logs -f test-app
```

### Production-like Setup

```powershell
# Run with higher memory
docker run -d `
  -p 8080:8080 `
  --env-file .env `
  -e JAVA_OPTS="-Xms1024m -Xmx2048m" `
  -e LOG_LEVEL=WARN `
  --name prod-app `
  interview-guide:latest
```

---

## File Descriptions

### Dockerfile
Multi-stage build that:
- Builds React frontend with Vite
- Builds Spring Boot backend with Maven
- Packages everything into a single JAR
- Runs on Alpine Linux for minimal size

### docker-compose.yml
Orchestrates the application with:
- Service configuration
- Port mapping (8080:8080)
- Environment variable support
- Health checks
- Volume management for logs
- Resource limits

### .dockerignore
Optimizes build by excluding:
- Version control files (.git, .gitignore)
- IDE files (.idea, .vscode)
- Dependencies (node_modules, target, .m2)
- Development artifacts and logs

### .env.example
Template for environment variables. Copy to `.env` and customize with your values.

---

## Docker Compose Configuration Details

```yaml
services:
  interview-guide:                    # Service name
    build:
      context: .                      # Build from current directory
      dockerfile: Dockerfile          # Using main Dockerfile
    container_name: interview-guide-app
    ports:
      - "8080:8080"                   # Host:Container port mapping
    environment:
      - GOOGLE_API_KEY=${GOOGLE_API_KEY}  # From .env file
      - JAVA_OPTS                     # JVM settings
    volumes:
      - ./logs:/app/logs              # Mount logs directory
    restart: unless-stopped           # Always restart unless manually stopped
    healthcheck:                       # Monitor container health
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/api/topics"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    deploy:
      resources:
        limits:
          cpus: '1.0'                 # CPU limit
          memory: 1G                  # Memory limit
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Spring Boot and Docker](https://spring.io/guides/topicals/spring-boot-docker/)
- [Google AI Studio](https://aistudio.google.com/)

---

## Summary

| Task | Command |
|------|---------|
| Setup | `Copy-Item .env.example .env && notepad .env` |
| Start | `docker-compose up -d` |
| Logs | `docker-compose logs -f interview-guide` |
| Stop | `docker-compose down` |
| Access | http://localhost:8080 |
| Rebuild | `docker-compose build --no-cache && docker-compose up -d` |

---

**Last Updated**: July 2026

