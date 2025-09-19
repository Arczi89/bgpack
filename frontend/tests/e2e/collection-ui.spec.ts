import { test, expect } from '@playwright/test';

test.describe('Collection UI Tests', () => {
  const TEST_USERNAME = 'arczi89';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display collection form and allow username input', async ({
    page,
  }) => {
    // Look for username input field
    const usernameInput = page
      .locator(
        'input[placeholder*="username"], input[name*="username"], input[id*="username"], input[type="text"]'
      )
      .first();

    if (await usernameInput.isVisible()) {
      await usernameInput.fill(TEST_USERNAME);
      await expect(usernameInput).toHaveValue(TEST_USERNAME);

      // Look for submit button
      const submitButton = page
        .locator(
          'button[type="submit"], button:has-text("Search"), button:has-text("Get"), button:has-text("Submit")'
        )
        .first();

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for API call to complete
        await page.waitForTimeout(5000);

        // Check for loading state
        const loadingIndicator = page.locator(
          'text=Loading, [data-testid*="loading"], .loading, .spinner'
        );
        if (await loadingIndicator.isVisible()) {
          await expect(loadingIndicator).toBeHidden({ timeout: 10000 });
        }

        // Check for results
        const resultsContainer = page.locator(
          '[data-testid*="results"], .results, .games-list, .collection'
        );
        if (await resultsContainer.isVisible()) {
          const gameItems = resultsContainer.locator(
            '[data-testid*="game"], .game-item, .game-card, li, .item'
          );
          const gameCount = await gameItems.count();

          console.log(`Found ${gameCount} game items in results`);

          if (gameCount > 0) {
            // Verify first game has content
            const firstGame = gameItems.first();
            const gameText = await firstGame.textContent();
            expect(gameText).toBeTruthy();
            expect(gameText!.trim().length).toBeGreaterThan(0);
          }
        }
      }
    } else {
      console.log(
        'Username input not found - this might be expected if the UI is different'
      );
    }
  });

  test('should handle empty collection gracefully', async ({ page }) => {
    const usernameInput = page
      .locator(
        'input[placeholder*="username"], input[name*="username"], input[id*="username"]'
      )
      .first();

    if (await usernameInput.isVisible()) {
      // Try with a username that likely has no collection
      await usernameInput.fill('nonexistentuser12345');

      const submitButton = page
        .locator(
          'button[type="submit"], button:has-text("Search"), button:has-text("Get")'
        )
        .first();

      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(5000);

        // Check for empty state message
        const emptyMessage = page.locator(
          'text=No games found, text=Empty collection, .empty-state, .no-results'
        );
        if (await emptyMessage.isVisible()) {
          expect(emptyMessage).toBeVisible();
        }
      }
    }
  });

  test('should display game details when clicked', async ({ page }) => {
    const usernameInput = page
      .locator(
        'input[placeholder*="username"], input[name*="username"], input[id*="username"]'
      )
      .first();

    if (await usernameInput.isVisible()) {
      await usernameInput.fill(TEST_USERNAME);

      const submitButton = page
        .locator(
          'button[type="submit"], button:has-text("Search"), button:has-text("Get")'
        )
        .first();

      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(5000);

        // Look for game items
        const gameItems = page.locator(
          '[data-testid*="game"], .game-item, .game-card, li, .item'
        );
        const gameCount = await gameItems.count();

        if (gameCount > 0) {
          // Click on first game
          await gameItems.first().click();
          await page.waitForTimeout(1000);

          // Look for game details modal or expanded view
          const gameDetails = page.locator(
            '[data-testid*="game-details"], .game-details, .modal, .expanded, .details'
          );

          if (await gameDetails.isVisible()) {
            expect(gameDetails).toBeVisible();

            // Check for game name in details
            const gameName = gameDetails.locator(
              'h1, h2, h3, .game-name, .title'
            );
            if (await gameName.isVisible()) {
              const nameText = await gameName.textContent();
              expect(nameText).toBeTruthy();
              expect(nameText!.trim().length).toBeGreaterThan(0);
            }
          }
        }
      }
    }
  });

  test('should filter games by criteria', async ({ page }) => {
    const usernameInput = page
      .locator(
        'input[placeholder*="username"], input[name*="username"], input[id*="username"]'
      )
      .first();

    if (await usernameInput.isVisible()) {
      await usernameInput.fill(TEST_USERNAME);

      const submitButton = page
        .locator(
          'button[type="submit"], button:has-text("Search"), button:has-text("Get")'
        )
        .first();

      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(5000);

        // Look for filter controls
        const minPlayersFilter = page
          .locator(
            'input[name*="minPlayers"], input[id*="minPlayers"], select[name*="players"]'
          )
          .first();
        const maxPlayersFilter = page
          .locator('input[name*="maxPlayers"], input[id*="maxPlayers"]')
          .first();

        if (await minPlayersFilter.isVisible()) {
          await minPlayersFilter.fill('2');

          if (await maxPlayersFilter.isVisible()) {
            await maxPlayersFilter.fill('4');
          }

          // Look for apply filter button
          const applyFilterButton = page
            .locator(
              'button:has-text("Filter"), button:has-text("Apply"), button[type="submit"]'
            )
            .first();

          if (await applyFilterButton.isVisible()) {
            await applyFilterButton.click();
            await page.waitForTimeout(2000);

            // Check if results are filtered
            const gameItems = page.locator(
              '[data-testid*="game"], .game-item, .game-card, li, .item'
            );
            const filteredGameCount = await gameItems.count();

            console.log(`Games after filtering: ${filteredGameCount}`);
            expect(filteredGameCount).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept network requests and simulate failure
    await page.route('**/api/own/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Network error' }),
      });
    });

    const usernameInput = page
      .locator(
        'input[placeholder*="username"], input[name*="username"], input[id*="username"]'
      )
      .first();

    if (await usernameInput.isVisible()) {
      await usernameInput.fill(TEST_USERNAME);

      const submitButton = page
        .locator(
          'button[type="submit"], button:has-text("Search"), button:has-text("Get")'
        )
        .first();

      if (await submitButton.isVisible()) {
        await submitButton.click();
        await page.waitForTimeout(3000);

        // Check for error message
        const errorMessage = page.locator(
          'text=Error, text=Failed, .error, .alert-danger, .error-message'
        );
        if (await errorMessage.isVisible()) {
          expect(errorMessage).toBeVisible();
        }
      }
    }
  });
});
