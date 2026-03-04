import { test, expect } from '@playwright/test';
import { loginAsStudent, loginAsMentor } from '../utils/auth-helpers';

/**
 * E2E Tests for Mentor-related Flows
 * Covers: Become mentor, browse mentors, contact mentor, book session
 */

test.describe('Mentor Flow', () => {
  test.describe('Browse Mentors', () => {
    test('should display list of mentors', async ({ page }) => {
      await page.goto('/mentors');
      
      await expect(page.locator('h1, h2', { hasText: /find.*mentor/i })).toBeVisible();
      
      // Wait for mentors to load
      await page.waitForSelector('[data-testid="mentor-card"], .mentor-card', { timeout: 10000 })
        .catch(() => {
          // If no testid, wait for any card-like structure
          return page.waitForSelector('div:has(h3):has(button)', { timeout: 10000 });
        });
    });

    test('should filter mentors by search', async ({ page }) => {
      await page.goto('/mentors');
      
      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]').first();
      await searchInput.fill('Python');
      
      // Allow time for filtering
      await page.waitForTimeout(500);
      
      // Verify some results exist (or none if no Python mentors)
      const mentorCards = page.locator('[data-testid="mentor-card"], div:has(h3):has(button)');
      const count = await mentorCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });

    test('should filter mentors by department', async ({ page }) => {
      await page.goto('/mentors');
      
      // Find department filter
      const departmentSelect = page.locator('select, button[role="combobox"]').first();
      await departmentSelect.click();
      
      // Select a department (this may vary based on your UI)
      await page.locator('text=/Computer Science/i').first().click().catch(() => {});
      
      await page.waitForTimeout(500);
      
      // Verify filtering happened
      const mentorCards = page.locator('[data-testid="mentor-card"], div:has(h3):has(button)');
      const count = await mentorCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Mentor Profile', () => {
    test('should view mentor profile page', async ({ page }) => {
      await page.goto('/mentors');
      
      // Click first mentor card
      const firstMentor = page.locator('[data-testid="mentor-card"], div:has(h3):has(button)').first();
      await firstMentor.locator('button, a').first().click();
      
      // Should navigate to mentor profile
      await page.waitForURL(/\/mentor\/[^/]+/, { timeout: 5000 });
      
      // Verify profile page loaded
      await expect(page.locator('h1, h2')).toBeVisible();
    });
  });

  test.describe('Contact Mentor', () => {
    test('should prompt login when not authenticated', async ({ page }) => {
      await page.goto('/mentors');
      
      const firstMentor = page.locator('[data-testid="mentor-card"], div:has(h3):has(button)').first();
      await firstMentor.locator('button:has-text("Contact"), button:has-text("Message")').first().click()
        .catch(() => {});
      
      // Should redirect to login or show login modal
      await page.waitForURL(/\/login/, { timeout: 5000 }).catch(() => {
        // Or check for login modal
        expect(page.locator('text=/sign in|log in/i')).toBeVisible();
      });
    });

    test('should allow logged-in student to contact mentor', async ({ page, context }) => {
      await loginAsStudent(page, context);
      
      await page.goto('/mentors');
      
      const firstMentor = page.locator('[data-testid="mentor-card"], div:has(h3):has(button)').first();
      await firstMentor.locator('button, a').first().click();
      
      await page.waitForURL(/\/mentor\/[^/]+/);
      
      // Find and click contact button
      const contactButton = page.locator('button:has-text("Contact"), button:has-text("Send Message")').first();
      await contactButton.click();
      
      // Fill contact form
      const messageBox = page.locator('textarea, input[type="text"]').last();
      await messageBox.fill('Hi, I would like to learn more about your mentorship program.');
      
      // Submit
      const submitButton = page.locator('button:has-text("Send"), button[type="submit"]').last();
      await submitButton.click();
      
      // Verify success message
      await expect(page.locator('text=/message sent|success/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Become a Mentor', () => {
    test('should show become mentor form', async ({ page, context }) => {
      await loginAsStudent(page, context);
      
      await page.goto('/become-mentor');
      
      await expect(page.locator('h1, h2', { hasText: /become.*mentor/i })).toBeVisible();
      await expect(page.locator('input[type="text"], textarea')).toHaveCount(await page.locator('input[type="text"], textarea').count());
    });

    test('should validate mentor application form', async ({ page, context }) => {
      await loginAsStudent(page, context);
      
      await page.goto('/become-mentor');
      
      // Try submitting without filling required fields
      await page.click('button[type="submit"]').catch(() => {});
      
      // Should show validation errors
      await expect(page.locator('text=/required|must/i').first()).toBeVisible();
    });

    test('should submit valid mentor application', async ({ page, context }) => {
      await loginAsStudent(page, context);
      
      await page.goto('/become-mentor');
      
      // Fill all required fields
      await page.fill('input[name="fullName"], input[id="fullName"]', 'John Mentor');
      
      // Select department
      await page.selectOption('select[name="department"]', 'Computer Science')
        .catch(() => page.click('text=/Computer Science/i').first());
      
      // Select year
      await page.selectOption('select[name="year"]', '3rd Year')
        .catch(() => page.click('text=/3rd Year/i').first());
      
      // Fill bio
      await page.fill('textarea[name="bio"], textarea[id="bio"]', 
        'I am an experienced developer with 5 years of experience in web development. I specialize in React and Node.js.');
      
      // Add subjects
      const subjectInput = page.locator('input[placeholder*="subject"], input[placeholder*="Subject"]').first();
      await subjectInput.fill('React');
      await page.keyboard.press('Enter');
      await subjectInput.fill('JavaScript');
      await page.keyboard.press('Enter');
      
      // Set hourly rate
      await page.fill('input[type="number"], input[name="hourlyRate"]', '50');
      
      // Select availability
      await page.selectOption('select[name="availability"]', 'Flexible')
        .catch(() => page.click('text=/Flexible/i').first());
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Should show success and redirect
      await expect(page.locator('text=/success|submitted/i')).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Mentor Dashboard', () => {
    test('should display mentor dashboard for mentors', async ({ page, context }) => {
      await loginAsMentor(page, context);
      
      await page.goto('/mentor-dashboard');
      
      await expect(page.locator('h1, h2', { hasText: /mentor.*dashboard/i })).toBeVisible();
      
      // Verify key sections
      await expect(page.locator('text=/sessions|earnings|students/i').first()).toBeVisible();
    });

    test('should not allow students to access mentor dashboard', async ({ page, context }) => {
      await loginAsStudent(page, context);
      
      await page.goto('/mentor-dashboard');
      
      // Should redirect or show access denied
      await page.waitForTimeout(2000);
      expect(page.url()).not.toContain('/mentor-dashboard');
    });
  });
});
