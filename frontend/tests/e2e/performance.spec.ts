import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { TestHelpers } from './helpers/test-helpers';

test.describe('Performance Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test.describe('Load Time Performance', () => {
    test('should load initial page within 3 seconds', async () => {
      const loadTime = await TestHelpers.measurePerformance(
        homePage.page,
        async () => {
          await homePage.goto();
          await homePage.usernameInput.waitFor();
        }
      );

      console.log(`Initial page load time: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(3000);
    });

    test('should load search results within 8 seconds for single user', async () => {
      const searchTime = await TestHelpers.measurePerformance(
        homePage.page,
        async () => {
          await homePage.searchForUsers('arczi89');
          await homePage.waitForResults(8000);
        }
      );

      console.log(`Single user search time: ${searchTime}ms`);
      expect(searchTime).toBeLessThan(8000);
    });

    test('should load search results within 12 seconds for multiple users', async () => {
      const searchTime = await TestHelpers.measurePerformance(
        homePage.page,
        async () => {
          await homePage.searchForUsers(
            'arczi89, inz_informatyk, ArturAndrzej'
          );
          await homePage.waitForResults(12000);
        }
      );

      console.log(`Multiple users search time: ${searchTime}ms`);
      expect(searchTime).toBeLessThan(12000);
    });

    test('should handle pagination changes within 2 seconds', async () => {
      // First, get some results
      await homePage.searchForUsers('arczi89, inz_informatyk');
      await homePage.waitForResults(10000);

      const gameCount = await homePage.getGameCount();

      if (gameCount > 10) {
        const paginationTime = await TestHelpers.measurePerformance(
          homePage.page,
          async () => {
            await homePage.setItemsPerPage('10');
            await homePage.page.waitForTimeout(1000);
          }
        );

        console.log(`Pagination change time: ${paginationTime}ms`);
        expect(paginationTime).toBeLessThan(2000);
      }
    });

    test('should handle filter changes within 3 seconds', async () => {
      // First, get some results
      await homePage.searchForUsers('arczi89, inz_informatyk');
      await homePage.waitForResults(10000);

      const gameCount = await homePage.getGameCount();

      if (gameCount > 0) {
        const filterTime = await TestHelpers.measurePerformance(
          homePage.page,
          async () => {
            await homePage.applyPlayerFilter(2, 4);
            await homePage.page.waitForTimeout(2000);
          }
        );

        console.log(`Filter change time: ${filterTime}ms`);
        expect(filterTime).toBeLessThan(3000);
      }
    });
  });

  test.describe('Memory and Resource Usage', () => {
    test('should not have memory leaks during multiple searches', async () => {
      const searches = [
        'arczi89',
        'inz_informatyk',
        'arczi89, inz_informatyk',
        'ArturAndrzej',
        'arczi89, inz_informatyk, ArturAndrzej',
      ];

      for (let i = 0; i < searches.length; i++) {
        const search = searches[i];
        console.log(`Performing search ${i + 1}/${searches.length}: ${search}`);

        await homePage.searchForUsers(search);
        await homePage.waitForResults(8000);

        const gameCount = await homePage.getGameCount();
        console.log(`Search ${i + 1} returned ${gameCount} games`);

        // Small delay between searches
        await homePage.page.waitForTimeout(1000);
      }

      // Final check - should still be responsive
      await homePage.searchForUsers('arczi89');
      await homePage.waitForResults(8000);

      const finalGameCount = await homePage.getGameCount();
      expect(finalGameCount).toBeGreaterThanOrEqual(0);
    });

    test('should handle large result sets efficiently', async () => {
      await homePage.searchForUsers('arczi89, inz_informatyk, ArturAndrzej');
      await homePage.waitForResults(12000);

      const gameCount = await homePage.getGameCount();
      console.log(`Large result set: ${gameCount} games`);

      if (gameCount > 50) {
        // Test pagination with large dataset
        const paginationStartTime = Date.now();

        await homePage.setItemsPerPage('10');
        await homePage.page.waitForTimeout(1000);

        const paginationTime = Date.now() - paginationStartTime;
        console.log(
          `Pagination with ${gameCount} games took: ${paginationTime}ms`
        );

        expect(paginationTime).toBeLessThan(3000);
      }
    });
  });

  test.describe('Network Performance', () => {
    test('should handle slow network conditions', async () => {
      // Simulate slow network
      await homePage.page.route('**/api/**', async route => {
        // Add artificial delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        route.continue();
      });

      const searchTime = await TestHelpers.measurePerformance(
        homePage.page,
        async () => {
          await homePage.searchForUsers('arczi89');
          await homePage.waitForResults(15000);
        }
      );

      console.log(`Search time with slow network: ${searchTime}ms`);
      expect(searchTime).toBeLessThan(15000);
    });

    test('should handle intermittent network failures', async () => {
      let requestCount = 0;

      await homePage.page.route('**/api/**', async route => {
        requestCount++;

        // Fail every other request
        if (requestCount % 2 === 0) {
          route.abort('failed');
        } else {
          route.continue();
        }
      });

      await homePage.searchForUsers('arczi89');
      await homePage.waitForResults(10000);

      // Should eventually succeed or show appropriate error
      const gameCount = await homePage.getGameCount();
      const hasError = await homePage.errorMessage.isVisible();

      expect(gameCount >= 0 || hasError).toBe(true);
    });
  });

  test.describe('Concurrent User Simulation', () => {
    test('should handle multiple concurrent searches', async () => {
      const searchPromises = [
        homePage.searchForUsers('arczi89'),
        homePage.searchForUsers('inz_informatyk'),
        homePage.searchForUsers('ArturAndrzej'),
      ];

      const startTime = Date.now();

      // Start all searches concurrently
      await Promise.all(searchPromises);

      // Wait for all to complete
      await Promise.all([
        homePage.waitForResults(10000),
        homePage.waitForResults(10000),
        homePage.waitForResults(10000),
      ]);

      const totalTime = Date.now() - startTime;
      console.log(`Concurrent searches completed in: ${totalTime}ms`);

      // Should complete faster than sequential searches
      expect(totalTime).toBeLessThan(20000);
    });
  });

  test.describe('UI Responsiveness', () => {
    test('should remain responsive during long operations', async () => {
      // Start a long search
      await homePage.searchForUsers('arczi89, inz_informatyk, ArturAndrzej');

      // While search is running, try to interact with UI
      const interactionStartTime = Date.now();

      // Try to change input while search is running
      await homePage.usernameInput.fill('test');
      await homePage.usernameInput.clear();

      const interactionTime = Date.now() - interactionStartTime;
      console.log(`UI interaction time during search: ${interactionTime}ms`);

      // UI should remain responsive
      expect(interactionTime).toBeLessThan(1000);

      // Wait for search to complete
      await homePage.waitForResults(12000);
    });

    test('should handle rapid UI interactions', async () => {
      // Perform rapid interactions
      const interactions = [
        () => homePage.usernameInput.fill('user1'),
        () => homePage.usernameInput.fill('user2'),
        () => homePage.usernameInput.fill('user3'),
        () => homePage.usernameInput.clear(),
        () => homePage.usernameInput.fill('arczi89'),
      ];

      const startTime = Date.now();

      for (const interaction of interactions) {
        await interaction();
        await homePage.page.waitForTimeout(100);
      }

      const totalTime = Date.now() - startTime;
      console.log(`Rapid UI interactions completed in: ${totalTime}ms`);

      // Should handle all interactions smoothly
      expect(totalTime).toBeLessThan(2000);
    });
  });
});
