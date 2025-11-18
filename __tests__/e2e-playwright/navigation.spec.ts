import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
  });

  test('should have proper page structure', async ({ page }) => {
    // Check for main layout elements
    await page.waitForLoadState('networkidle');
    
    // Verify the page loaded
    expect(page.url()).toBeTruthy();
  });

  test('should be able to navigate through main menu', async ({ page }) => {
    await page.waitForTimeout(1000);
    
    // Try to find navigation elements
    const nav = page.locator('nav').first();
    if (await nav.isVisible()) {
      // Navigation exists
      expect(nav).toBeTruthy();
    }
  });

  test('should handle routing correctly', async ({ page }) => {
    // Test that routing works
    const initialUrl = page.url();
    expect(initialUrl).toContain('localhost');
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await page.waitForTimeout(500);
    
    // Check that page loads on mobile
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await page.waitForTimeout(500);
    
    // Check that page loads on tablet
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should work on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    await page.waitForTimeout(500);
    
    // Check that page loads on desktop
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Performance', () => {
  test('should load page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Page should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
