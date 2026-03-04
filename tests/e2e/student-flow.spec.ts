import { test, expect } from '@playwright/test';
import { loginAsStudent } from '../utils/auth-helpers';
import { waitForToast } from '../utils/test-helpers';

/**
 * E2E Tests for Student Dashboard and Features
 */

test.describe('Student Dashboard', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsStudent(page, context);
  });

  test('should display student dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('h1, h2', { hasText: /student.*dashboard/i })).toBeVisible();
    
    // Verify key sections
    await expect(page.locator('text=/sessions|mentors|upcoming/i').first()).toBeVisible();
  });

  test('should show upcoming sessions', async ({ page }) => {
    await page.goto('/dashboard');
    
    const sessionsSection = page.locator('text=/upcoming.*sessions/i').first();
    await expect(sessionsSection).toBeVisible();
  });

  test('should show contacted mentors', async ({ page }) => {
    await page.goto('/dashboard');
    
    const contactsSection = page.locator('text=/contacted.*mentors/i').first();
    await expect(contactsSection).toBeVisible();
  });

  test('should navigate to mentors page from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    const findMentorButton = page.locator('button:has-text("Find"), a:has-text("Browse Mentors")').first();
    await findMentorButton.click();
    
    await expect(page).toHaveURL(/\/mentors/);
  });
});

test.describe('Profile Management', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsStudent(page, context);
  });

  test('should access edit profile page', async ({ page }) => {
    await page.goto('/edit-profile');
    
    await expect(page.locator('h1, h2', { hasText: /edit.*profile/i })).toBeVisible();
  });

  test('should update profile information', async ({ page }) => {
    await page.goto('/edit-profile');
    
    const bioInput = page.locator('textarea[name="bio"], textarea[id="bio"]');
    await bioInput.fill('Updated bio for testing purposes.');
    
    const saveButton = page.locator('button[type="submit"], button:has-text("Save")');
    await saveButton.click();
    
    await waitForToast(page);
    await expect(page.locator('text=/success|saved|updated/i')).toBeVisible({ timeout: 5000 });
  });

  test('should add subjects to profile', async ({ page }) => {
    await page.goto('/edit-profile');
    
    const subjectInput = page.locator('input[placeholder*="subject"], input[placeholder*="Subject"]').first();
    await subjectInput.fill('Machine Learning');
    await page.keyboard.press('Enter');
    
    // Verify subject was added
    await expect(page.locator('text=/Machine Learning/i')).toBeVisible();
    
    // Save
    await page.click('button[type="submit"], button:has-text("Save")');
    await waitForToast(page);
  });

  test('should remove subjects from profile', async ({ page }) => {
    await page.goto('/edit-profile');
    
    // Add a subject first
    const subjectInput = page.locator('input[placeholder*="subject"]').first();
    await subjectInput.fill('Test Subject');
    await page.keyboard.press('Enter');
    
    // Remove it
    const removeButton = page.locator('button[aria-label*="Remove"], button:has(svg)').last();
    await removeButton.click();
    
    // Verify it's removed
    await expect(page.locator('text=/Test Subject/i')).not.toBeVisible();
  });
});

test.describe('Study Assistant', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsStudent(page, context);
  });

  test('should access study assistant', async ({ page }) => {
    await page.goto('/study-assistant');
    
    await expect(page.locator('h1, h2', { hasText: /study.*assistant/i })).toBeVisible();
  });

  test('should display suggested questions', async ({ page }) => {
    await page.goto('/study-assistant');
    
    const suggestedQuestion = page.locator('button:has-text("How")').first();
    await expect(suggestedQuestion).toBeVisible();
  });

  test('should send a message to study assistant', async ({ page }) => {
    await page.goto('/study-assistant');
    
    const messageInput = page.locator('input[type="text"], textarea').last();
    await messageInput.fill('What is the Pythagorean theorem?');
    
    const sendButton = page.locator('button[type="submit"], button:has-text("Send")').last();
    await sendButton.click();
    
    // Verify message was sent (check for user message in chat)
    await expect(page.locator('text=/Pythagorean theorem/i')).toBeVisible();
    
    // Wait for AI response (with loading indicator)
    await page.waitForSelector('[class*="animate-spin"]', { state: 'attached', timeout: 2000 })
      .catch(() => {});
  });

  test('should use suggested question', async ({ page }) => {
    await page.goto('/study-assistant');
    
    const suggestedButton = page.locator('button:has-text("quadratic")').first();
    await suggestedButton.click();
    
    // Should send the question
    await expect(page.locator('text=/quadratic/i')).toBeVisible();
  });
});

test.describe('Messaging', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsStudent(page, context);
  });

  test('should access chat page', async ({ page }) => {
    await page.goto('/chat');
    
    await expect(page.locator('h2, h3', { hasText: /messages/i })).toBeVisible();
  });

  test('should display conversation list', async ({ page }) => {
    await page.goto('/chat');
    
    const conversationsList = page.locator('[data-testid="conversations-list"], div:has(h2:has-text("Messages"))');
    await expect(conversationsList).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test.beforeEach(async ({ page, context }) => {
    await loginAsStudent(page, context);
  });

  test('should navigate between pages via navbar', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Navigate to mentors
    await page.click('a:has-text("Mentors"), a:has-text("Find Mentors")');
    await expect(page).toHaveURL(/\/mentors/);
    
    // Navigate to study assistant
    await page.click('a:has-text("Study"), a:has-text("Assistant")').catch(() => {});
    
    // Navigate to chat
    await page.click('a:has-text("Chat"), a:has-text("Messages")').catch(() => {});
  });

  test('should maintain session across page refreshes', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Refresh page
    await page.reload();
    
    // Should still be on dashboard (not redirected to login)
    await expect(page).toHaveURL(/\/(dashboard|home)/);
    await expect(page.locator('text=/Log Out|Profile/i')).toBeVisible();
  });
});
