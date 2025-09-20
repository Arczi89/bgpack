import { Page, expect } from '@playwright/test';

export class TestHelpers {
  static async waitForApiCall(page: Page, endpoint: string, timeout = 10000) {
    return page.waitForResponse(
      response =>
        response.url().includes(endpoint) && response.status() === 200,
      { timeout }
    );
  }

  static async mockApiResponse(
    page: Page,
    endpoint: string,
    mockData: any,
    status = 200
  ) {
    await page.route(`**/api/${endpoint}**`, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(mockData),
      });
    });
  }

  static async mockApiError(
    page: Page,
    endpoint: string,
    errorMessage = 'API Error',
    status = 500
  ) {
    await page.route(`**/api/${endpoint}**`, route => {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ error: errorMessage }),
      });
    });
  }

  static async mockApiTimeout(page: Page, endpoint: string) {
    await page.route(`**/api/${endpoint}**`, route => {
      // Don't fulfill the request, let it timeout
      route.abort('timedout');
    });
  }

  static async waitForElementToBeStable(
    page: Page,
    selector: string,
    timeout = 5000
  ) {
    const element = page.locator(selector);
    await element.waitFor({ timeout });

    // Wait for any animations or transitions to complete
    await page.waitForTimeout(500);

    return element;
  }

  static async takeScreenshotOnFailure(page: Page, testName: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `failure-${testName}-${timestamp}.png`;
    await page.screenshot({
      path: `test-results/screenshots/${filename}`,
      fullPage: true,
    });
  }

  static async measurePerformance(
    page: Page,
    action: () => Promise<void>
  ): Promise<number> {
    const startTime = Date.now();
    await action();
    const endTime = Date.now();
    return endTime - startTime;
  }

  static async retryAction<T>(
    action: () => Promise<T>,
    maxRetries = 3,
    delay = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await action();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }

  static async waitForNetworkIdle(page: Page, timeout = 10000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async clearAndFillInput(page: Page, selector: string, value: string) {
    const input = page.locator(selector);
    await input.clear();
    await input.fill(value);
  }

  static async waitForTextToAppear(page: Page, text: string, timeout = 5000) {
    await page.waitForSelector(`text=${text}`, { timeout });
  }

  static async waitForTextToDisappear(
    page: Page,
    text: string,
    timeout = 5000
  ) {
    await page.waitForSelector(`text=${text}`, { state: 'hidden', timeout });
  }

  static async getElementCount(page: Page, selector: string): Promise<number> {
    return page.locator(selector).count();
  }

  static async isElementVisible(
    page: Page,
    selector: string
  ): Promise<boolean> {
    return page.locator(selector).isVisible();
  }

  static async getElementText(
    page: Page,
    selector: string
  ): Promise<string | null> {
    return page.locator(selector).textContent();
  }

  static async clickAndWaitForResponse(
    page: Page,
    selector: string,
    endpoint: string
  ) {
    const responsePromise = this.waitForApiCall(page, endpoint);
    await page.locator(selector).click();
    return responsePromise;
  }

  static async fillAndSubmitForm(page: Page, formData: Record<string, string>) {
    for (const [selector, value] of Object.entries(formData)) {
      await this.clearAndFillInput(page, selector, value);
    }

    // Submit form (assuming there's a submit button)
    await page
      .locator('button[type="submit"], button:has-text("Search")')
      .click();
  }

  static async waitForTableToLoad(page: Page, tableSelector = 'table') {
    const table = page.locator(tableSelector);
    await table.waitFor({ timeout: 10000 });

    // Wait for at least one row to appear (or empty state)
    await Promise.race([
      table.locator('tbody tr').first().waitFor({ timeout: 5000 }),
      page
        .locator('text=No games found, .empty-state')
        .waitFor({ timeout: 5000 }),
    ]);
  }

  static async verifyTableStructure(page: Page, expectedColumns: string[]) {
    const table = page.locator('table');
    await table.waitFor({ timeout: 5000 });

    const headers = table.locator('thead th');
    const headerCount = await headers.count();

    expect(headerCount).toBe(expectedColumns.length);

    for (let i = 0; i < expectedColumns.length; i++) {
      const headerText = await headers.nth(i).textContent();
      expect(headerText).toContain(expectedColumns[i]);
    }
  }
}
