import { test, expect } from '@playwright/test';

test('Verify theme toggle functionality on ReactJS homepage', async ({ page }) => {
  await page.goto('https://react.dev');

  // First, let's make sure we can find the theme toggle button more reliably
  // From the page snapshot, there's a button with "Use Dark Mode" text
  const themeButton = page.getByRole('button', { name: /dark mode/i });
  await expect(themeButton).toBeVisible({ timeout: 10000 });
  
  // Capture several visual properties before toggling
  const initialState = await page.evaluate(() => {
    const html = document.documentElement;
    return {
      htmlClasses: html.className,
      bodyColor: window.getComputedStyle(document.body).color,
      backgroundColor: window.getComputedStyle(document.documentElement).backgroundColor,
      mainTextColor: window.getComputedStyle(document.querySelector('main')).color
    };
  });

  // Click the button
  await themeButton.click();
  
  // Give it time to transition
  await page.waitForTimeout(1000);
  
  // Check the same properties after clicking
  const updatedState = await page.evaluate(() => {
    const html = document.documentElement;
    return {
      htmlClasses: html.className,
      bodyColor: window.getComputedStyle(document.body).color,
      backgroundColor: window.getComputedStyle(document.documentElement).backgroundColor,
      mainTextColor: window.getComputedStyle(document.querySelector('main')).color
    };
  });
  
  // Verify SOMETHING changed that would indicate a theme switch
  // We check multiple properties since we don't know exactly which one changes
  expect(
    initialState.htmlClasses !== updatedState.htmlClasses ||
    initialState.bodyColor !== updatedState.bodyColor ||
    initialState.backgroundColor !== updatedState.backgroundColor ||
    initialState.mainTextColor !== updatedState.mainTextColor
  ).toBeTruthy();
});