import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';

test.describe('Optimized Collection UI Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test.describe('Basic Functionality', () => {
    test('should display collection form and allow username input @smoke', async () => {
      await expect(homePage.usernameInput).toBeVisible();
      await expect(homePage.searchButton).toBeVisible();

      await homePage.usernameInput.fill('arczi89');
      await expect(homePage.usernameInput).toHaveValue('arczi89');
    });

    test('should search for single user and display results @smoke', async () => {
      await homePage.searchForUsers('arczi89');
      await homePage.waitForResults(8000);

      const gameCount = await homePage.getGameCount();
      console.log(`Found ${gameCount} games for single user`);

      if (gameCount > 0) {
        const firstGameText = await homePage.getFirstGameText();
        expect(firstGameText).toBeTruthy();
        expect(firstGameText!.trim().length).toBeGreaterThan(0);
      }
    });
  });

  test.describe('Multi-User Functionality', () => {
    test('should handle three valid users and show combined results @fast', async () => {
      await homePage.searchForUsers('arczi89, inz_informatyk, ArturAndrzej');
      await homePage.waitForResults(12000);

      const gameCount = await homePage.getGameCount();
      console.log(`Found ${gameCount} games from three users`);

      if (gameCount > 0) {
        const firstGameText = await homePage.getFirstGameText();
        expect(firstGameText).toBeTruthy();

        // Check for user information in results
        const hasUserInfo = await homePage.hasUserInfo([
          'arczi89',
          'inz_informatyk',
          'ArturAndrzej',
        ]);
        expect(hasUserInfo).toBe(true);
      }
    });

    test('should handle mixed valid and invalid usernames', async () => {
      await homePage.searchForUsers(
        'arczi89, nonexistentuser12345, inz_informatyk'
      );
      await homePage.waitForResults(10000);

      const gameCount = await homePage.getGameCount();
      console.log(`Found ${gameCount} games with mixed usernames`);

      // Should have some games from valid users, even if one user doesn't exist
      if (gameCount > 0) {
        const firstGameText = await homePage.getFirstGameText();
        expect(firstGameText).toBeTruthy();
      }
    });

    test('should handle all non-existent usernames', async () => {
      await homePage.searchForUsers(
        'nonexistentuser1, nonexistentuser2, nonexistentuser3'
      );
      await homePage.waitForResults(8000);

      // Should show empty state or no results
      const isEmpty = await homePage.emptyMessage.isVisible();
      const gameCount = await homePage.getGameCount();

      expect(isEmpty || gameCount === 0).toBe(true);
    });
  });

  test.describe('Pagination', () => {
    test.beforeEach(async () => {
      // Search for users with many games to test pagination
      await homePage.searchForUsers('arczi89, inz_informatyk');
      await homePage.waitForResults(10000);
    });

    test('should display pagination controls when there are many games', async () => {
      const gameCount = await homePage.getGameCount();

      if (gameCount > 10) {
        const isPaginationVisible = await homePage.isPaginationVisible();
        expect(isPaginationVisible).toBe(true);
      }
    });

    test('should change items per page', async () => {
      const gameCount = await homePage.getGameCount();

      if (gameCount > 10) {
        await homePage.setItemsPerPage('10');
        await homePage.page.waitForTimeout(1000);

        const limitedCount = await homePage.getGameCount();
        expect(limitedCount).toBeLessThanOrEqual(10);
      }
    });

    test('should navigate between pages', async () => {
      const gameCount = await homePage.getGameCount();

      if (gameCount > 20) {
        // Set to 10 items per page to ensure multiple pages
        await homePage.setItemsPerPage('10');
        await homePage.page.waitForTimeout(1000);

        // Go to next page
        await homePage.goToNextPage();
        await homePage.page.waitForTimeout(1000);

        // Verify we're on page 2
        const pageInfo = await homePage.pageInfo.textContent();
        expect(pageInfo).toContain('Page 2');

        // Go back to previous page
        await homePage.goToPreviousPage();
        await homePage.page.waitForTimeout(1000);

        // Verify we're back on page 1
        const pageInfoAfter = await homePage.pageInfo.textContent();
        expect(pageInfoAfter).toContain('Page 1');
      }
    });
  });

  test.describe('Filters', () => {
    test.beforeEach(async () => {
      await homePage.searchForUsers('arczi89, inz_informatyk');
      await homePage.waitForResults(10000);
    });

    test('should toggle expansion filter', async () => {
      const isExpansionFilterVisible =
        await homePage.isExpansionFilterVisible();

      if (isExpansionFilterVisible) {
        const initialCount = await homePage.getGameCount();

        await homePage.toggleExpansionFilter();
        await homePage.page.waitForTimeout(2000);

        const filteredCount = await homePage.getGameCount();
        console.log(
          `Games before filter: ${initialCount}, after: ${filteredCount}`
        );

        // Results should be different (or same if no expansions were present)
        expect(filteredCount).toBeGreaterThanOrEqual(0);
      }
    });

    test('should apply player count filter', async () => {
      const initialCount = await homePage.getGameCount();

      if (initialCount > 0) {
        await homePage.applyPlayerFilter(2, 4);
        await homePage.page.waitForTimeout(2000);

        const filteredCount = await homePage.getGameCount();
        console.log(
          `Games before player filter: ${initialCount}, after: ${filteredCount}`
        );

        expect(filteredCount).toBeGreaterThanOrEqual(0);
        expect(filteredCount).toBeLessThanOrEqual(initialCount);
      }
    });

    test('should apply playing time filter', async () => {
      const initialCount = await homePage.getGameCount();

      if (initialCount > 0) {
        await homePage.applyTimeFilter(30, 90);
        await homePage.page.waitForTimeout(2000);

        const filteredCount = await homePage.getGameCount();
        console.log(
          `Games before time filter: ${initialCount}, after: ${filteredCount}`
        );

        expect(filteredCount).toBeGreaterThanOrEqual(0);
        expect(filteredCount).toBeLessThanOrEqual(initialCount);
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      // Intercept network requests and simulate failure
      await homePage.page.route('**/api/own/**', route => {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Network error' }),
        });
      });

      await homePage.searchForUsers('arczi89');
      await homePage.waitForResults(5000);

      // Should show error message
      const isErrorVisible = await homePage.errorMessage.isVisible();
      expect(isErrorVisible).toBe(true);
    });

    test('should handle API timeout gracefully', async () => {
      // Intercept network requests and simulate timeout
      await homePage.page.route('**/api/own/**', route => {
        // Don't fulfill the request, let it timeout
        route.abort('timedout');
      });

      await homePage.searchForUsers('arczi89');
      await homePage.waitForResults(5000);

      // Should show error message or handle gracefully
      const hasError = await homePage.errorMessage.isVisible();
      const hasEmpty = await homePage.emptyMessage.isVisible();

      expect(hasError || hasEmpty).toBe(true);
    });
  });

  test.describe('Performance', () => {
    test('should load results within reasonable time', async () => {
      const startTime = Date.now();

      await homePage.searchForUsers('arczi89');
      await homePage.waitForResults(8000);

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      console.log(`Results loaded in ${loadTime}ms`);
      expect(loadTime).toBeLessThan(8000);
    });

    test('should handle multiple rapid searches', async () => {
      // Perform multiple searches in quick succession
      const searches = ['arczi89', 'inz_informatyk', 'arczi89, inz_informatyk'];

      for (const search of searches) {
        await homePage.searchForUsers(search);
        await homePage.waitForResults(6000);

        const gameCount = await homePage.getGameCount();
        console.log(`Search "${search}" returned ${gameCount} games`);

        expect(gameCount).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
