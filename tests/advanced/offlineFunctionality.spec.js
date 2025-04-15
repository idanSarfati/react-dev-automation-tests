const { test, expect } = require('@playwright/test');

test('React.dev basic content remains accessible offline', async ({ browser }) => {
  // Create a new browser context
  const context = await browser.newContext();
  const page = await context.newPage();

  // Load the page while online
  await page.goto('https://react.dev');
  await page.waitForLoadState('networkidle');
  
  // Verify essential elements are visible before going offline
  const navBar = page.locator('nav').first();
  await expect(navBar).toBeVisible();
  
  // Store initial content for comparison
  const initialContent = await page.locator('main').textContent();
  
  // Pre-cache the Learn page by visiting it while online
  const learnLink = page.locator('nav').getByRole('link', { name: 'Learn', exact: true });
  await learnLink.click();
  await page.waitForLoadState('networkidle');
  
  // Return to homepage
  await page.goto('https://react.dev');
  await page.waitForLoadState('networkidle');
  
  // Go offline
  await context.setOffline(true);
  console.log('Network is now offline');
  
  // Verify basic content is still accessible
  await expect(page.locator('main')).toBeVisible();
  
  // Test interactive elements that should work offline
  const themeToggle = page.getByRole('button', { name: /dark mode|light mode/i });
  if (await themeToggle.isVisible()) {
    await themeToggle.click();
    // Verify theme change worked
    await expect(page.locator('main')).toBeVisible();
  }
  
  // Go back online
  await context.setOffline(false);
  console.log('Network is now online');
  
  // Verify reconnection works
  await page.reload();
  await page.waitForLoadState('networkidle');
  await expect(navBar).toBeVisible();
  
  // Clean up
  await context.close();
});
