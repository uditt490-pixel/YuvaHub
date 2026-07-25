import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow a user to navigate to login', async ({ page }) => {
    // Basic test to verify playwright setup
    await page.goto('/');

    // Check if the page loads and has some generic content
    // We can update this when we have more specifics about the UI
    const title = await page.title();
    expect(title).not.toBeNull();
  });
});
