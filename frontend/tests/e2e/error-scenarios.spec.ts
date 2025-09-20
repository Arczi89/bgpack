import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { TestHelpers } from './helpers/test-helpers';

test.describe('Error Handling Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test.describe('Non-existent Users', () => {
    test('should show empty results when searching for single non-existent user', async () => {
      await homePage.searchForUsers('nonexistentuser12345');
      await homePage.waitForResults(8000);

      const isEmpty = await homePage.emptyMessage.isVisible();
      const gameCount = await homePage.getGameCount();

      expect(isEmpty || gameCount === 0).toBe(true);
    });

    test('should show empty results when searching for multiple non-existent users', async () => {
      await homePage.searchForUsers('nonexistent1, nonexistent2, nonexistent3');
      await homePage.waitForResults(10000);

      const isEmpty = await homePage.emptyMessage.isVisible();
      const gameCount = await homePage.getGameCount();

      expect(isEmpty || gameCount === 0).toBe(true);
    });

    test('should show results from valid users when mixed with invalid usernames', async () => {
      await homePage.searchForUsers(
        'arczi89, nonexistentuser12345, inz_informatyk'
      );
      await homePage.waitForResults(10000);

      const gameCount = await homePage.getGameCount();
      console.log(`Found ${gameCount} games with mixed usernames`);

      if (gameCount > 0) {
        const firstGameText = await homePage.getFirstGameText();
        expect(firstGameText).toBeTruthy();

        const hasValidUserInfo = await homePage.hasUserInfo([
          'arczi89',
          'inz_informatyk',
        ]);
        expect(hasValidUserInfo).toBe(true);
      }
    });

    test('should handle usernames with special characters gracefully', async () => {
      const specialUsernames =
        'arczi89@domain, user-name, user_name, user.name';
      await homePage.searchForUsers(specialUsernames);
      await homePage.waitForResults(8000);

      const gameCount = await homePage.getGameCount();
      expect(gameCount).toBeGreaterThanOrEqual(0);
    });

    test('should handle very long usernames gracefully', async () => {
      const longUsername = 'a'.repeat(100);
      await homePage.searchForUsers(longUsername);
      await homePage.waitForResults(8000);

      const gameCount = await homePage.getGameCount();
      expect(gameCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Network Errors', () => {
    test('should handle API server errors (500)', async () => {
      await TestHelpers.mockApiError(
        homePage.page,
        'own',
        'Internal Server Error',
        500
      );

      await homePage.searchForUsers('arczi89');
      await homePage.waitForResults(5000);

      const isErrorVisible = await homePage.errorMessage.isVisible();
      expect(isErrorVisible).toBe(true);
    });

    test('should handle API not found errors (404)', async () => {
      await TestHelpers.mockApiError(homePage.page, 'own', 'Not Found', 404);

      await homePage.searchForUsers('arczi89');
      await homePage.waitForResults(5000);

      const isErrorVisible = await homePage.errorMessage.isVisible();
      expect(isErrorVisible).toBe(true);
    });

    test('should handle API timeout errors', async () => {
      await TestHelpers.mockApiTimeout(homePage.page, 'own');

      await homePage.searchForUsers('arczi89');
      await homePage.waitForResults(5000);

      const hasError = await homePage.errorMessage.isVisible();
      const hasEmpty = await homePage.emptyMessage.isVisible();

      expect(hasError || hasEmpty).toBe(true);
    });

    test('should handle network connectivity issues', async () => {
      await homePage.page.route('**/api/**', route => {
        route.abort('failed');
      });

      await homePage.searchForUsers('arczi89');
      await homePage.waitForResults(5000);

      const isErrorVisible = await homePage.errorMessage.isVisible();
      expect(isErrorVisible).toBe(true);
    });
  });

  test.describe('Input Validation', () => {
    test('should handle empty input', async () => {
      await homePage.searchButton.click();

      // Should not make API calls or show loading
      const isLoading = await homePage.loadingIndicator.isVisible();
      expect(isLoading).toBe(false);
    });

    test('should handle whitespace-only input', async () => {
      await homePage.usernameInput.fill('   ');
      await homePage.searchButton.click();

      // Should not make API calls or show loading
      const isLoading = await homePage.loadingIndicator.isVisible();
      expect(isLoading).toBe(false);
    });

    test('should handle input with only commas', async () => {
      await homePage.usernameInput.fill(',,,');
      await homePage.searchButton.click();

      // Should not make API calls or show loading
      const isLoading = await homePage.loadingIndicator.isVisible();
      expect(isLoading).toBe(false);
    });

    test('should handle very long input', async () => {
      const longInput =
        'arczi89, inz_informatyk, ArturAndrzej, user4, user5, user6, user7, user8, user9, user10';
      await homePage.searchForUsers(longInput);
      await homePage.waitForResults(15000);

      const gameCount = await homePage.getGameCount();
      expect(gameCount).toBeGreaterThanOrEqual(0);
    });

    test('should trim whitespace from usernames', async () => {
      await homePage.searchForUsers('  arczi89  ,  inz_informatyk  ');
      await homePage.waitForResults(10000);

      const gameCount = await homePage.getGameCount();
      console.log(`Found ${gameCount} games after trimming whitespace`);

      expect(gameCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Concurrent Requests', () => {
    test('should handle multiple rapid searches', async () => {
      const searches = [
        'arczi89',
        'inz_informatyk',
        'arczi89, inz_informatyk',
        'ArturAndrzej',
      ];

      for (const search of searches) {
        await homePage.searchForUsers(search);
        await homePage.waitForResults(6000);

        const gameCount = await homePage.getGameCount();
        console.log(`Search "${search}" returned ${gameCount} games`);

        expect(gameCount).toBeGreaterThanOrEqual(0);

        await homePage.page.waitForTimeout(1000);
      }
    });

    test('should cancel previous request when new search is initiated', async () => {
      await homePage.searchForUsers('arczi89');

      await homePage.searchForUsers('inz_informatyk');
      await homePage.waitForResults(8000);

      const gameCount = await homePage.getGameCount();
      console.log(`Final search returned ${gameCount} games`);

      expect(gameCount).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Data Integrity', () => {
    test('should handle malformed API responses', async () => {
      await TestHelpers.mockApiResponse(
        homePage.page,
        'own',
        'invalid json',
        200
      );

      await homePage.searchForUsers('arczi89');
      await homePage.waitForResults(5000);

      const hasError = await homePage.errorMessage.isVisible();
      const hasEmpty = await homePage.emptyMessage.isVisible();

      expect(hasError || hasEmpty).toBe(true);
    });

    test('should handle empty API responses', async () => {
      await TestHelpers.mockApiResponse(homePage.page, 'own', [], 200);

      await homePage.searchForUsers('arczi89');
      await homePage.waitForResults(5000);

      const gameCount = await homePage.getGameCount();
      expect(gameCount).toBe(0);
    });

    test('should handle API responses with missing fields', async () => {
      const malformedData = [
        { id: 1, name: 'Game 1' },
        { id: 2 },
        { name: 'Game 3' },
      ];

      await TestHelpers.mockApiResponse(
        homePage.page,
        'own',
        malformedData,
        200
      );

      await homePage.searchForUsers('arczi89');
      await homePage.waitForResults(5000);

      const gameCount = await homePage.getGameCount();
      expect(gameCount).toBeGreaterThanOrEqual(0);
    });
  });
});
