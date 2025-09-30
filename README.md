# BGPack - Board Games Pack

BGPack (Board Games Pack) is a full-stack application for discovering and managing board game collections from your friends' group. The name represents a "pack" of board games from your "pack" of friends. The project consists of a React frontend with TypeScript and a Spring Boot backend.

## Features

### Core Functionality

- **Board Game Search** - search for games from BoardGameGeek API with advanced filtering
- **Friends' Collections** - browse and discover games owned by your friends on BGG
- **Smart Filtering** - comprehensive filtering by players, time, rating, age, and year
- **Game List Management** - save, organize, and manage custom game lists
- **Real-time Data** - live integration with BoardGameGeek API (no mock data)

### Advanced Features

- **Exact vs Overlap Matching** - flexible player count filtering (exact match or overlap support)
- **Collection Persistence** - MongoDB storage for saved game lists
- **Rate Limiting** - intelligent API usage optimization and circuit breaker
- **Error Handling** - graceful fallbacks when API is unavailable
- **Caching** - Spring Cache integration for improved performance

### User Experience

- **Modern UI** - responsive interface with Tailwind CSS
- **Multi-language Support** - English and Polish localization
- **Real-time Updates** - instant filtering and search results
- **Mobile Responsive** - optimized for all device sizes

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

## Project Structure

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

### Game Search & Details

- `GET /api/test` - Health check endpoint
- `GET /api/games` - Search games with comprehensive filtering
- `GET /api/games/{id}` - Get detailed game information by ID

### User Collections

- `GET /api/own/{username}` - Get user's board game collection from BGG
- `GET /api/own/{username}?excludeExpansions=true` - Get collection excluding expansions

### Game List Management

- `POST /api/game-lists/{username}` - Save a new game list
- `GET /api/game-lists/{username}` - Get all saved game lists for user
- `DELETE /api/game-lists/{username}/{listId}` - Delete a specific game list

### Usage Examples

```bash
# Test connection
curl http://localhost:8080/api/test

# Search games with filters
curl "http://localhost:8080/api/games?search=catan&minPlayers=3&maxPlayers=4"

# Get user's BGG collection
curl http://localhost:8080/api/own/username

# Save a game list
curl -X POST http://localhost:8080/api/game-lists/admin \
  -H "Content-Type: application/json" \
  -d '{
    "listName": "Family Games",
    "usernames": ["user1", "user2"],
    "games": [{"id": "1", "name": "Catan"}],
    "exactPlayerFilter": false
  }'

# Get saved game lists
curl http://localhost:8080/api/game-lists/admin

# Delete a game list
curl -X DELETE http://localhost:8080/api/game-lists/admin/list-id
```

## Game Filtering System

BGPack provides comprehensive filtering capabilities to help you find the perfect games for your group. The filtering system supports both **exact matching** and **overlap matching** for player counts, giving you flexibility in how you search for games.

### Filter Types

#### Player Count Filters

**Min Players** and **Max Players** filters allow you to find games suitable for your group size. The system supports two modes:

**Non-Exact Mode (Default):**

- Shows games that **support** the specified player range
- Example: Filtering for 3-4 players shows games like:
  - `2-4 players` (supports 3-4) ✅
  - `3-4 players` (supports 3-4) ✅
  - `1-5 players` (supports 3-4) ✅
  - `4-6 players` (supports 4) ✅

**Exact Mode:**

- Shows only games with **exactly** the specified player range
- Example: Filtering for 3-4 players (exact) shows only:
  - `3-4 players` (exact match) ✅
  - `2-4 players` (not exact) ❌
  - `1-5 players` (not exact) ❌

**Toggle between modes using the "Exact player count match" checkbox.**

#### Playing Time Filters

**Min Playing Time** and **Max Playing Time** filters help you find games that fit your available time:

- Example: `30-60 minutes` shows games with playing time between 30 and 60 minutes

#### Age Filters

**Min Age** filters games by recommended minimum age:

- Example: `12+` shows games recommended for ages 12 and above

#### Rating Filters

**Min Rating** filters games by BGG rating:

- Example: `7.0+` shows games with BGG rating of 7.0 or higher

#### Year Filters

**Year From** and **Year To** filters games by publication year:

- Example: `2010-2020` shows games published between 2010 and 2020

### Filtering Examples

**Example 1: Family Game Night**

```
Min Players: 4
Max Players: 4
Min Age: 8
Max Playing Time: 60
Min Rating: 7.0
```

