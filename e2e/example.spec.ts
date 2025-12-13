import { test, expect } from '@playwright/test';

test.describe('Example E2E Test', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Example assertion - adjust based on your actual homepage content
    await expect(page).toHaveTitle(/.*/);
  });
});




