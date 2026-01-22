# BGPack - Board Games Pack

BGPack (Board Games Pack) is a full-stack application for discovering and managing board game collections from your friends' group. The name represents a "pack" of board games from your "pack" of friends. The project consists of a React frontend with TypeScript and a Spring Boot backend.

## Features

### Core Functionality

- **Board Game Search** - search for games from BoardGameGeek API with advanced filtering
- **Friends' Collections** - browse and discover games owned by your friends on BGG
- **Smart Filtering** - comprehensive filtering by players, time, rating, age, and year
- **Search Presets** - save and reuse search filter configurations
- **Real-time Data** - live integration with BoardGameGeek API (no mock data)
- **Intelligent Caching** - PostgreSQL-based cache with `last_sync` and `cache_hits` tracking

### Advanced Features

- **Exact vs Overlap Matching** - flexible player count filtering (exact match or overlap support)
- **Collection Persistence** - PostgreSQL storage for games, users, and collections
- **Rate Limiting** - intelligent API usage optimization and circuit breaker
- **Error Handling** - graceful fallbacks when API is unavailable
- **Caching System** - multi-level caching with Spring Cache (Caffeine) and database cache
- **Database Migrations** - Flyway for schema versioning and management
- **Health Checks** - custom health check endpoint for monitoring

### User Experience

- **Modern UI** - responsive interface with Tailwind CSS
- **Multi-language Support** - English and Polish localization
- **Real-time Updates** - instant filtering and search results
- **Mobile Responsive** - optimized for all device sizes

## Quick Start

### Requirements

- **Docker** and **Docker Compose** (for PostgreSQL and optional backend)
- **Node.js 18+** (for frontend development)
- **Java 21** (optional - only if running backend locally, included in `tools/jdk-21/`)

### Development Setup (Recommended)

**One command to run the entire project (includes PostgreSQL):**

```bash
# Linux/Mac - Backend in Docker (default)
./start-dev.sh

# Linux/Mac - Backend locally (requires Java 21)
./start-dev.sh --local

# Windows - Backend in Docker (default)
start-dev.bat

# Windows - Backend locally (requires Java 21)
start-dev.bat --local
```

**This automatically starts:**

- ✅ PostgreSQL database (Docker container)
- ✅ Backend API (Docker container or local Java process)
- ✅ Frontend dev server (local npm)

**Services will be available at:**

- Frontend: http://localhost:3000 (local development)
- Backend: http://localhost:8080
- Database: localhost:5432 (PostgreSQL)

**Stop the application:**

```bash
# Linux/Mac
./stop-dev.sh

# Windows
stop-dev.bat
```

**For more details about startup scripts, see:** [STARTUP_SCRIPTS_README.md](documentation/STARTUP_SCRIPTS_README.md)

### Backend Options

**Docker Backend (Default):**

- No Java installation required
- Consistent environment
- Slower startup time

**Local Backend:**

- Requires Java 21 (included in `tools/jdk-21/`)
- Faster startup and debugging
- Direct access to logs

## Environment Variables

The application uses the following environment variables:

### Database Configuration

- `POSTGRES_DB` - PostgreSQL database name (default: `bgpack`)
- `POSTGRES_USER` - PostgreSQL username (default: `bgpack_user`)
- `POSTGRES_PASSWORD` - PostgreSQL password (default: `bgpack_pass`)
- `POSTGRES_PORT` - PostgreSQL port (default: `5432`)

### Backend Configuration

- `SPRING_PROFILES_ACTIVE` - Spring profile (default: `dev`)
- `SPRING_DATASOURCE_URL` - Database connection URL (default: `jdbc:postgresql://localhost:5432/bgpack`)
- `SPRING_DB_USERNAME` - Database username (default: `bgpack_user`)
- `SPRING_DB_PASSWORD` - Database password (default: `bgpack_pass`)
- `SERVER_PORT` - Backend server port (default: `8080`)
- `JPA_DDL_AUTO` - Hibernate DDL mode (default: `update`)
- `JPA_SHOW_SQL` - Show SQL queries in logs (default: `true`)

### BGG API Configuration

- `BGG_API_TOKEN` - BoardGameGeek API token (optional)

