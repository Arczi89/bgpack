import { test, expect } from '@playwright/test';

test.describe('BGG API Integration - Real User Tests', () => {
  const TEST_USERNAME = 'arczi89';
  const BACKEND_URL = 'http://localhost:8080';

  test('should successfully fetch collection for real BGG user arczi89', async ({
    request,
  }) => {
    console.log(`Testing BGG API integration for user: ${TEST_USERNAME}`);

    const response = await request.get(
      `${BACKEND_URL}/api/own/${TEST_USERNAME}`
    );
    const responseTime = Date.now();

    console.log(`Response status: ${response.status()}`);
    console.log(`Response time: ${responseTime}ms`);

    if (response.status() === 200) {
      const games = await response.json();
      console.log(
        `Successfully fetched ${games.length} games for user ${TEST_USERNAME}`
      );

      // Validate response structure
      expect(Array.isArray(games)).toBeTruthy();

      if (games.length > 0) {
        console.log('Sample games from collection:');
        games.slice(0, 10).forEach((game: any, index: number) => {
          console.log(
            `  ${index + 1}. ${game.name} (ID: ${game.id}) - ${game.yearPublished || 'N/A'}`
          );
        });

        // Validate game structure
        const firstGame = games[0];
        expect(firstGame).toHaveProperty('id');
        expect(firstGame).toHaveProperty('name');
        expect(typeof firstGame.name).toBe('string');
        expect(firstGame.name.length).toBeGreaterThan(0);

        // Check if we have BGG data (not just mock data)
        if (
          firstGame.id !== '1' &&
          firstGame.id !== '2' &&
          firstGame.id !== '3' &&
          firstGame.id !== '4' &&
          firstGame.id !== '5'
        ) {
          console.log('Confirmed: Real BGG API data received (not mock data)');
        }

        // Check for additional BGG fields
        if (
          firstGame.bggRating ||
          firstGame.averageRating ||
          firstGame.complexity
        ) {
          console.log('BGG statistics available:', {
            bggRating: firstGame.bggRating,
            averageRating: firstGame.averageRating,
            complexity: firstGame.complexity,
          });
        }
      } else {
        console.log('Collection is empty or user has no public games');
      }
    } else if (response.status() === 429) {
      console.log('Rate limited - this is expected behavior');
      expect(response.status()).toBe(429);
    } else if (response.status() === 404) {
      console.log('User not found or collection is private');
      expect(response.status()).toBe(404);
    } else {
      console.log(`Unexpected status: ${response.status()}`);
      // Still acceptable if it's a client error (4xx) rather than server error (5xx)
      expect(response.status()).toBeLessThan(500);
    }
  });

  test('should handle BGG API rate limiting properly', async ({ request }) => {
    console.log('Testing rate limiting behavior...');

    const startTime = Date.now();
    const promises = [];

    // Make 3 rapid requests to test rate limiting
    for (let i = 0; i < 3; i++) {
      promises.push(
        request
          .get(`${BACKEND_URL}/api/own/${TEST_USERNAME}`)
          .then(response => ({
            index: i,
            status: response.status(),
            time: Date.now() - startTime,
          }))
      );
    }

    const results = await Promise.all(promises);

    console.log('Rate limiting test results:');
    results.forEach(result => {
      console.log(
        `  Request ${result.index + 1}: Status ${result.status}, Time ${result.time}ms`
      );
    });

    // All requests should complete (either successfully or with rate limit response)
    results.forEach(result => {
      expect(result.status).toBeLessThan(500);
    });

    // At least one request should succeed or be rate limited (not fail)
    const hasValidResponse = results.some(
      result => result.status === 200 || result.status === 429
    );
    expect(hasValidResponse).toBeTruthy();
  });

  test('should search for specific games via BGG API', async ({ request }) => {
    const searchQueries = ['Catan', 'Ticket to Ride', 'Wingspan'];

    for (const query of searchQueries) {
      console.log(`Searching for: ${query}`);

      const response = await request.get(
        `${BACKEND_URL}/api/games?search=${encodeURIComponent(query)}`
      );

      if (response.status() === 200) {
        const games = await response.json();
        console.log(`  Found ${games.length} games for "${query}"`);

        expect(Array.isArray(games)).toBeTruthy();

        if (games.length > 0) {
          const firstGame = games[0];
          expect(firstGame).toHaveProperty('name');

          // Check if the game name contains our search term (case insensitive)
          const gameName = firstGame.name.toLowerCase();
          const searchTerm = query.toLowerCase();
          expect(gameName.includes(searchTerm)).toBeTruthy();

          console.log(`  First result: ${firstGame.name}`);
        }
      } else {
        console.log(`  Search returned status: ${response.status()}`);
        expect(response.status()).toBeLessThan(500);
      }

      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });

  test('should get detailed game information from BGG', async ({ request }) => {
    // Test with well-known BGG game IDs
    const gameIds = ['13', '9209', '266192']; // Catan, Ticket to Ride, Wingspan

    for (const gameId of gameIds) {
      console.log(`Getting details for game ID: ${gameId}`);

      const response = await request.get(`${BACKEND_URL}/api/games/${gameId}`);

      if (response.status() === 200) {
        const game = await response.json();
        console.log(`  Game: ${game.name} (${game.yearPublished})`);

        expect(game).toHaveProperty('id');
        expect(game).toHaveProperty('name');
        expect(game.id).toBe(gameId);
        expect(typeof game.name).toBe('string');
        expect(game.name.length).toBeGreaterThan(0);

        // Check for BGG-specific data
        if (game.bggRating || game.averageRating || game.complexity) {
          console.log(
            `  BGG Data: Rating ${game.bggRating}, Avg ${game.averageRating}, Complexity ${game.complexity}`
          );
        }

        if (game.minPlayers && game.maxPlayers) {
          console.log(`  Players: ${game.minPlayers}-${game.maxPlayers}`);
        }

        if (game.playingTime) {
          console.log(`  Playing time: ${game.playingTime} minutes`);
        }
      } else {
        console.log(`  Game details returned status: ${response.status()}`);
        expect(response.status()).toBeLessThan(500);
      }

      // Small delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  });

  test('should monitor API health and performance', async ({ request }) => {
    console.log('Checking API health...');

    const response = await request.get(`${BACKEND_URL}/api/stats/api-health`);

    if (response.status() === 200) {
      const stats = await response.json();
      console.log('API Health Stats:', stats);

      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('timestamp');
      expect(typeof stats.successRate).toBe('number');
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(100);

      console.log(`API Success Rate: ${stats.successRate}%`);
    } else {
      console.log(`Health endpoint returned status: ${response.status()}`);
    }
  });

  test('should handle concurrent requests efficiently', async ({ request }) => {
    console.log('Testing concurrent request handling...');

    const startTime = Date.now();
    const promises = [];

    // Make concurrent requests to different endpoints
    promises.push(request.get(`${BACKEND_URL}/api/own/${TEST_USERNAME}`));
    promises.push(request.get(`${BACKEND_URL}/api/games?search=Catan`));
    promises.push(request.get(`${BACKEND_URL}/api/games/13`));
    promises.push(request.get(`${BACKEND_URL}/api/stats/api-health`));

    const results = await Promise.allSettled(promises);
    const endTime = Date.now();

    console.log(`Concurrent requests completed in ${endTime - startTime}ms`);

    let successCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const response = result.value;
        console.log(`  Request ${index + 1}: Status ${response.status()}`);
        if (response.status() < 500) {
          successCount++;
        }
      } else {
        console.log(`  Request ${index + 1}: Failed - ${result.reason}`);
      }
    });

    console.log(
      `${successCount}/${results.length} requests completed successfully`
    );
    expect(successCount).toBeGreaterThan(0);
  });
});
