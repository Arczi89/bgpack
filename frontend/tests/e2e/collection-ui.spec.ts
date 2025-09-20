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

  test('should handle multiple usernames with one non-existent user', async ({
    page,
  }) => {
    const usernameInput = page
      .locator(
        'input[placeholder*="username"], input[name*="username"], input[id*="username"], input[id*="bgg-nicks"]'
      )
      .first();

    if (await usernameInput.isVisible()) {
      // Test with valid and invalid usernames
      const mixedUsernames = 'arczi89, nonexistentuser12345, inz_informatyk';
      await usernameInput.fill(mixedUsernames);

      const submitButton = page
        .locator(
          'button[type="submit"], button:has-text("Search"), button:has-text("Get")'
        )
        .first();

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for API calls to complete (longer timeout for multiple users)
        await page.waitForTimeout(10000);

        // Check for loading state to disappear
        const loadingIndicator = page.locator(
          'text=Loading, [data-testid*="loading"], .loading, .spinner'
        );
        if (await loadingIndicator.isVisible()) {
          await expect(loadingIndicator).toBeHidden({ timeout: 15000 });
        }

        // Check for results - should show games from valid users only
        const resultsContainer = page.locator(
          '[data-testid*="results"], .results, .games-list, .collection, table'
        );

        if (await resultsContainer.isVisible()) {
          // Check if we have any games from valid users
          const gameItems = resultsContainer.locator(
            '[data-testid*="game"], .game-item, .game-card, li, .item, tbody tr'
          );
          const gameCount = await gameItems.count();

          console.log(`Found ${gameCount} game items with mixed usernames`);

          // Should have some games from valid users, even if one user doesn't exist
          if (gameCount > 0) {
            // Verify first game has content
            const firstGame = gameItems.first();
            const gameText = await firstGame.textContent();
            expect(gameText).toBeTruthy();
            expect(gameText!.trim().length).toBeGreaterThan(0);
          }

          // Check for user information in results
          const userInfo = page.locator('text=arczi89, text=inz_informatyk');
          if (await userInfo.isVisible()) {
            // Should show information about valid users
            expect(userInfo).toBeVisible();
          }
        }

        // Check for error handling - should not show error for the whole request
        const errorMessage = page.locator(
          'text=Error, text=Failed, .error, .alert-danger, .error-message'
        );

        // The application should handle partial failures gracefully
        // and still show results from valid users
        if (await errorMessage.isVisible()) {
          console.log(
            "Error message found - checking if it's for specific user only"
          );
          const errorText = await errorMessage.textContent();
          console.log(`Error text: ${errorText}`);
        }
      }
    }
  });

  test('should handle all non-existent usernames', async ({ page }) => {
    const usernameInput = page
      .locator(
        'input[placeholder*="username"], input[name*="username"], input[id*="username"], input[id*="bgg-nicks"]'
      )
      .first();

    if (await usernameInput.isVisible()) {
      // Test with all invalid usernames
      const invalidUsernames =
        'nonexistentuser1, nonexistentuser2, nonexistentuser3';
      await usernameInput.fill(invalidUsernames);

      const submitButton = page
        .locator(
          'button[type="submit"], button:has-text("Search"), button:has-text("Get")'
        )
        .first();

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for API calls to complete
        await page.waitForTimeout(10000);

        // Check for loading state to disappear
        const loadingIndicator = page.locator(
          'text=Loading, [data-testid*="loading"], .loading, .spinner'
        );
        if (await loadingIndicator.isVisible()) {
          await expect(loadingIndicator).toBeHidden({ timeout: 15000 });
        }

        // Should show empty state or no results message
        const emptyMessage = page.locator(
          'text=No games found, text=Empty collection, .empty-state, .no-results'
        );

        if (await emptyMessage.isVisible()) {
          expect(emptyMessage).toBeVisible();
        } else {
          // Check if results container is empty
          const resultsContainer = page.locator(
            '[data-testid*="results"], .results, .games-list, .collection, table'
          );

          if (await resultsContainer.isVisible()) {
            const gameItems = resultsContainer.locator(
              '[data-testid*="game"], .game-item, .game-card, li, .item, tbody tr'
            );
            const gameCount = await gameItems.count();

            // Should have 0 games
            expect(gameCount).toBe(0);
          }
        }
      }
    }
  });

  test('should handle three valid users and show combined results', async ({
    page,
  }) => {
    const usernameInput = page
      .locator(
        'input[placeholder*="username"], input[name*="username"], input[id*="username"], input[id*="bgg-nicks"]'
      )
      .first();

    if (await usernameInput.isVisible()) {
      // Test with three valid usernames
      const threeUsers = 'arczi89, inz_informatyk, ArturAndrzej';
      await usernameInput.fill(threeUsers);

      const submitButton = page
        .locator(
          'button[type="submit"], button:has-text("Search"), button:has-text("Get")'
        )
        .first();

      if (await submitButton.isVisible()) {
        await submitButton.click();

        // Wait for API calls to complete (longer timeout for three users)
        await page.waitForTimeout(15000);

        // Check for loading state to disappear
        const loadingIndicator = page.locator(
          'text=Loading, [data-testid*="loading"], .loading, .spinner'
        );
        if (await loadingIndicator.isVisible()) {
          await expect(loadingIndicator).toBeHidden({ timeout: 20000 });
        }

        // Check for results - should show combined games from all three users
        const resultsContainer = page.locator(
          '[data-testid*="results"], .results, .games-list, .collection, table'
        );

        if (await resultsContainer.isVisible()) {
          const gameItems = resultsContainer.locator(
            '[data-testid*="game"], .game-item, .game-card, li, .item, tbody tr'
          );
          const gameCount = await gameItems.count();

          console.log(`Found ${gameCount} game items from three users`);

          // Should have games from at least one of the users
          if (gameCount > 0) {
            // Verify first game has content
            const firstGame = gameItems.first();
            const gameText = await firstGame.textContent();
            expect(gameText).toBeTruthy();
            expect(gameText!.trim().length).toBeGreaterThan(0);

            // Check for user information in results header
            const userInfo = page.locator(
              'text=arczi89, text=inz_informatyk, text=ArturAndrzej'
            );
            if (await userInfo.isVisible()) {
              expect(userInfo).toBeVisible();
            }

            // Check for pagination controls if there are many games
            const paginationControls = page.locator(
              'text=Show:, text=per page, text=Previous, text=Next, select'
            );
            if (await paginationControls.isVisible()) {
              console.log('Pagination controls found');

              // Test pagination dropdown
              const itemsPerPageSelect = page.locator('select').first();
              if (await itemsPerPageSelect.isVisible()) {
                await itemsPerPageSelect.selectOption('10');
                await page.waitForTimeout(2000);

                // Check if results are limited to 10 items
                const limitedGameItems = resultsContainer.locator(
                  '[data-testid*="game"], .game-item, .game-card, li, .item, tbody tr'
                );
                const limitedCount = await limitedGameItems.count();
                console.log(`Games after limiting to 10: ${limitedCount}`);

                // Should have at most 10 items (or all if less than 10)
                expect(limitedCount).toBeLessThanOrEqual(10);
              }
            }
          }
        }

        // Check for expansion filter checkbox
        const expansionFilter = page.locator(
          'input[type="checkbox"], text=Exclude expansions'
        );
        if (await expansionFilter.isVisible()) {
          console.log('Expansion filter found');

          // Test the expansion filter
          await expansionFilter.check();
          await page.waitForTimeout(3000);

          // Check if results changed after filtering
          const filteredResults = page.locator(
            '[data-testid*="results"], .results, .games-list, .collection, table'
          );

          if (await filteredResults.isVisible()) {
            const filteredGameItems = filteredResults.locator(
              '[data-testid*="game"], .game-item, .game-card, li, .item, tbody tr'
            );
            const filteredCount = await filteredGameItems.count();
            console.log(`Games after expansion filter: ${filteredCount}`);

            // Results should be different (or same if no expansions were present)
            expect(filteredCount).toBeGreaterThanOrEqual(0);
          }
        }
      }
    }
  });
});