### JWT Configuration (for future authentication)

- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRATION` - JWT expiration time in milliseconds (default: `86400000`)

### PgAdmin Configuration (optional)

- `PGADMIN_EMAIL` - PgAdmin login email
- `PGADMIN_PASSWORD` - PgAdmin login password
- `PGADMIN_PORT` - PgAdmin port (default: `5050`)

### Example `.env` file:

```env
POSTGRES_DB=bgpack
POSTGRES_USER=bgpack_user
POSTGRES_PASSWORD=bgpack_pass
POSTGRES_PORT=5432
SPRING_PROFILES_ACTIVE=dev
BGG_API_TOKEN=your_token_here
PGADMIN_EMAIL=admin@example.com
PGADMIN_PASSWORD=admin123
PGADMIN_PORT=5050
```

## Project Structure

```
bgpack/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── features/         # Application features
│   │   │   └── game-list/     # Game listing and search
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # API services
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
│   │   ├── entity/           # JPA entities
│   │   ├── repository/       # JPA repositories
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── config/           # Configuration classes
│   │   ├── client/           # External API clients
│   │   ├── exception/        # Exception handlers
│   │   └── health/           # Health check classes
│   ├── src/main/resources/
│   │   ├── db/migration/     # Flyway migrations
│   │   └── application.yml   # Application configuration
│   ├── Dockerfile            # Backend Docker
│   └── pom.xml
├── docker-compose.yml        # Production Docker Compose
├── docker-compose.dev.yml    # Development Docker Compose
├── start-dev.sh             # Development startup script (Linux/Mac)
├── start-dev.bat            # Development startup script (Windows)
├── stop-dev.sh              # Stop script (Linux/Mac)
├── stop-dev.bat             # Stop script (Windows)
└── README.md
```

## API Endpoints

### Health Check

- `GET /api/test` - Health check endpoint

### Game Search

- `GET /api/games` - Search games with comprehensive filtering
  - Query parameters:
    - `search` - Search term (required)
    - `minPlayers` - Minimum number of players
    - `maxPlayers` - Maximum number of players
    - `minPlayingTime` - Minimum playing time in minutes
    - `maxPlayingTime` - Maximum playing time in minutes
    - `minAge` - Minimum age
    - `minRating` - Minimum BGG rating
    - `yearFrom` - Year from
    - `yearTo` - Year to
    - `exactPlayerFilter` - Boolean for exact player count matching

### User Collections

- `GET /api/own/{username}/with-stats` - Get user's board game collection from BGG with statistics
  - Path parameters:
    - `username` - BGG username (required)
  - Query parameters:
    - `excludeExpansions` - Exclude expansions (default: `false`)

### Search Presets

- `POST /api/search-presets/{username}` - Save a new search preset
- `GET /api/search-presets/{username}` - Get all saved search presets for user
- `GET /api/search-presets/{username}/{presetId}/execute` - Execute a saved search preset
- `DELETE /api/search-presets/{username}/{presetId}` - Delete a specific search preset

### Circuit Breaker Management

- `POST /api/bgg/reset-cache/{endpoint}` - Reset circuit breaker for a specific endpoint

### Usage Examples

```bash
# Test connection
curl http://localhost:8080/api/test

# Search games with filters
curl "http://localhost:8080/api/games?search=catan&minPlayers=3&maxPlayers=4"

# Get user's BGG collection
curl "http://localhost:8080/api/own/username/with-stats?excludeExpansions=true"

# Save a search preset
curl -X POST http://localhost:8080/api/search-presets/admin \
  -H "Content-Type: application/json" \
  -d '{
    "presetName": "Family Games",
    "filterCriteria": {
      "minPlayers": 2,
      "maxPlayers": 4,
      "minAge": 8,
      "maxPlayingTime": 60
    }
  }'

# Get saved search presets
curl http://localhost:8080/api/search-presets/admin

# Execute a search preset
curl http://localhost:8080/api/search-presets/admin/1/execute

# Delete a search preset
curl -X DELETE http://localhost:8080/api/search-presets/admin/1

# Reset circuit breaker
curl -X POST http://localhost:8080/api/bgg/reset-cache/search
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

### Filter Behavior

