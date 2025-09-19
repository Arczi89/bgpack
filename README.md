# BGPack - Board Games Pack

BGPack (Board Games Pack) is a full-stack application for discovering and managing board game collections from your friends' group. The name represents a "pack" of board games from your "pack" of friends. The project consists of a React frontend with TypeScript and a Spring Boot backend.

## 🎯 Features

- **Friends' game discovery** - see what games your friends own on BGG
- **Smart filtering** - filter by players, time, rating, and more
- **Collection aggregation** - combine multiple friends' collections
- **Save favorite lists** - save search results for later reference
- **BGG integration** - real data from BoardGameGeek API
- **Modern UI** - responsive interface with Tailwind CSS
- **Multi-language** - English and Polish support

## 🚀 Quick Start

### Requirements

- **Docker** and **Docker Compose** (recommended)
- Or alternatively: Node.js 18+, Java 17+, Maven 3.6+

### 🐳 Docker (Recommended)

**One command to run the entire project:**

```bash
# Linux/Mac
./docker-run.sh

# Windows
docker-run.bat
```

**Or manually:**

```bash
# Build and start all services
docker-compose up --build

# In background
docker-compose up --build -d

# Stop
docker-compose down
```

**Application will be available at:**

- Frontend: http://localhost:3000
- Backend: http://localhost:8080

### 🔧 Local Development (without Docker)

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

## 🔧 API Endpoints

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

## 🏗️ Architecture

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

## 📄 License

This project is licensed under a custom license. See [LICENSE.md](LICENSE.md) for details.
