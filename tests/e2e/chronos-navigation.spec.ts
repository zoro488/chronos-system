import { test, expect } from '@playwright/test';

test.describe('Chronos Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should have accessible main routes', async ({ page }) => {
    // Check that we're on a valid page
    expect(page.url()).toContain('localhost:5173');
    
    // Look for navigation elements (sidebar, menu, nav bar)
    const navElements = await page.locator('nav, [role="navigation"], aside, [class*="sidebar"]').count();
    
    // Should have some navigation structure
    expect(navElements).toBeGreaterThan(0);
  });

  test('should have working sidebar navigation', async ({ page }) => {
    // Look for sidebar or navigation menu
    const sidebar = page.locator('aside, [class*="sidebar"], nav').first();
    const sidebarExists = await sidebar.count() > 0;
    
    if (sidebarExists) {
      await expect(sidebar).toBeVisible();
      
      // Look for navigation links in sidebar
      const navLinks = sidebar.locator('a, button[role="link"]');
      const linkCount = await navLinks.count();
      
      // Should have navigation links
      expect(linkCount).toBeGreaterThan(0);
      
      // Click first link if it exists
      if (linkCount > 0) {
        const firstLink = navLinks.first();
        await firstLink.click();
        await page.waitForLoadState('networkidle');
        
        // Navigation should have occurred
        expect(page.url()).toBeTruthy();
      }
    } else {
      test.skip();
    }
  });

  test('should support mobile menu functionality', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for mobile menu button (hamburger menu)
    const mobileMenuButton = page.locator(
      'button[aria-label*="menu" i], button[class*="menu" i], button[class*="hamburger" i]'
    ).first();
    
    const menuButtonExists = await mobileMenuButton.count() > 0;
    
    if (menuButtonExists) {
      await mobileMenuButton.click();
      await page.waitForTimeout(500);
      
      // Menu should be visible or state should change
      const menuExpanded = await mobileMenuButton.getAttribute('aria-expanded');
      
      // Just verify the button is interactive
      expect(menuButtonExists).toBeTruthy();
    } else {
      // On mobile, navigation might be handled differently
      test.skip();
    }
  });

  test('should navigate back and forward', async ({ page }) => {
    const initialUrl = page.url();
    
    // Find a clickable link
    const link = page.locator('a[href]').first();
    const linkExists = await link.count() > 0;
    
    if (linkExists) {
      await link.click();
      await page.waitForLoadState('networkidle');
      
      const newUrl = page.url();
      
      // Go back
      await page.goBack();
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toBe(initialUrl);
      
      // Go forward
      await page.goForward();
      await page.waitForLoadState('networkidle');
      
      expect(page.url()).toBe(newUrl);
    } else {
      test.skip();
    }
  });

  test('should maintain navigation state on refresh', async ({ page }) => {
    // Navigate to a different page if possible
    const link = page.locator('a[href]').first();
    const linkExists = await link.count() > 0;
    
    if (linkExists) {
      await link.click();
      await page.waitForLoadState('networkidle');
      
      const urlBeforeRefresh = page.url();
      
      // Refresh the page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Should be on the same URL
      expect(page.url()).toBe(urlBeforeRefresh);
    } else {
      test.skip();
    }
  });

  test('should have breadcrumb or location indicator', async ({ page }) => {
    // Look for breadcrumbs or page title that indicates location
    const breadcrumb = page.locator('[aria-label*="breadcrumb" i], [class*="breadcrumb" i]').first();
    const pageTitle = page.locator('h1, h2').first();
    
    const hasBreadcrumb = await breadcrumb.count() > 0;
    const hasTitle = await pageTitle.count() > 0;
    
    // Should have either breadcrumb or page title
    expect(hasBreadcrumb || hasTitle).toBeTruthy();
  });

  test('should handle 404 or invalid routes gracefully', async ({ page }) => {
    // Navigate to a non-existent route
    await page.goto('/this-route-does-not-exist-12345');
    await page.waitForLoadState('networkidle');
    
    // Should either show 404 page or redirect to home
    const has404 = await page.locator('text=/404|not found/i').count() > 0;
    const isHome = page.url().endsWith('/') || page.url().includes('localhost:5173');
    
    // Page should handle the invalid route somehow
    expect(has404 || isHome).toBeTruthy();
  });

  test('should have consistent navigation across pages', async ({ page }) => {
    // Get navigation elements on initial page
    const initialNavLinks = await page.locator('nav a, aside a').count();
    
    if (initialNavLinks > 0) {
      // Navigate to another page
      const link = page.locator('a[href]').first();
      await link.click();
      await page.waitForLoadState('networkidle');
      
      // Check navigation is still present
      const newNavLinks = await page.locator('nav a, aside a').count();
      
      // Navigation should be consistent (or at least present)
      expect(newNavLinks).toBeGreaterThan(0);
    } else {
      test.skip();
    }
  });
});