- **Multiple filters** work together with AND logic (all conditions must be met)
- **Empty filters** are ignored (no filtering applied)
- **Sorting** works on filtered results
- **Pagination** applies to filtered results
- **Real-time filtering** - results update as you change filter values

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

- Spring Boot 3.3 with Java 21
- Spring Security for authentication and CORS
- Spring Web for REST API
- Spring Data JPA for persistence (PostgreSQL)
- Spring Cache for performance optimization (Caffeine)
- Flyway for database migrations
- Spring WebFlux for reactive HTTP client (WebClient)
- Lombok for code simplification
- Jackson for XML parsing
- Google Java Format + Checkstyle for code quality

**Database:**

- PostgreSQL 15 for data persistence
- Flyway for schema versioning

**Infrastructure:**

- Docker & Docker Compose for containerization
- Nginx for frontend serving
- Maven for build management

### Database Schema

The application uses PostgreSQL with the following main tables:

- **users** - User information with `last_sync` timestamp for cache management
- **games** - Game data with `cached_at`, `cache_hits`, and `last_updated` for cache tracking
- **user_collections** - Many-to-many relationship between users and games
- **search_presets** - Saved search filter configurations
- **tags** - Game tags
- **game_tags** - Many-to-many relationship between games and tags

### Caching System

The application implements a multi-level caching system:

1. **Spring Cache (Caffeine)** - In-memory cache for frequently accessed data
   - TTL: 1 hour
   - Max size: 1000 entries
   - Used for game search results

2. **Database Cache** - PostgreSQL-based cache for games and collections
   - Games are cached with `cached_at` and `cache_hits` tracking
   - Users have `last_sync` timestamp to determine cache freshness
   - Cache is considered stale after 7 days
   - Cache hits are incremented on each access

3. **Cache Strategy**:
   - Check database cache first
   - If stale or missing, fetch from BGG API
   - Update cache with new data
   - Increment cache hits on successful cache reads

### Circuit Breaker

The application includes a circuit breaker pattern to protect against BGG API failures:

- **Threshold**: 5 consecutive failures (configurable)
- **Timeout**: 300 seconds before retry (configurable)
- **Automatic Recovery**: Circuit closes after timeout period
- **Manual Reset**: Available via API endpoint

### Rate Limiting

- **Rate Limit**: 1 request per second (configurable)
- **Hourly Limit**: 3600 requests per hour (configurable)
- **Automatic Tracking**: Request counts and failures are tracked

### Spring Framework Usage

The backend leverages multiple Spring Boot modules and core Spring concepts:

#### Spring Boot Modules

| Module                           | Purpose                                                 |
| -------------------------------- | ------------------------------------------------------- |
| `spring-boot-starter-web`        | REST API controllers and Jackson JSON serialization     |
| `spring-boot-starter-data-jpa`   | PostgreSQL integration with auto-generated repositories |
| `spring-boot-starter-security`   | CORS configuration and security policies                |
| `spring-boot-starter-cache`      | Declarative caching with Caffeine                       |
| `spring-boot-starter-webflux`    | Reactive WebClient for async BGG API calls              |
| `spring-boot-starter-validation` | Bean validation with `@Valid`                           |
| `spring-boot-starter-actuator`   | Health checks and metrics                               |

#### Core Spring Concepts

**1. Dependency Injection & IoC Container**

- Constructor-based injection for all components
- `@Service`, `@Repository`, `@Component`, `@RestController` stereotypes
- Automatic bean creation and lifecycle management

**2. Layered Architecture**

```
Controllers (@RestController) → Services (@Service) → Repositories (@Repository) → PostgreSQL
```

**3. Spring Data JPA**

- Query methods auto-generated from method names
- Example: `findByUsername(String username)` → `SELECT * FROM users WHERE username = ?`
- Zero repository implementation required

**4. Declarative Caching**

- `@Cacheable` on expensive BGG API calls
- Caffeine cache with 1-hour TTL and 1000 max entries
- Cache keys based on method parameters

**5. Reactive HTTP Client**

- `WebClient` for non-blocking BGG API calls
- `Mono<T>` reactive types with retry and timeout support
- Exponential backoff for failed requests

**6. Global Exception Handling**