Result: Games for exactly 4 players, suitable for ages 8+, under 60 minutes, with good ratings.

**Example 2: Large Group Games**

```
Min Players: 6
Exact Match: OFF (non-exact mode)
```

Result: All games that support 6+ players (6-8, 6-10, 1-10, etc.)

**Example 3: Quick Games for Any Group Size**

```
Max Playing Time: 30
Min Rating: 7.5
```

Result: Quick games (≤30 min) with excellent ratings, regardless of player count.

### Filter Behavior

- **Multiple filters** work together with AND logic (all conditions must be met)
- **Empty filters** are ignored (no filtering applied)
- **Sorting** works on filtered results
- **Pagination** applies to filtered results
- **Real-time filtering** - results update as you change filter values

### API Filter Parameters

All filters are available via the REST API:

```bash
# Player count filters
curl "http://localhost:8080/api/games?minPlayers=2&maxPlayers=4&exactPlayerFilter=true"

# Playing time filters
curl "http://localhost:8080/api/games?minPlayingTime=30&maxPlayingTime=90"

# Rating and age filters
curl "http://localhost:8080/api/games?minRating=7.0&minAge=12"

# Year filters
curl "http://localhost:8080/api/games?yearFrom=2020&yearTo=2023"

# Combined filters
curl "http://localhost:8080/api/games?minPlayers=3&maxPlayers=5&minPlayingTime=45&maxPlayingTime=90&minRating=7.5"
```

## Architecture

### Technology Stack

**Frontend:**

- React 18 with TypeScript
- Redux Toolkit for state management
- React Router for navigation
- Tailwind CSS for styling
- Axios for API communication
- Playwright for E2E testing
- Prettier for code formatting

**Backend:**

- Spring Boot 3.2 with Java 17
- Spring Security for authentication and CORS
- Spring Web for REST API
- Spring Data MongoDB for persistence
- Spring Cache for performance optimization
- Lombok for code simplification
- Jackson for XML parsing
- Google Java Format + Checkstyle for code quality

**Infrastructure:**

- MongoDB for data persistence
- Docker & Docker Compose for containerization
- Nginx for frontend serving
- Maven for build management

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
Frontend (port 3000) → Nginx → Backend (port 8080) → MongoDB
                                           ↓
                                      BGG API
