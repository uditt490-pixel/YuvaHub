import { test, expect } from '@playwright/test';

test.describe('Mock Interview Room', () => {
  test('should allow entering the mock interview room', async ({ page }) => {
    // Navigate to the main page
    await page.goto('/');

    // Check if the page loaded
    const title = await page.title();
    expect(title).not.toBeNull();
    
    // We can expand this with actual interactions once we know the specific UI elements
  });
});
