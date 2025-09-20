import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');

  // Check if the application is running
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the application to be ready
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // Check if the main page loads correctly
    const title = await page.title();
    console.log(`✅ Application is running. Page title: ${title}`);

    // Verify that the main search form is present
    const searchInput = page.locator('#bgg-nicks');
    await searchInput.waitFor({ timeout: 10000 });
    console.log('✅ Search form is ready');
  } catch (error) {
    console.error('❌ Application is not ready:', error);
    throw new Error(
      'Application is not running or not accessible at http://localhost:3000'
    );
  } finally {
    await browser.close();
  }

  console.log('✅ Global setup completed');
}

export default globalSetup;
