import { test, expect } from '@playwright/test';
import { testUser, generateUniqueEmail, generatePassword } from '../utils/test-helpers';

/**
 * E2E Tests for Authentication Flow
 * Covers: Sign up, Login, Logout, Password Reset
 */

test.describe('Authentication', () => {
  test.describe('Sign Up', () => {
    test('should successfully sign up as a student', async ({ page }) => {
      const email = generateUniqueEmail();
      const password = generatePassword();
      const fullName = 'Test Student User';

      await page.goto('/signup');
      
      // Verify we're on the signup page
      await expect(page.locator('h1, h2', { hasText: /create your account/i })).toBeVisible();
      
      // Fill in form
      await page.fill('input[type="text"]', fullName);
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      
      // Select student role
      await page.click('label[for="student"]');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should show success toast and redirect
      await expect(page.locator('text=/Account created/i')).toBeVisible({ timeout: 10000 });
    });

    test('should successfully sign up as a mentor', async ({ page }) => {
      const email = generateUniqueEmail();
      const password = generatePassword();
      const fullName = 'Test Mentor User';

      await page.goto('/signup');
      
      await page.fill('input[type="text"]', fullName);
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      
      // Select mentor role
      await page.click('label[for="mentor"]');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=/Account created/i')).toBeVisible({ timeout: 10000 });
    });

    test('should show error for invalid email', async ({ page }) => {
      await page.goto('/signup');
      
      await page.fill('input[type="text"]', 'Test User');
      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', 'password123');
      await page.click('label[for="student"]');
      
      await page.click('button[type="submit"]');
      
      // Should show validation error
      await expect(page.locator('text=/valid email/i')).toBeVisible();
    });

    test('should show error for short password', async ({ page }) => {
      await page.goto('/signup');
      
      await page.fill('input[type="text"]', 'Test User');
      await page.fill('input[type="email"]', generateUniqueEmail());
      await page.fill('input[type="password"]', '12345'); // Less than 6 characters
      await page.click('label[for="student"]');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=/at least 6 characters/i')).toBeVisible();
    });

    test('should show error for short name', async ({ page }) => {
      await page.goto('/signup');
      
      await page.fill('input[type="text"]', 'A'); // Less than 2 characters
      await page.fill('input[type="email"]', generateUniqueEmail());
      await page.fill('input[type="password"]', 'password123');
      await page.click('label[for="student"]');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=/at least 2 characters/i')).toBeVisible();
    });
  });

  test.describe('Login', () => {
    test('should successfully login with valid credentials', async ({ page }) => {
      // Note: This requires a pre-existing test account in your Supabase
      await page.goto('/login');
      
      await expect(page.locator('h1, h2', { hasText: /welcome back/i })).toBeVisible();
      
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      
      await page.click('button[type="submit"]');
      
      // Should redirect to appropriate dashboard
      await page.waitForURL(/\/(home|dashboard|mentor-dashboard)/, { timeout: 10000 });
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.fill('input[type="email"]', 'nonexistent@test.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=/invalid.*credentials/i')).toBeVisible({ timeout: 5000 });
    });

    test('should show error for empty fields', async ({ page }) => {
      await page.goto('/login');
      
      await page.click('button[type="submit"]');
      
      // HTML5 validation should prevent submission
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toHaveAttribute('required', '');
    });
  });

  test.describe('Logout', () => {
    test('should successfully logout', async ({ page, context }) => {
      // Login first
      await page.goto('/login');
      await page.fill('input[type="email"]', testUser.email);
      await page.fill('input[type="password"]', testUser.password);
      await page.click('button[type="submit"]');
      await page.waitForURL(/\/(home|dashboard)/, { timeout: 10000 });
      
      // Click logout (usually in navbar)
      await page.click('button:has-text("Log Out"), a:has-text("Log Out")');
      
      // Should redirect to home or login
      await page.waitForURL(/\/($|login)/, { timeout: 5000 });
      
      // Verify we're logged out by checking for login button
      await expect(page.locator('a:has-text("Log In"), button:has-text("Log In")')).toBeVisible();
    });
  });

  test.describe('Password Reset', () => {
    test('should show forgot password page', async ({ page }) => {
      await page.goto('/forgot-password');
      
      await expect(page.locator('h1, h2', { hasText: /forgot.*password/i })).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });

    test('should submit forgot password request', async ({ page }) => {
      await page.goto('/forgot-password');
      
      await page.fill('input[type="email"]', testUser.email);
      await page.click('button[type="submit"]');
      
      // Should show success message
      await expect(page.locator('text=/check your email/i')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Navigation', () => {
    test('should navigate between login and signup', async ({ page }) => {
      await page.goto('/login');
      
      await page.click('a:has-text("Sign up")');
      await expect(page).toHaveURL(/\/signup/);
      
      await page.click('a:has-text("Log in")');
      await expect(page).toHaveURL(/\/login/);
    });
  });
});
