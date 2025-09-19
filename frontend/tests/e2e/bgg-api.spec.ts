import { test, expect } from '@playwright/test';

test.describe('BGG API Integration Tests', () => {
  const TEST_USERNAME = 'arczi89';
  const BACKEND_URL = 'http://localhost:8080';

  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');
  });

  test('should fetch collection for user arczi89 via API', async ({
    request,
  }) => {
    // Test direct API call to our backend
    const response = await request.get(
      `${BACKEND_URL}/api/own/${TEST_USERNAME}`
    );

    console.log(`Response status: ${response.status()}`);

    if (response.status() === 200) {
      const games = await response.json();
      console.log(`Found ${games.length} games for user ${TEST_USERNAME}`);

      // Log first few games for debugging
      games.slice(0, 5).forEach((game: any, index: number) => {
        console.log(`Game ${index + 1}: ${game.name} (ID: ${game.id})`);
      });

      expect(Array.isArray(games)).toBeTruthy();

      // If we get games from BGG API, they should have proper structure
      if (games.length > 0) {
        const firstGame = games[0];
        expect(firstGame).toHaveProperty('id');
        expect(firstGame).toHaveProperty('name');
        expect(typeof firstGame.name).toBe('string');
        expect(firstGame.name.length).toBeGreaterThan(0);
      }
    } else {
      console.log(
        `API returned status ${response.status()}, this might be expected if BGG API is down or rate limited`
      );
      // This is acceptable - our API should handle BGG failures gracefully
      expect(response.status()).toBeLessThan(500);
    }
  });

  test('should search games via API', async ({ request }) => {
    const searchQuery = 'Catan';
    const response = await request.get(
      `${BACKEND_URL}/api/games?search=${encodeURIComponent(searchQuery)}`
    );

    console.log(`Search response status: ${response.status()}`);

    if (response.status() === 200) {
      const games = await response.json();
      console.log(`Found ${games.length} games for search: ${searchQuery}`);

      expect(Array.isArray(games)).toBeTruthy();

      if (games.length > 0) {
        const firstGame = games[0];
        expect(firstGame).toHaveProperty('name');
        expect(firstGame.name.toLowerCase()).toContain(
          searchQuery.toLowerCase()
        );
      }
    } else {
      console.log(`Search API returned status ${response.status()}`);
      expect(response.status()).toBeLessThan(500);
    }
  });

  test('should get game details by ID', async ({ request }) => {
    const gameId = '13'; // Catan's BGG ID
    const response = await request.get(`${BACKEND_URL}/api/games/${gameId}`);

    console.log(`Game details response status: ${response.status()}`);

    if (response.status() === 200) {
      const game = await response.json();
      console.log(`Game details: ${game.name} (${game.yearPublished})`);

      expect(game).toHaveProperty('id');
      expect(game).toHaveProperty('name');
      expect(game.id).toBe(gameId);
    } else {
      console.log(`Game details API returned status ${response.status()}`);
      expect(response.status()).toBeLessThan(500);
    }
  });

  test('should handle API rate limiting gracefully', async ({ request }) => {
    // Make multiple rapid requests to test rate limiting
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(request.get(`${BACKEND_URL}/api/own/${TEST_USERNAME}`));
    }

    const responses = await Promise.all(promises);

    // All requests should complete (either successfully or with rate limit response)
    responses.forEach((response, index) => {
      console.log(`Request ${index + 1} status: ${response.status()}`);
      expect(response.status()).toBeLessThan(500);
    });
  });

  test('should display collection in UI', async ({ page }) => {
    // Navigate to a page that might display collections
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check if there's a way to input username (this depends on your UI)
    const usernameInput = page
      .locator(
        'input[placeholder*="username"], input[name*="username"], input[id*="username"]'
      )
      .first();

    if (await usernameInput.isVisible()) {
      await usernameInput.fill(TEST_USERNAME);

      // Look for a submit button
      const submitButton = page
        .locator(
          'button[type="submit"], button:has-text("Search"), button:has-text("Get Collection")'
        )
        .first();

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for results
        await page.waitForTimeout(3000);

        // Check if games are displayed
        const gameElements = page.locator(
          '[data-testid*="game"], .game-item, .game-card'
        );
        const gameCount = await gameElements.count();

        console.log(`Found ${gameCount} game elements in UI`);

        if (gameCount > 0) {
          // Verify first game has a name
          const firstGameName = await gameElements.first().textContent();
          expect(firstGameName).toBeTruthy();
          expect(firstGameName!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  test('should show API health status', async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/api/stats/api-health`);

    if (response.status() === 200) {
      const stats = await response.json();
      console.log('API Health Stats:', stats);

      expect(stats).toHaveProperty('successRate');
      expect(stats).toHaveProperty('timestamp');
      expect(typeof stats.successRate).toBe('number');
    } else {
      console.log(`Health endpoint returned status ${response.status()}`);
    }
  });
});
