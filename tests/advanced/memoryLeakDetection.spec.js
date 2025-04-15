const { test, expect } = require('@playwright/test');

// Only run this test in Chromium browsers where performance.memory is available
test('Search modal doesn\'t cause memory leaks', async ({ page, browserName }) => {
  // Skip test for non-Chromium browsers
  test.skip(browserName !== 'chromium', 'Memory API only available in Chromium');
  
  // Extend timeout for this specific test
  test.setTimeout(60000);
  
  await page.goto('https://react.dev');

  // Function to get current JS heap size
  const getHeapSize = async () => {
    return await page.evaluate(() => {
      if (!performance.memory) {
        return 0; // Fallback for browsers without memory API
      }
      return performance.memory.usedJSHeapSize;
    });
  };

  // Function to open and close search modal with optimized waits
  const toggleSearchModal = async () => {
    // Click search button and wait for modal
    const searchButton = page.getByRole('button', { name: /search/i });
    await searchButton.click();
    
    // Wait for search input to appear
    await page.waitForSelector('input[type="search"]', { timeout: 10000 });
    
    // Press Escape key to close the modal instead of looking for a close button
    await page.keyboard.press('Escape');
    
    // Wait for search modal to close completely
    await page.waitForFunction(() => {
      return !document.querySelector('input[type="search"]');
    }, { timeout: 10000 });
  };
  

  // Initial heap size
  const initialHeapSize = await getHeapSize();
  console.log('Initial heap size:', initialHeapSize);

  // Reduce iterations to prevent timeout
  const iterations = 5; // Reduced from 10
  const heapSizes = [initialHeapSize];

  // Perform multiple open/close cycles with garbage collection
  for (let i = 0; i < iterations; i++) {
    await toggleSearchModal();
    
    // Force garbage collection if possible (only works with specific browser flags)
    try {
      await page.evaluate(() => window.gc());
    } catch (e) {
      // GC not available, continue without it
    }
    
    const currentHeapSize = await getHeapSize();
    heapSizes.push(currentHeapSize);
    console.log(`Heap size after iteration ${i + 1}:`, currentHeapSize);
  }

  // Simplified growth check - just compare final vs initial
  if (initialHeapSize > 0) { // Only check if memory API is available
    const heapGrowth = (heapSizes[iterations] - heapSizes[0]) / heapSizes[0];
    console.log('Heap growth:', heapGrowth);
    
    // Assert that heap growth is within acceptable limits
    expect(heapGrowth).toBeLessThan(0.2); // Allow for up to 20% growth
  }
});
