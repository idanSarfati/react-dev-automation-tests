import { test, expect } from '@playwright/test';

test('Verify header and footer exist on ReactJS homepage', async ({ page }) => {
  await page.goto('https://react.dev');

  // Verify navigation bar (header equivalent)
  const navBar = page.locator('nav').first();
  await expect(navBar).toBeVisible();

  // Instead of checking the logo image which may be hidden,
  // verify the React text in the navigation
  const reactText = navBar.getByText('React');
  await expect(reactText).toBeVisible();

  // Alternative: verify the logo exists in the DOM
  const reactLogo = navBar.locator('img[alt*="logo"]');
  await expect(reactLogo).toBeAttached(); // Checks existence in DOM, not visibility

  // Verify footer
  const footer = page.locator('footer');
  await expect(footer).toBeVisible();

  // Verify copyright text in footer
  const copyrightText = page.locator('text=/Copyright © Meta/');
  await expect(copyrightText).toBeVisible();
});