```

### Data Flow

1. **Game Search**: Frontend → Backend → BGG API → Filtered Results
2. **Collection Fetch**: Frontend → Backend → BGG API → User's Games
3. **List Management**: Frontend → Backend → MongoDB → Persistent Storage
4. **Caching**: Spring Cache stores frequently accessed data for performance

### Code Quality

The project includes automated code formatting and quality checks:

- **Pre-commit hook** - automatically formats code before commits
- **Frontend**: Prettier for TypeScript/JavaScript/CSS formatting
- **Backend**: Google Java Format + Checkstyle for Java code quality

## Troubleshooting

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

## Game Statistics Feature

BGPack now includes advanced game statistics functionality that extends the basic BGG API with comprehensive game data caching and enhanced statistics retrieval.

### Overview

The new functionality extends the BGPack system with the ability to fetch and store extended game statistics from the BoardGameGeek API. The system automatically fetches and caches statistics to avoid slow BGG API queries.

### New Backend Endpoints

#### 1. `GET /api/games/{gameId}/stats`

Retrieves statistics for a single game.

**Parameters:**

- `gameId` (path) - BGG game ID

**Response:**

```json
{
  "gameId": "2536",
  "name": "Vabanque",
  "bggRating": 6.46569,
  "averageRating": 5.75008,
  "averageWeight": 1.44593,
  "suggestedNumPlayers": "3, 4, 5"
}
```

#### 2. `GET /api/own/{username}/with-stats`

Retrieves user's games with extended statistics.

**Parameters:**

- `username` (path) - BGG username
- `excludeExpansions` (query, optional) - whether to exclude expansions (default: false)

**Response:**

```json
[
  {
    "id": "2536",
    "name": "Vabanque",
    "yearPublished": 2001,
    "minPlayers": 3,
    "maxPlayers": 6,
    "playingTime": 45,
    "minAge": 12,
    "description": "A party meets for a game...",
    "imageUrl": "https://cf.geekdo-images.com/...",
    "thumbnailUrl": "https://cf.geekdo-images.com/...",
    "bggRating": 6.46569,
    "averageRating": 5.75008,
    "complexity": 1.44593,
    "ownedBy": ["user1", "user2"],
    "averageWeight": 1.44593,
    "suggestedNumPlayers": "3, 4, 5"
  }
]
```

#### 3. `POST /api/games/stats/batch`

Retrieves statistics for multiple games at once.

**Body:**

```json
["2536", "1234", "5678"]
```

**Response:**

```json
[
  {
    "gameId": "2536",
    "name": "Vabanque",
    "bggRating": 6.46569,
    "averageRating": 5.75008,
    "averageWeight": 1.44593,
    "suggestedNumPlayers": "3, 4, 5"
  }
]
```

### Data Sources from BGG API

The system uses the following BGG API endpoints:

#### Basic endpoints (existing):

- `/thing?id={id}&stats=1` - single game details with statistics
- `/collection/{username}?own=1&stats=1` - user collection with basic statistics
- `/thing?id={ids}&stats=1` - multiple games with statistics

#### New endpoints:

- `/thing?id={id}&stats=1` - extended statistics for single game
- `/thing?id={ids}&stats=1` - extended statistics for multiple games

### Data Structure

#### New fields in Game model:

- `averageWeight` - average game weight (difficulty)
- `suggestedNumPlayers` - suggested number of players

#### New GameStats entity:

```java
@Document(collection = "game_stats")
public class GameStats {
    private String gameId;
    private String name;
    private Double bggRating;
    private Double averageRating;
    private Double averageWeight;
    private String suggestedNumPlayers;
    // Cache metadata
    private LocalDateTime cachedAt;
    private LocalDateTime lastUpdated;
    private Integer cacheHits;
}
```

### Caching Mechanism

1. **Cache Check** - system first checks if statistics are already in the database
2. **BGG Fetch** - if not in cache, fetches from BGG API
3. **Cache Save** - saves fetched data to database with metadata
4. **Usage Tracking** - counts how many times data was used

### Frontend

#### New TypeScript types:

```typescript
export interface GameStats {
  gameId: string;
  name: string;
  bggRating: number | null;
  averageRating: number | null;
  averageWeight: number | null;
  suggestedNumPlayers: string | null;
}

export interface GameWithStats extends Game {
  averageWeight?: number | null;
  suggestedNumPlayers?: string | null;
}
```

#### New API Service methods:

```typescript
async getOwnedGamesWithStats(username: string, excludeExpansions?: boolean): Promise<GameWithStats[]>
async getGameStats(gameId: string): Promise<GameStats>
async getMultipleGameStats(gameIds: string[]): Promise<GameStats[]>
```

### Logging and Monitoring

The system logs the following information:

- Number of games fetched for a given user
- Number of elements fetched for a given game
- Errors during BGG API fetching
- Cache hit/miss information

Example logs:

```
INFO - Getting stats for 5 games
INFO - Found cached stats for game ID: 2536
INFO - Fetching 3 missing games from BGG API
INFO - Successfully fetched and cached stats for 3 games
```

### Performance Optimization

1. **Cache Priority** - always checks cache before BGG API
2. **Batch Requests** - fetches multiple games simultaneously
3. **Rate Limiting** - respects BGG API limits
4. **Retry Mechanism** - automatic retries on errors
5. **Circuit Breaker** - protection against API overload

### Configuration

All settings are in `application.yml`:

```yaml
bgg:
  api:
    base-url: "https://www.boardgamegeek.com/xmlapi2"
    timeout: 60000
    rate-limit: 1.0 # requests per second
    max-requests-per-hour: 3600
    circuit-breaker-threshold: 5
    circuit-breaker-timeout: 300
```

### Statistics Completeness Criteria

Statistics are considered complete when they contain all four key fields:

- `bggRating` - BGG rating
- `averageRating` - average rating
- `averageWeight` - average difficulty
- `suggestedNumPlayers` - suggested number of players

Other fields are optional and do not affect completeness assessment.

### Testing

To test the new endpoints:

1. **Single game:**

```bash
curl http://localhost:8080/api/games/2536/stats
```

2. **User games with statistics:**

```bash
curl http://localhost:8080/api/own/username/with-stats
```

3. **Multiple games:**

```bash
curl -X POST http://localhost:8080/api/games/stats/batch \
  -H "Content-Type: application/json" \
  -d '["2536", "1234", "5678"]'
```

## License

This project is licensed under a custom license. See [LICENSE.md](LICENSE.md) for details.
