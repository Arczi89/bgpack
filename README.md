# BGPack - Board Games Pack

BGPack (Board Games Pack) is a full-stack application for discovering and managing board game collections from your friends' group. The name represents a "pack" of board games from your "pack" of friends. The project consists of a React frontend with TypeScript and a Spring Boot backend.

## Features

- **Friends' game discovery** - see what games your friends own on BGG
- **Smart filtering** - filter by players, time, rating, and more
- **Collection aggregation** - combine multiple friends' collections
- **Save favorite lists** - save search results for later reference
- **BGG integration** - real data from BoardGameGeek API
- **Modern UI** - responsive interface with Tailwind CSS
- **Multi-language** - English and Polish support

## Quick Start

### Requirements

- **Docker** and **Docker Compose** (for backend)
- **Node.js 18+** (for frontend development)

### Development Setup (Recommended)

**One command to run the entire project:**

```bash
# Linux/Mac - Backend in Docker (default)
./start-dev.sh

# Linux/Mac - Backend locally (requires Java 17)
./start-dev.sh --local

# Windows - Backend in Docker (default)
start-dev.bat

# Windows - Backend locally (requires Java 17)
start-dev.bat --local
```

**Stop the application:**

```bash
# Linux/Mac
./stop-dev.sh

# Windows
stop-dev.bat
```

**Application will be available at:**

- Frontend: http://localhost:3000 (local development)
- Backend: http://localhost:8080 (Docker container or local)

### Backend Options

**Docker Backend (Default):**

- No Java installation required
- Consistent environment
- Slower startup time

**Local Backend:**

- Requires Java 17 (included in `tools/jdk-17.0.2/`)
- Faster startup and debugging
- Direct access to logs

### Local Development (without Docker)

**One command (recommended):**

```bash
# Linux/Mac
./start-app.sh

# Windows
start-app.bat
```

**Or manually:**

```bash
# Backend
cd backend
./mvnw spring-boot:run

# Frontend (in new terminal)
cd frontend
npm install
npm start
```

**Stop:**

```bash
# Linux/Mac
./stop-app.sh

# Windows - press Ctrl+C in start-app.bat window
```

## 📁 Project Structure

```
bgpack/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── features/         # Application features
│   │   │   ├── auth/         # Authentication
│   │   │   ├── game-list/    # Game listing
│   │   │   └── user-collection/ # User collection
│   │   ├── store/            # Redux store
│   │   └── types/            # TypeScript definitions
│   ├── Dockerfile            # Production Docker
│   ├── Dockerfile.dev        # Development Docker
│   ├── nginx.conf            # Nginx configuration
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # Spring Boot backend
│   ├── src/main/java/com/bgpack/
│   │   ├── controller/       # REST controllers
│   │   ├── service/          # Business logic
│   │   ├── dto/              # Data Transfer Objects
│   │   └── config/           # Configuration
│   ├── Dockerfile            # Backend Docker
│   └── pom.xml
├── docker-compose.yml        # Production Docker Compose
├── docker-compose.dev.yml    # Development Docker Compose
├── docker-run.sh            # Docker startup script (Linux/Mac)
├── docker-run.bat           # Docker startup script (Windows)
├── start-app.sh             # Local startup script (Linux/Mac)
├── start-app.bat            # Local startup script (Windows)
├── stop-app.sh              # Stop script (Linux/Mac)
└── README.md
```

## API Endpoints

- `GET /api/test` - Test endpoint
- `GET /api/games` - List games with optional filters
- `GET /api/games/{id}` - Get specific game details

### Usage Examples

```bash
# Test connection
curl http://localhost:8080/api/test

# List games
curl http://localhost:8080/api/games

# Filter games
curl "http://localhost:8080/api/games?minPlayers=2&maxPlayers=4"
```

## Architecture

### Technology Stack

**Frontend:**

- React 18 with TypeScript
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Axios for API communication
- Prettier for code formatting

**Backend:**

- Spring Boot 3.2 with Java 17
- Spring Security for authentication
- Spring Web for REST API
- Lombok for code simplification
- Jackson for XML parsing
- Google Java Format + Checkstyle for code quality

### Docker Configuration

The application is fully containerized:

**Production (`docker-compose.yml`):**

- Backend: OpenJDK 17, port 8080
- Frontend: Multi-stage build with Nginx
- Health checks and dependencies

**Development (`docker-compose.dev.yml`):**

- Hot reload with volume mounts
- Debug support
- Development servers

### Application Flow

```
Frontend (port 3000) → Nginx → Backend (port 8080) → BGG API
```

### Code Quality

The project includes automated code formatting and quality checks:

- **Pre-commit hook** - automatically formats code before commits
- **Frontend**: Prettier for TypeScript/JavaScript/CSS formatting
- **Backend**: Google Java Format + Checkstyle for Java code quality

## 🔧 Troubleshooting

### BGG API Integration Issues

If the application returns mock data instead of real BGG data, check these configurations:

#### SSL/TLS Certificate Issues

**Problem**: BGG API returns `null` responses due to SSL certificate validation failures.

**Solution**: The backend is configured to ignore SSL certificate issues:

```java
// In BggApiClient.java
.trustManager(io.netty.handler.ssl.util.InsecureTrustManagerFactory.INSTANCE)
```

#### Redirect Handling

**Problem**: BGG API redirects from `www.boardgamegeek.com` to `boardgamegeek.com`.

**Solution**: Enable automatic redirects:

```java
// In BggApiClient.java
.followRedirect(true)
```

#### User-Agent Requirements

**Problem**: BGG API blocks requests with custom User-Agent strings.

**Solution**: Use standard browser User-Agent:

```java
// In BggApiClient.java
.defaultHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...")
```

#### Rate Limiting

**Problem**: BGG API blocks requests that exceed rate limits.

**Solution**: Configure appropriate rate limiting in `application.yml`:

```yaml
bgg:
  api:
    rate-limit: 1.0 # 1 request per second
    max-requests-per-hour: 3600 # 3600 requests per hour
```

#### CORS Configuration

**Problem**: Frontend cannot access backend API.

**Solution**: Configure CORS in `application.yml`:

```yaml
spring:
  web:
    cors:
      allowed-origins: "http://localhost:3000,http://127.0.0.1:3000"
      allowed-methods: "GET,POST,PUT,DELETE,OPTIONS"
      allowed-headers: "*"
      allow-credentials: true
```

### Common Issues

1. **Backend returns mock data**: Check BGG API configuration and SSL settings
2. **CORS errors**: Verify CORS configuration in `application.yml`
3. **Rate limiting**: Ensure rate limits are not exceeded
4. **SSL errors**: Backend is configured to ignore SSL certificate issues

## 📄 License

This project is licensed under a custom license. See [LICENSE.md](LICENSE.md) for details.
