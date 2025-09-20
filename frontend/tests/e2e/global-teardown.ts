import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');

  // Clean up any test data or resources if needed
  // For now, just log completion

  console.log('✅ Global teardown completed');
}

export default globalTeardown;
