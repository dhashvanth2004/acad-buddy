/**
 * Test Helper Utilities
 * Common functions used across E2E tests
 */

/**
 * Generate a unique email for testing
 */
export function generateUniqueEmail(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `test.user.${timestamp}.${random}@acadbuddy.test`;
}

/**
 * Generate a secure password
 */
export function generatePassword(): string {
  return `TestPass${Math.floor(Math.random() * 100000)}!`;
}

/**
 * Test user credentials (requires pre-existing account in Supabase)
 */
export const testUser = {
  email: process.env.TEST_USER_EMAIL || 'test.student@acadbuddy.test',
  password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
  role: 'student' as const,
};

export const testMentor = {
  email: process.env.TEST_MENTOR_EMAIL || 'test.mentor@acadbuddy.test',
  password: process.env.TEST_MENTOR_PASSWORD || 'TestPassword123!',
  role: 'mentor' as const,
};

/**
 * Wait for network to be idle
 */
export async function waitForNetworkIdle(page: any, timeout = 2000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Generate test data for mentor
 */
export function generateMentorData() {
  return {
    fullName: `Test Mentor ${Date.now()}`,
    department: 'Computer Science',
    year: '3rd Year',
    bio: 'Experienced software engineer with 5 years of experience in full-stack development. Passionate about teaching and helping students succeed.',
    subjects: ['React', 'JavaScript', 'Python', 'Node.js'],
    hourlyRate: 50,
    availability: 'Flexible',
  };
}

/**
 * Generate test data for student
 */
export function generateStudentData() {
  return {
    fullName: `Test Student ${Date.now()}`,
    department: 'Computer Science',
    year: '2nd Year',
  };
}

/**
 * Take a screenshot with a custom name
 */
export async function takeScreenshot(page: any, name: string) {
  await page.screenshot({ path: `test-results/screenshots/${name}-${Date.now()}.png` });
}

/**
 * Wait for toast notification
 */
export async function waitForToast(page: any, text?: string) {
  const toastSelector = text 
    ? `[role="status"]:has-text("${text}"), [role="alert"]:has-text("${text}")`
    : '[role="status"], [role="alert"]';
  
  await page.waitForSelector(toastSelector, { timeout: 10000 });
}

/**
 * Clear all localStorage
 */
export async function clearStorage(page: any) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Get localStorage value
 */
export async function getLocalStorage(page: any, key: string) {
  return await page.evaluate((k: string) => localStorage.getItem(k), key);
}

/**
 * Set localStorage value
 */
export async function setLocalStorage(page: any, key: string, value: string) {
  await page.evaluate(
    ({ k, v }: { k: string; v: string }) => localStorage.setItem(k, v),
    { k: key, v: value }
  );
}

/**
 * Mock Supabase responses for testing
 */
export function mockSupabaseResponse(page: any, path: string, response: any) {
  return page.route(`**/${path}`, (route: any) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Fill form with retry logic
 */
export async function fillFormField(page: any, selector: string, value: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await page.fill(selector, value);
      break;
    } catch (error) {
      if (i === retries - 1) throw error;
      await page.waitForTimeout(500);
    }
  }
}

/**
 * Check if element exists without throwing
 */
export async function elementExists(page: any, selector: string): Promise<boolean> {
  try {
    await page.waitForSelector(selector, { timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(page: any, selector: string) {
  await page.evaluate((sel: string) => {
    const element = document.querySelector(sel);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, selector);
}

/**
 * Generate random string
 */
export function randomString(length = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
