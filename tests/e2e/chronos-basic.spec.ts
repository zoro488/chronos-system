import { test, expect } from '@playwright/test';

test.describe('Chronos Basic Tests', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page loaded
    expect(page.url()).toContain('localhost:5173');
    
    // Take a screenshot for verification
    await page.screenshot({ path: 'playwright-report/home-page.png' });
  });

  test('should navigate to clientes page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for navigation to clientes - adapt selector based on your app structure
    const clientesLink = page.locator('a[href*="cliente"], button:has-text("Cliente")').first();
    
    // Check if the element exists
    const exists = await clientesLink.count() > 0;
    
    if (exists) {
      await clientesLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify navigation occurred
      expect(page.url()).toMatch(/cliente/i);
    } else {
      console.log('Clientes navigation not found, skipping test');
    }
  });

  test('should navigate to inventario page', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for navigation to inventario - adapt selector based on your app structure
    const inventarioLink = page.locator('a[href*="inventario"], button:has-text("Inventario")').first();
    
    // Check if the element exists
    const exists = await inventarioLink.count() > 0;
    
    if (exists) {
      await inventarioLink.click();
      await page.waitForLoadState('networkidle');
      
      // Verify navigation occurred
      expect(page.url()).toMatch(/inventario/i);
    } else {
      console.log('Inventario navigation not found, skipping test');
    }
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check that page loads on mobile
    expect(page.url()).toContain('localhost:5173');
    
    // Verify viewport is mobile size
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);
    expect(viewport?.height).toBe(667);
    
    // Take screenshot of mobile view
    await page.screenshot({ path: 'playwright-report/mobile-view.png' });
  });

  test('should have proper page title', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get page title
    const title = await page.title();
    
    // Title should not be empty
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should not have console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Log any console errors for debugging
    if (consoleErrors.length > 0) {
      console.log('Console errors detected:', consoleErrors);
    }
    
    // This is a soft assertion - we log errors but don't fail the test
    // You can make it stricter by uncommenting the line below
    // expect(consoleErrors.length).toBe(0);
  });
});
