import { Page, BrowserContext } from '@playwright/test';
import { testUser, testMentor, waitForNetworkIdle } from './test-helpers';

/**
 * Authentication Helper Functions
 * Reusable functions for login/logout across tests
 */

/**
 * Login as a student user
 */
export async function loginAsStudent(page: Page, context: BrowserContext) {
  await page.goto('/login');
  
  await page.fill('input[type="email"]', testUser.email);
  await page.fill('input[type="password"]', testUser.password);
  
  await page.click('button[type="submit"]');
  
  // Wait for redirect
  await page.waitForURL(/\/(home|dashboard)/, { timeout: 15000 });
  await waitForNetworkIdle(page);
}

/**
 * Login as a mentor user
 */
export async function loginAsMentor(page: Page, context: BrowserContext) {
  await page.goto('/login');
  
  await page.fill('input[type="email"]', testMentor.email);
  await page.fill('input[type="password"]', testMentor.password);
  
  await page.click('button[type="submit"]');
  
  // Wait for redirect
  await page.waitForURL(/\/mentor-dashboard/, { timeout: 15000 });
  await waitForNetworkIdle(page);
}

/**
 * Login with custom credentials
 */
export async function loginWithCredentials(
  page: Page,
  email: string,
  password: string
) {
  await page.goto('/login');
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(2000); // Wait for any redirect
}

/**
 * Logout from the application
 */
export async function logout(page: Page) {
  // Try to find logout button (might be in dropdown or direct button)
  const logoutButton = page.locator('button:has-text("Log Out"), a:has-text("Log Out")').first();
  
  // If in dropdown, open it first
  const profileButton = page.locator('button:has([data-testid="user-avatar"]), button:has-text("Profile")').first();
  if (await profileButton.isVisible()) {
    await profileButton.click();
    await page.waitForTimeout(300);
  }
  
  await logoutButton.click();
  
  // Wait for redirect to home/login
  await page.waitForURL(/\/($|login)/, { timeout: 5000 });
}

/**
 * Check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Check for presence of logout button or user avatar
    await page.waitForSelector(
      'button:has-text("Log Out"), [data-testid="user-avatar"], button:has-text("Profile")',
      { timeout: 2000 }
    );
    return true;
  } catch {
    return false;
  }
}

/**
 * Setup authenticated session using Supabase tokens
 * (Advanced: Bypasses UI login for faster tests)
 */
export async function setAuthToken(page: Page, accessToken: string, refreshToken: string) {
  await page.evaluate(
    ({ access, refresh }) => {
      const authData = {
        access_token: access,
        refresh_token: refresh,
        expires_in: 3600,
        token_type: 'bearer',
        user: { id: 'test-user-id' },
      };
      localStorage.setItem('supabase.auth.token', JSON.stringify(authData));
    },
    { access: accessToken, refresh: refreshToken }
  );
}

/**
 * Clear authentication state
 */
export async function clearAuth(page: Page) {
  await page.evaluate(() => {
    // Clear all Supabase-related localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.includes('supabase')) {
        localStorage.removeItem(key);
      }
    });
  });
}

/**
 * Get current user from localStorage
 */
export async function getCurrentUser(page: Page) {
  return await page.evaluate(() => {
    const authData = localStorage.getItem('supabase.auth.token');
    if (!authData) return null;
    try {
      return JSON.parse(authData);
    } catch {
      return null;
    }
  });
}

/**
 * Wait for auth state to be loaded
 */
export async function waitForAuthState(page: Page, timeout = 5000) {
  await page.waitForFunction(
    () => {
      // Wait for auth context to be initialized
      return document.body.dataset.authLoaded === 'true' ||
             localStorage.getItem('supabase.auth.token') !== null;
    },
    { timeout }
  ).catch(() => {
    // If timeout, auth might not be required for this page
  });
}
