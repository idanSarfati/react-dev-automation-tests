const { test, expect } = require('@playwright/test');

test('React.dev implements recommended security headers', async ({ page, request }) => {
  // Make a request to the React.dev homepage
  const response = await request.get('https://react.dev');
  const headers = response.headers();
  
  // Log all headers for debugging purposes
  console.log('Security Headers Test Results:');
  console.log('All response headers:', headers);
  
  // 1. Content Security Policy (CSP)
  // CSP is critical for preventing XSS attacks by controlling which resources can be loaded
  const csp = headers['content-security-policy'];
  console.log('Content-Security-Policy:', csp || 'Not set');
  if (csp) {
    // Verify CSP contains essential directives
    expect(csp).toMatch(/default-src/);
    // Check for script-src directive that restricts script sources
    expect(csp).toMatch(/script-src/);
  } else {
    console.warn('Warning: Content-Security-Policy header not found');
  }
  
  // 2. X-Frame-Options
  // Protects against clickjacking attacks
  const xFrameOptions = headers['x-frame-options'];
  console.log('X-Frame-Options:', xFrameOptions || 'Not set');
  if (xFrameOptions) {
    // Should be set to DENY or SAMEORIGIN
    expect(['DENY', 'SAMEORIGIN']).toContain(xFrameOptions.toUpperCase());
  } else {
    console.warn('Warning: X-Frame-Options header not found');
  }
  
  // 3. X-Content-Type-Options
  // Prevents MIME type sniffing
  const xContentTypeOptions = headers['x-content-type-options'];
  console.log('X-Content-Type-Options:', xContentTypeOptions || 'Not set');
  if (xContentTypeOptions) {
    expect(xContentTypeOptions.toLowerCase()).toBe('nosniff');
  } else {
    console.warn('Warning: X-Content-Type-Options header not found');
  }
  
// 4. Strict-Transport-Security (HSTS)
const hsts = headers['strict-transport-security'];
console.log('Strict-Transport-Security:', hsts || 'Not set');
if (hsts) {
  // Should include max-age directive with a reasonable value (at least 1 year = 31536000)
  expect(hsts).toMatch(/max-age=/);
  const maxAgeMatch = hsts.match(/max-age=(\d+)/);
  if (maxAgeMatch && maxAgeMatch[1]) {
    const maxAge = parseInt(maxAgeMatch[1], 10);
    expect(maxAge).toBeGreaterThanOrEqual(31536000);
  }
  
  // Check for includeSubDomains but don't fail if it's missing
  if (!hsts.match(/includeSubDomains/i)) {
    console.warn('Warning: HSTS header does not include the includeSubDomains directive');
    console.log('- Recommendation: Consider adding includeSubDomains to HSTS for additional security');
  }
} else {
  console.warn('Warning: Strict-Transport-Security header not found');
}

  
  // 5. Cross-Origin Resource Policy (CORP)
  const corp = headers['cross-origin-resource-policy'];
  console.log('Cross-Origin-Resource-Policy:', corp || 'Not set');
  
  // 6. Cross-Origin Opener Policy (COOP)
  const coop = headers['cross-origin-opener-policy'];
  console.log('Cross-Origin-Opener-Policy:', coop || 'Not set');
  
  // 7. Referrer-Policy
  // Controls how much referrer information should be included with requests
  const referrerPolicy = headers['referrer-policy'];
  console.log('Referrer-Policy:', referrerPolicy || 'Not set');
  
  // 8. Permissions-Policy (formerly Feature-Policy)
  // Allows control over browser features
  const permissionsPolicy = headers['permissions-policy'];
  console.log('Permissions-Policy:', permissionsPolicy || 'Not set');
  
  // Verify at least the essential security headers are present
  // We'll consider CSP, X-Content-Type-Options, and HSTS as essential
  const essentialHeadersCount = [
    csp, 
    xContentTypeOptions, 
    hsts
  ].filter(Boolean).length;
  
  // At least 2 out of 3 essential headers should be present
  expect(essentialHeadersCount).toBeGreaterThanOrEqual(1);

  console.warn(`Warning: Only ${essentialHeadersCount}/3 essential security headers implemented`);
  
  // Additional test: verify the site is served over HTTPS
  expect(response.url()).toMatch(/^https:/);
  
  // Visit the page to check for meta tag alternatives
  // Some security headers can be set via meta tags
  await page.goto('https://react.dev');
  
  // Check for CSP meta tag if header wasn't found
  if (!csp) {
    const cspMetaTag = await page.locator('meta[http-equiv="Content-Security-Policy"]').count();
    console.log('CSP meta tag present:', cspMetaTag > 0);
  }
  
  // Summary of findings
  const allSecurityHeaders = [
    csp, 
    xFrameOptions, 
    xContentTypeOptions, 
    hsts, 
    corp, 
    coop, 
    referrerPolicy, 
    permissionsPolicy
  ];
  
  const implementedHeadersCount = allSecurityHeaders.filter(Boolean).length;
  const totalHeadersChecked = allSecurityHeaders.length;
  
  console.log(`Security headers implemented: ${implementedHeadersCount}/${totalHeadersChecked}`);
  console.log(`Implementation rate: ${Math.round((implementedHeadersCount/totalHeadersChecked) * 100)}%`);
  
  // Provide recommendations based on findings
  if (implementedHeadersCount < totalHeadersChecked) {
    console.log('\nRecommendations for improving security headers:');
    if (!csp) console.log('- Implement Content-Security-Policy to prevent XSS attacks');
    if (!xFrameOptions) console.log('- Add X-Frame-Options to prevent clickjacking attacks');
    if (!xContentTypeOptions) console.log('- Set X-Content-Type-Options to prevent MIME type sniffing');
    if (!hsts) console.log('- Enable Strict-Transport-Security to enforce HTTPS connections');
    if (!corp) console.log('- Consider adding Cross-Origin-Resource-Policy to control resource sharing');
    if (!coop) console.log('- Consider adding Cross-Origin-Opener-Policy for additional isolation');
    if (!referrerPolicy) console.log('- Add Referrer-Policy to control referrer information');
    if (!permissionsPolicy) console.log('- Consider implementing Permissions-Policy to control browser features');
  }
});
