import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly searchButton: Locator;
  readonly excludeExpansionsCheckbox: Locator;
  readonly resultsContainer: Locator;
  readonly gameItems: Locator;
  readonly loadingIndicator: Locator;
  readonly errorMessage: Locator;
  readonly emptyMessage: Locator;
  readonly paginationControls: Locator;
  readonly itemsPerPageSelect: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;
  readonly pageInfo: Locator;
  readonly minPlayersFilter: Locator;
  readonly maxPlayersFilter: Locator;
  readonly minPlayingTimeFilter: Locator;
  readonly maxPlayingTimeFilter: Locator;
  readonly minAgeFilter: Locator;
  readonly minRatingFilter: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main form elements
    this.usernameInput = page.locator('#bgg-nicks');
    this.searchButton = page.locator('button:has-text("Search")');
    this.excludeExpansionsCheckbox = page.locator('input[type="checkbox"]');

    // Results elements
    this.resultsContainer = page.locator(
      'table, .results, [data-testid*="results"]'
    );
    this.gameItems = this.resultsContainer.locator(
      'tbody tr, [data-testid*="game"], .game-item'
    );
    this.loadingIndicator = page.locator('text=Loading, .loading, .spinner');
    this.errorMessage = page.locator('text=Error, .error, .alert-danger');
    this.emptyMessage = page.locator(
      'text=No games found, .empty-state, .no-results'
    );

    // Pagination elements
    this.paginationControls = page.locator(
      'text=Show:, text=per page, text=Previous, text=Next'
    );
    this.itemsPerPageSelect = page.locator('select').first();
    this.previousButton = page.locator('button:has-text("Previous")');
    this.nextButton = page.locator('button:has-text("Next")');
    this.pageInfo = page.locator('text=Page');

    // Filter elements
    this.minPlayersFilter = page.locator(
      'input[name*="minPlayers"], input[id*="minPlayers"]'
    );
    this.maxPlayersFilter = page.locator(
      'input[name*="maxPlayers"], input[id*="maxPlayers"]'
    );
    this.minPlayingTimeFilter = page.locator(
      'input[name*="minPlayingTime"], input[id*="minPlayingTime"]'
    );
    this.maxPlayingTimeFilter = page.locator(
      'input[name*="maxPlayingTime"], input[id*="maxPlayingTime"]'
    );
    this.minAgeFilter = page.locator(
      'input[name*="minAge"], input[id*="minAge"]'
    );
    this.minRatingFilter = page.locator(
      'input[name*="minRating"], input[id*="minRating"]'
    );
  }

  async goto() {
    await this.page.goto('/');
  }

  async searchForUsers(usernames: string) {
    await this.usernameInput.fill(usernames);
    await this.searchButton.click();
  }

  async waitForResults(timeout = 10000) {
    // Wait for loading to finish
    if (await this.loadingIndicator.isVisible()) {
      await expect(this.loadingIndicator).toBeHidden({ timeout });
    }

    // Wait for results to appear or error/empty message
    await Promise.race([
      this.resultsContainer.waitFor({ timeout }),
      this.errorMessage.waitFor({ timeout }),
      this.emptyMessage.waitFor({ timeout }),
    ]);
  }

  async getGameCount(): Promise<number> {
    return await this.gameItems.count();
  }

  async getFirstGameText(): Promise<string | null> {
    const firstGame = this.gameItems.first();
    return await firstGame.textContent();
  }

  async toggleExpansionFilter() {
    await this.excludeExpansionsCheckbox.check();
  }

  async setItemsPerPage(value: string) {
    await this.itemsPerPageSelect.selectOption(value);
  }

  async goToNextPage() {
    await this.nextButton.click();
  }

  async goToPreviousPage() {
    await this.previousButton.click();
  }

  async applyPlayerFilter(minPlayers?: number, maxPlayers?: number) {
    if (minPlayers !== undefined) {
      await this.minPlayersFilter.fill(minPlayers.toString());
    }
    if (maxPlayers !== undefined) {
      await this.maxPlayersFilter.fill(maxPlayers.toString());
    }
  }

  async applyTimeFilter(minTime?: number, maxTime?: number) {
    if (minTime !== undefined) {
      await this.minPlayingTimeFilter.fill(minTime.toString());
    }
    if (maxTime !== undefined) {
      await this.maxPlayingTimeFilter.fill(maxTime.toString());
    }
  }

  async applyAgeFilter(minAge: number) {
    await this.minAgeFilter.fill(minAge.toString());
  }

  async applyRatingFilter(minRating: number) {
    await this.minRatingFilter.fill(minRating.toString());
  }

  async hasUserInfo(usernames: string[]): Promise<boolean> {
    for (const username of usernames) {
      const userLocator = this.page.locator(`text=${username}`);
      if (await userLocator.isVisible()) {
        return true;
      }
    }
    return false;
  }

  async isPaginationVisible(): Promise<boolean> {
    return await this.paginationControls.isVisible();
  }

  async isExpansionFilterVisible(): Promise<boolean> {
    return await this.excludeExpansionsCheckbox.isVisible();
  }
}
