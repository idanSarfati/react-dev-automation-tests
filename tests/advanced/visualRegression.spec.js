const { test, expect } = require('@playwright/test');

test('Theme toggle properly changes appearance', async ({ page }) => {
    // Clear localStorage to ensure consistent starting state
    await page.goto('https://react.dev');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    
    // Find theme toggle button more reliably using its aria-label
    const themeToggle = page.getByRole('button', { name: /dark mode|light mode/i });
    await expect(themeToggle).toBeVisible();
    
    // Get initial theme state from multiple properties
    const initialThemeState = await page.evaluate(() => {
        const html = document.documentElement;
        return {
            htmlClass: html.className,
            rootBackgroundColor: getComputedStyle(html).backgroundColor,
            textColor: getComputedStyle(document.querySelector('main')).color
        };
    });
    
    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(1500); // Increased timeout for transition
    
    // Get updated theme state
    const updatedThemeState = await page.evaluate(() => {
        const html = document.documentElement;
        return {
            htmlClass: html.className,
            rootBackgroundColor: getComputedStyle(html).backgroundColor,
            textColor: getComputedStyle(document.querySelector('main')).color
        };
    });
    
    // Verify at least one property changed to indicate theme toggle worked
    expect(
        initialThemeState.htmlClass !== updatedThemeState.htmlClass ||
        initialThemeState.rootBackgroundColor !== updatedThemeState.rootBackgroundColor ||
        initialThemeState.textColor !== updatedThemeState.textColor
    ).toBeTruthy();
    
    // Verify UI remains visible after theme change
    await expect(page.locator('nav').first()).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
});
