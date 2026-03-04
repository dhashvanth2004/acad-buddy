# AcadBuddy Testing Guide

## Overview
Comprehensive E2E testing suite for AcadBuddy built with Playwright.

## Setup

### 1. Install Dependencies
```bash
bun install
```

### 2. Install Playwright Browsers
```bash
bunx playwright install
```

### 3. Setup Test Environment
```bash
cp .env.test.example .env.test
# Edit .env.test with your test credentials
```

### 4. Create Test Users in Supabase
Create two test accounts in your Supabase database:
- Student: `test.student@acadbuddy.test` / `TestPassword123!`
- Mentor: `test.mentor@acadbuddy.test` / `TestPassword123!`

## Running Tests

### Run All Tests
```bash
bun run test
```

### Run Tests in UI Mode (Recommended for Development)
```bash
bun run test:ui
```

### Run Tests in Headed Mode (See Browser)
```bash
bun run test:headed
```

### Debug a Specific Test
```bash
bun run test:debug
```

### Run Specific Test File
```bash
bunx playwright test tests/e2e/auth.spec.ts
```

### Run Tests for Specific Browser
```bash
bunx playwright test --project=chromium
bunx playwright test --project=firefox
bunx playwright test --project=webkit
```

## Test Structure

```
tests/
├── e2e/
│   ├── auth.spec.ts              # Authentication flows
│   ├── mentor-flow.spec.ts       # Mentor-related features
│   ├── student-flow.spec.ts      # Student-related features
│   └── security-and-errors.spec.ts  # Security & error handling
└── utils/
    ├── test-helpers.ts           # Common test utilities
    └── auth-helpers.ts           # Authentication helpers
```

## Writing Tests

### Basic Test Example
```typescript
import { test, expect } from '@playwright/test';

test('should load home page', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
});
```

### Using Auth Helpers
```typescript
import { loginAsStudent } from '../utils/auth-helpers';

test('should access dashboard', async ({ page, context }) => {
  await loginAsStudent(page, context);
  await page.goto('/dashboard');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

## Test Coverage

### Authentication
- ✅ Sign up (Student/Mentor)
- ✅ Login
- ✅ Logout
- ✅ Password Reset
- ✅ Form Validation
- ✅ Error Handling

### Mentor Flow
- ✅ Browse Mentors
- ✅ Filter & Search
- ✅ View Profile
- ✅ Contact Mentor
- ✅ Become a Mentor
- ✅ Mentor Dashboard

### Student Flow
- ✅ Student Dashboard
- ✅ Profile Management
- ✅ Study Assistant
- ✅ Messaging
- ✅ Session Booking

### Security & Error Handling
- ✅ Protected Route Access
- ✅ SQL Injection Prevention
- ✅ XSS Prevention
- ✅ Input Validation
- ✅ Network Error Handling
- ✅ 404 Pages
- ✅ Edge Cases

## Viewing Test Reports

After running tests:
```bash
bun run test:report
```

This opens an HTML report showing:
- Pass/fail status
- Screenshots on failure
- Videos of failed tests
- Performance metrics
- Network logs

## Debugging Tips

### 1. Use UI Mode
Best for interactive debugging:
```bash
bun run test:ui
```

### 2. Use Debug Mode
Stops at breakpoints:
```bash
bun run test:debug
```

### 3. Slow Down Tests
```typescript
test.use({ launchOptions: { slowMo: 1000 } });
```

### 4. Take Screenshots
```typescript
await page.screenshot({ path: 'screenshot.png' });
```

### 5. Inspect During Test
```typescript
await page.pause(); // Opens inspector
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install
      - run: bunx playwright install --with-deps
      - run: bun run test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Best Practices

1. **Use Data Test IDs**: Add `data-testid` attributes to elements
   ```tsx
   <button data-testid="submit-button">Submit</button>
   ```

2. **Wait for Network Idle**: Use `waitForLoadState('networkidle')`

3. **Isolate Tests**: Each test should be independent

4. **Use Page Objects**: For complex interactions

5. **Mock External Services**: When appropriate

6. **Keep Tests Fast**: Avoid unnecessary waits

7. **Use Meaningful Assertions**: Clear error messages

## Troubleshooting

### Tests Fail Locally
1. Ensure dev server is running (`bun run dev`)
2. Check .env.test configuration
3. Verify test users exist in database

### Timeouts
- Increase timeout in `playwright.config.ts`
- Check for slow network requests
- Use `page.waitForLoadState()`

### Flaky Tests
- Add proper wait conditions
- Avoid hardcoded delays
- Check for race conditions

## Performance Testing

Run tests with performance metrics:
```typescript
test('performance test', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - startTime;
  expect(loadTime).toBeLessThan(3000);
});
```

## Accessibility Testing

Add Axe for accessibility checks:
```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('accessibility test', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

## Contributing

When adding new features:
1. Write tests first (TDD)
2. Ensure all tests pass
3. Add to appropriate test file
4. Update this documentation

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