- `@ControllerAdvice` for centralized error handling
- Validation errors mapped to user-friendly JSON responses

**7. Externalized Configuration**

- `application.yml` for all configuration
- `@Value` injection for properties
- Environment variable support with defaults

**8. Database Migrations**

- Flyway for schema versioning
- Automatic migration on application startup
- Baseline support for existing databases

#### Lombok Integration

Lombok reduces boilerplate code through compile-time code generation:

- `@Data` - generates getters, setters, `toString()`, `equals()`, `hashCode()`
- `@Builder` - implements Builder pattern for object creation
- `@RequiredArgsConstructor` - generates constructor for dependency injection
- `@Slf4j` - creates logger instance automatically
- `@NoArgsConstructor` / `@AllArgsConstructor` - generates constructors

### Docker Configuration

The application is fully containerized:

**Production (`docker-compose.yml`):**

- PostgreSQL: PostgreSQL 15 Alpine
- Backend: Java 21, port 8080
- PgAdmin: Database administration tool (optional)
- Health checks and dependencies

**Development (`docker-compose.dev.yml`):**

- Hot reload with volume mounts
- Debug support (port 5005)
- Development servers
- Frontend with hot module replacement

### Application Flow

```
Frontend (port 3000) → Backend (port 8080) → PostgreSQL (port 5432)
                                           ↓
                                      BGG API
```

### Data Flow

1. **Game Search**: Frontend → Backend → Check Cache → BGG API (if needed) → Filtered Results → Update Cache
2. **Collection Fetch**: Frontend → Backend → Check User Cache (`last_sync`) → BGG API (if stale) → Update Cache → Return Results
3. **Search Presets**: Frontend → Backend → PostgreSQL → Execute Search → Return Results
4. **Caching**: Multi-level caching stores frequently accessed data for performance

### Code Quality

The project includes automated code formatting and quality checks:

- **Pre-commit hook** - automatically formats code before commits
- **Frontend**: Prettier for TypeScript/JavaScript/CSS formatting
- **Backend**: Google Java Format + Checkstyle for Java code quality

## Troubleshooting

### Database Connection Issues

**Problem**: Backend cannot connect to PostgreSQL.

**Solution**:

- Check if PostgreSQL container is running: `docker ps | grep bgpack-postgres`
- Verify environment variables are set correctly
- Check database credentials in `application.yml` or environment variables
- Ensure PostgreSQL port is not blocked by firewall

### BGG API Integration Issues

If the application returns empty results or errors, check these configurations:

#### SSL/TLS Certificate Issues

**Problem**: BGG API returns `null` responses due to SSL certificate validation failures.

**Solution**: The backend is configured to handle SSL certificates properly via WebClient configuration.

#### Redirect Handling

**Problem**: BGG API redirects from `www.boardgamegeek.com` to `boardgamegeek.com`.

**Solution**: Enable automatic redirects in WebClient configuration.

#### User-Agent Requirements

**Problem**: BGG API blocks requests with custom User-Agent strings.

**Solution**: Use standard browser User-Agent in WebClient configuration.

#### Rate Limiting

**Problem**: BGG API blocks requests that exceed rate limits.

**Solution**: Configure appropriate rate limiting in `application.yml`:

```yaml
bgg:
  api:
    rate-limit: 1.0 # 1 request per second
    max-requests-per-hour: 3600 # 3600 requests per hour
```

#### Circuit Breaker

**Problem**: Circuit breaker is open and blocking requests.

**Solution**:

- Wait for automatic recovery (300 seconds default)
- Manually reset via API: `POST /api/bgg/reset-cache/{endpoint}`
- Check logs for consecutive failures

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

1. **Backend returns empty results**: Check BGG API configuration, circuit breaker status, and rate limits
2. **CORS errors**: Verify CORS configuration in `application.yml`
3. **Rate limiting**: Ensure rate limits are not exceeded
4. **Database connection**: Verify PostgreSQL is running and credentials are correct
5. **Cache issues**: Check `last_sync` timestamps and cache freshness logic
6. **Flyway migration errors**: Check migration files in `backend/src/main/resources/db/migration/`

## License

This project is licensed under a custom license. See [LICENSE.md](LICENSE.md) for details.
