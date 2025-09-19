# BGG API E2E Tests

End-to-end tests for BoardGameGeek API integration, including tests for user `arczi89`.

## Test Files

- `bgg-api.spec.ts` - Direct API calls, rate limiting, health checks
- `collection-ui.spec.ts` - UI forms, collection display, filtering
- `api-integration.spec.ts` - Real BGG API integration, performance tests

## Quick Start

```bash
npm install
npx playwright install
npm run test:e2e
```

## Commands

```bash
npm run test:e2e              # Run all tests
npm run test:e2e:ui           # Run with UI
npm run test:e2e:headed       # Run with browser
npx playwright test api-integration.spec.ts  # Specific test
```

## Requirements

- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000`
- Internet connection for BGG API

## Expected Results

**Success:** Status 200 with game collection data
**Acceptable:** Status 429 (rate limited), 404 (private collection)
**Failure:** Status 5xx, timeouts, invalid data structure

## Configuration

- Auto-starts dev servers
- Tests Chrome, Firefox, Safari + Mobile
- Screenshots/video on failure
- Rate limit: 1 request per 5 seconds
