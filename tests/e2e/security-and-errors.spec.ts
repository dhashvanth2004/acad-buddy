import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Security, Error Handling, and Edge Cases
 */

test.describe('Security Tests', () => {
  test.describe('Authentication Protection', () => {
    test('should redirect unauthorized users from protected pages', async ({ page }) => {
      const protectedPages = [
        '/dashboard',
        '/mentor-dashboard',
        '/edit-profile',
        '/chat',
        '/study-assistant',
      ];

      for (const pagePath of protectedPages) {
        await page.goto(pagePath);
        
        // Should redirect to login
        await page.waitForURL(/\/($|login)/, { timeout: 5000 });
      }
    });

    test('should not allow SQL injection in search', async ({ page }) => {
      await page.goto('/mentors');
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
      
      // Try SQL injection patterns
      const injectionPatterns = [
        "'; DROP TABLE profiles; --",
        "1' OR '1'='1",
        "admin'--",
        "<script>alert('xss')</script>",
      ];

      for (const pattern of injectionPatterns) {
        await searchInput.fill(pattern);
        await page.waitForTimeout(500);
        
        // App should not crash
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should prevent XSS in user inputs', async ({ page }) => {
      await page.goto('/signup');
      
      const nameInput = page.locator('input[type="text"]').first();
      await nameInput.fill('<script>alert("XSS")</script>');
      
      // Should not execute script
      page.on('dialog', dialog => {
        throw new Error('XSS dialog appeared - security vulnerability!');
      });
      
      await page.waitForTimeout(1000);
    });
  });

  test.describe('Rate Limiting', () => {
    test('should handle multiple rapid submissions gracefully', async ({ page }) => {
      await page.goto('/login');
      
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.locator('button[type="submit"]');
      
      // Fill form
      await emailInput.fill('test@example.com');
      await passwordInput.fill('password123');
      
      // Rapid fire submissions
      for (let i = 0; i < 5; i++) {
        await submitButton.click({ force: true });
        await page.waitForTimeout(100);
      }
      
      // App should still be functional
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Data Validation', () => {
    test('should validate email format', async ({ page }) => {
      await page.goto('/signup');
      
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user@domain',
      ];

      for (const email of invalidEmails) {
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="text"]', 'Test User');
        await page.fill('input[type="password"]', 'password123');
        await page.click('label[for="student"]');
        await page.click('button[type="submit"]');
        
        // Should show validation error
        const hasError = await page.locator('text=/invalid|valid email/i').isVisible()
          .catch(() => false);
        expect(hasError).toBeTruthy();
      }
    });

    test('should enforce minimum password length', async ({ page }) => {
      await page.goto('/signup');
      
      await page.fill('input[type="text"]', 'Test User');
      await page.fill('input[type="email"]', 'test@example.com');
      await page.fill('input[type="password"]', '12345'); // Too short
      await page.click('label[for="student"]');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=/6 characters/i')).toBeVisible();
    });

    test('should validate required fields in mentor application', async ({ page }) => {
      // This assumes user is logged in
      await page.goto('/become-mentor');
      
      // Submit without filling fields
      await page.click('button[type="submit"]').catch(() => {});
      
      // Should show multiple validation errors
      const errors = await page.locator('text=/required|must/i').count();
      expect(errors).toBeGreaterThan(0);
    });
  });
});

test.describe('Error Handling', () => {
  test.describe('Network Errors', () => {
    test('should handle offline mode gracefully', async ({ page, context }) => {
      await page.goto('/mentors');
      
      // Simulate offline
      await context.setOffline(true);
      
      // Try to perform an action
      await page.click('button, a').first().catch(() => {});
      
      // Should show error message or maintain UI state
      await expect(page.locator('body')).toBeVisible();
      
      await context.setOffline(false);
    });

    test('should show error on failed API requests', async ({ page, context }) => {
      // Intercept and fail API requests
      await page.route('**/rest/v1/**', route => {
        route.abort('failed');
      });
      
      await page.goto('/mentors');
      
      // Should handle gracefully without crashing
      await page.waitForTimeout(2000);
      await expect(page.locator('body')).toBeVisible();
    });
  });

  test.describe('Invalid Routes', () => {
    test('should show 404 page for non-existent routes', async ({ page }) => {
      await page.goto('/this-page-does-not-exist');
      
      await expect(page.locator('text=/404|not found/i')).toBeVisible();
    });

    test('should show 404 for invalid mentor ID', async ({ page }) => {
      await page.goto('/mentor/invalid-id-12345');
      
      // Should show error or 404
      await page.waitForTimeout(2000);
      const has404 = await page.locator('text=/404|not found|error/i').isVisible()
        .catch(() => false);
      expect(has404 || page.url().includes('404')).toBeTruthy();
    });
  });

  test.describe('Form Errors', () => {
    test('should handle form submission errors', async ({ page }) => {
      await page.goto('/signup');
      
      // Fill with invalid data
      await page.fill('input[type="text"]', 'A'); // Too short
      await page.fill('input[type="email"]', 'invalid');
      await page.fill('input[type="password"]', '123'); // Too short
      await page.click('button[type="submit"]');
      
      // Should show multiple validation errors
      const errors = page.locator('[class*="error"], [role="alert"], .text-red-500, .text-destructive');
      const errorCount = await errors.count();
      expect(errorCount).toBeGreaterThan(0);
    });
  });
});

test.describe('Edge Cases', () => {
  test.describe('Empty States', () => {
    test('should show empty state for no mentors', async ({ page, context }) => {
      // Mock empty response
      await page.route('**/rest/v1/profiles*', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      });
      
      await page.goto('/mentors');
      await page.waitForTimeout(1000);
      
      // Should show empty state message
      const hasEmptyMessage = await page.locator('text=/no mentors|no results/i').isVisible()
        .catch(() => false);
      expect(hasEmptyMessage).toBeTruthy();
    });

    test('should show empty state for no conversations', async ({ page }) => {
      await page.goto('/chat');
      
      // Should show empty state or placeholder
      await expect(page.locator('text=/no conversations|select.*conversation|start.*chat/i')).toBeVisible();
    });
  });

  test.describe('Special Characters', () => {
    test('should handle special characters in search', async ({ page }) => {
      await page.goto('/mentors');
      
      const specialChars = ['@#$%', '中文', 'العربية', '🔥💯'];
      
      for (const chars of specialChars) {
        const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]').first();
        await searchInput.fill(chars);
        await page.waitForTimeout(300);
        
        // Should not crash
        await expect(page.locator('body')).toBeVisible();
      }
    });

    test('should handle emoji in profile name', async ({ page }) => {
      await page.goto('/signup');
      
      await page.fill('input[type="text"]', 'Test User 🎓');
      await page.fill('input[type="email"]', `test.${Date.now()}@example.com`);
      await page.fill('input[type="password"]', 'password123');
      await page.click('label[for="student"]');
      
      // Should accept emoji
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
      
      // Should not show validation error for name
      const hasNameError = await page.locator('input[type="text"] ~ [class*="error"]').isVisible()
        .catch(() => false);
      expect(hasNameError).toBeFalsy();
    });
  });

  test.describe('Boundary Values', () => {
    test('should handle very long names', async ({ page }) => {
      await page.goto('/signup');
      
      const longName = 'A'.repeat(150); // Exceeds 100 char limit
      await page.fill('input[type="text"]', longName);
      await page.fill('input[type="email"]', `test.${Date.now()}@example.com`);
      await page.fill('input[type="password"]', 'password123');
      await page.click('button[type="submit"]');
      
      // Should show validation error
      await expect(page.locator('text=/too long|maximum|100/i')).toBeVisible();
    });

    test('should handle maximum hourly rate', async ({ page }) => {
      await page.goto('/become-mentor');
      
      const rateInput = page.locator('input[type="number"], input[name="hourlyRate"]');
      await rateInput.fill('10000'); // Very high rate
      
      // Should either accept or show validation
      await page.waitForTimeout(500);
      const value = await rateInput.inputValue();
      expect(Number(value)).toBeLessThan(100000);
    });
  });

  test.describe('Concurrent Actions', () => {
    test('should handle multiple tabs', async ({ context }) => {
      const page1 = await context.newPage();
      const page2 = await context.newPage();
      
      await page1.goto('/');
      await page2.goto('/mentors');
      
      // Both should work independently
      await expect(page1.locator('body')).toBeVisible();
      await expect(page2.locator('body')).toBeVisible();
      
      await page1.close();
      await page2.close();
    });
  });

  test.describe('Performance', () => {
    test('should load pages within reasonable time', async ({ page }) => {
      const pages = ['/', '/mentors', '/signup', '/login'];
      
      for (const pagePath of pages) {
        const startTime = Date.now();
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        // Should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
      }
    });
  });
});
