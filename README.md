# React.dev Automated Testing Challenge

This project contains automated Playwright tests for the [React.dev](https://react.dev) homepage.

## 📦 Tools Used

- [Playwright](https://playwright.dev/) (Node.js)
- GitHub Actions (for CI, see .github/workflows/)

## 🚀 How to Run the Tests

1. *Install dependencies*
2. *Run all tests*
3. *View the HTML report*


## 🗂️ Project Structure

- .github/workflows/ – CI configuration for GitHub Actions
- tests/ – All Playwright test files, organized by feature
- playwright.config.js – Playwright configuration
- package.json / package-lock.json – Project dependencies and scripts


## 🧪 Test Coverage

| Test File | Description |
|:----------|:------------|
| `memoryLeakDetection.spec.js` | Detects memory leaks by monitoring JavaScript heap usage before and after opening/closing the search modal multiple times, ensuring heap growth stays under 20%. |
| `offlineFunctionality.spec.js` | Verifies that the React.dev homepage remains partially functional while offline by pre-caching important pages and simulating network disconnection and recovery. |
| `accessibilityCompliance.spec.js` | Ensures the homepage complies with WCAG 2.1 AA accessibility standards using AxeBuilder for automatic violation detection and manual checks for keyboard navigation and visible focus indicators. |
| `themeToggle.spec.js` | Tests that toggling Dark Mode on the homepage correctly changes visual properties like colors and classes. |
| `headerFooter.spec.js` | Validates that the navigation bar and footer are present and contain the correct elements like the React logo and copyright. |
| `securityHeaders.spec.js` | Confirms that critical security-related HTTP headers (such as Content-Security-Policy, X-Frame-Options, and others) are properly set to enhance site security. |


## 📝 Notes

- The code playground test was omitted due to instability and unreliable DOM targeting.
- All other critical functionality is covered by automated tests.

## 💡 Author

Idan Sarfati


