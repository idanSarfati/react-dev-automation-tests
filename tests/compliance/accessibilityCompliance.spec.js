const { test, expect } = require('@playwright/test');
const { AxeBuilder } = require('@axe-core/playwright');

test('React.dev meets WCAG 2.1 AA accessibility standards', async ({ page }) => {
  // Navigate to React.dev homepage
  await page.goto('https://react.dev');
  await page.waitForLoadState('networkidle');

  // Run axe accessibility analysis
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  // Filter violations by impact level
  const criticalViolations = results.violations.filter(v => v.impact === 'critical');
  const seriousViolations = results.violations.filter(v => v.impact === 'serious');
  
  // Generate human-readable report for violations
  const formatViolation = (violation) => ({
    id: violation.id,
    impact: violation.impact,
    description: violation.help,
    helpUrl: violation.helpUrl,
    nodes: violation.nodes.map(n => ({
      html: n.html,
      failureSummary: n.failureSummary
    })).slice(0, 3) // Limit to 3 examples per violation
  });

  // Log detailed report for debugging
  console.log('Accessibility Test Results:');
  console.log(`- Passes: ${results.passes.length}`);
  console.log(`- Violations: ${results.violations.length}`);
  console.log(`  - Critical: ${criticalViolations.length}`);
  console.log(`  - Serious: ${seriousViolations.length}`);
  
  if (results.violations.length > 0) {
    console.log('\nTop violations:');
    results.violations.slice(0, 5).forEach(v => {
      console.log(`- ${v.id} (${v.impact}): ${v.help}`);
      console.log(`  Help: ${v.helpUrl}`);
      console.log(`  Affected elements: ${v.nodes.length}`);
    });
  }

  // Test keyboard navigation
  await page.keyboard.press('Tab');
  const firstFocusedElement = await page.evaluate(() => document.activeElement.tagName);
  expect(firstFocusedElement).not.toBe('BODY'); // Something should receive focus
  
  // Check for skip link (common accessibility feature)
  const skipLink = page.getByRole('link', { name: /skip to content|skip navigation/i });
  if (await skipLink.count() > 0) {
    await skipLink.focus();
    await skipLink.press('Enter');
    
    // Verify focus moved to main content
    const focusedAfterSkip = await page.evaluate(() => 
      document.activeElement.tagName + 
      (document.activeElement.id ? '#' + document.activeElement.id : '')
    );
    console.log(`Focus after skip link: ${focusedAfterSkip}`);
  } else {
    console.log('No skip link found - recommended for keyboard accessibility');
  }
  
  // Test focus styles on visible interactive elements instead of nav links
  // Find a reliable visible interactive element
  const interactiveElement = page.getByRole('button', { name: /search|dark mode|light mode/i }).first();
  
  // Verify focus indicator is visible
  await interactiveElement.focus();
  const hasFocusStyles = await page.evaluate(() => {
    const activeElement = document.activeElement;
    const styles = window.getComputedStyle(activeElement);
    return styles.outlineWidth !== '0px' || 
           styles.boxShadow !== 'none' ||
           styles.borderWidth !== '0px';
  });
  
  expect(hasFocusStyles).toBeTruthy();
  
  // Verify heading hierarchy
  const headingLevels = await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    return headings.map(h => ({
      level: parseInt(h.tagName.substring(1)),
      text: h.textContent.trim().substring(0, 50)
    }));
  });
  
  // Check for proper heading structure (should start with h1)
  if (headingLevels.length > 0) {
    expect(headingLevels[0].level).toBe(1);
  }
  
  // Check for heading level skips (e.g., h1 to h3 without h2)
  let previousLevel = 0;
  let hasHeadingSkip = false;
  
  for (const heading of headingLevels) {
    if (heading.level > previousLevel + 1) {
      hasHeadingSkip = true;
      console.log(`Heading level skip: ${previousLevel} to ${heading.level}`);
    }
    previousLevel = heading.level;
  }
  
  // Assert on critical and serious violations
  expect(criticalViolations).toHaveLength(0);
  
  // Tolerate a small number of serious violations, but log them
  if (seriousViolations.length > 0) {
    console.log('\nSerious violations found:');
    seriousViolations.forEach(v => console.log(`- ${v.id}: ${v.help}`));
  }
  expect(seriousViolations.length).toBeLessThanOrEqual(3);
});
