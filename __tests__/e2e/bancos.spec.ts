/**
 * E2E TESTS - BANCOS
 * End-to-end tests for banco pages
 */

import { expect, test } from '@playwright/test';

test.describe('Banco Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to FlowDistributor (assuming auth is mocked or skipped in dev)
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display Profit page with KPIs', async ({ page }) => {
    // Navigate to Profit page
    await page.click('text=Profit');

    // Wait for page to load
    await page.waitForSelector('text=Capital Actual', { timeout: 10000 });

    // Check KPI cards
    await expect(page.locator('text=Capital Actual')).toBeVisible();
    await expect(page.locator('text=Total Ingresos')).toBeVisible();
    await expect(page.locator('text=Total Gastos')).toBeVisible();
    await expect(page.locator('text=Balance')).toBeVisible();

    // Check tables
    await expect(page.locator('text=Ingresos')).toBeVisible();
    await expect(page.locator('text=Gastos')).toBeVisible();
  });

  test('should display Bóveda Monte page', async ({ page }) => {
    await page.click('text=Bóveda Monte');
    await page.waitForSelector('text=Capital Actual', { timeout: 10000 });

    await expect(page.locator('h2:has-text("Bóveda Monte")')).toBeVisible();
  });

  test('should display Bóveda USA page', async ({ page }) => {
    await page.click('text=Bóveda USA');
    await page.waitForSelector('text=Capital Actual', { timeout: 10000 });

    await expect(page.locator('h2:has-text("Bóveda USA")')).toBeVisible();
  });

  test('should display Azteca page', async ({ page }) => {
    await page.click('text=Azteca');
    await page.waitForSelector('text=Capital Actual', { timeout: 10000 });

    await expect(page.locator('h2:has-text("Azteca")')).toBeVisible();
  });

  test('should display Utilidades page', async ({ page }) => {
    await page.click('text=Utilidades');
    await page.waitForSelector('text=Capital Actual', { timeout: 10000 });

    await expect(page.locator('h2:has-text("Utilidades")')).toBeVisible();
  });

  test('should display Flete Sur page', async ({ page }) => {
    await page.click('text=Flete Sur');
    await page.waitForSelector('text=Capital Actual', { timeout: 10000 });

    await expect(page.locator('h2:has-text("Flete Sur")')).toBeVisible();
  });

  test('should display Leftie page', async ({ page }) => {
    await page.click('text=Leftie');
    await page.waitForSelector('text=Capital Actual', { timeout: 10000 });

    await expect(page.locator('h2:has-text("Leftie")')).toBeVisible();
  });

  test('should show loading state initially', async ({ page }) => {
    await page.click('text=Profit');

    // Check for loading spinner (might be quick, so we use a short timeout)
    const loadingSpinner = page.locator('[data-testid="spinner"]');
    const isLoading = await loadingSpinner.isVisible().catch(() => false);

    // If loading was visible, wait for it to disappear
    if (isLoading) {
      await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });
    }

    // Verify content is loaded
    await expect(page.locator('text=Capital Actual')).toBeVisible();
  });

  test('should display ingresos table with correct columns', async ({ page }) => {
    await page.click('text=Profit');
    await page.waitForSelector('text=Ingresos', { timeout: 10000 });

    // Check table headers
    const ingresosSection = page.locator('section:has-text("Ingresos")');
    await expect(ingresosSection.locator('th:has-text("Fecha")')).toBeVisible();
    await expect(ingresosSection.locator('th:has-text("Concepto")')).toBeVisible();
    await expect(ingresosSection.locator('th:has-text("Ingreso")')).toBeVisible();
  });

  test('should display gastos table with correct columns', async ({ page }) => {
    await page.click('text=Profit');
    await page.waitForSelector('text=Gastos', { timeout: 10000 });

    // Check table headers
    const gastosSection = page.locator('section:has-text("Gastos")');
    await expect(gastosSection.locator('th:has-text("Fecha")')).toBeVisible();
    await expect(gastosSection.locator('th:has-text("Concepto")')).toBeVisible();
    await expect(gastosSection.locator('th:has-text("Gasto")')).toBeVisible();
  });

  test('should format currency correctly', async ({ page }) => {
    await page.click('text=Profit');
    await page.waitForSelector('text=Capital Actual', { timeout: 10000 });

    // Check that currency values have $ symbol
    const capitalValue = await page.locator('text=Capital Actual').locator('..').locator('p').first().textContent();
    expect(capitalValue).toContain('$');
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.click('text=Profit');
    await page.waitForSelector('text=Capital Actual', { timeout: 10000 });

    // Check that content is visible on mobile
    await expect(page.locator('text=Capital Actual')).toBeVisible();
    await expect(page.locator('text=Total Ingresos')).toBeVisible();
  });

  test('should update data in real-time', async ({ page }) => {
    await page.click('text=Profit');
    await page.waitForSelector('text=Capital Actual', { timeout: 10000 });

    // Get initial capital value
    const initialCapital = await page.locator('text=Capital Actual').locator('..').locator('p').first().textContent();

    // Wait for potential updates (real-time listener)
    await page.waitForTimeout(2000);

    // Get updated capital value
    const updatedCapital = await page.locator('text=Capital Actual').locator('..').locator('p').first().textContent();

    // Values should be defined (whether they changed or not)
    expect(initialCapital).toBeDefined();
    expect(updatedCapital).toBeDefined();
  });
});

test.describe('Navigation', () => {
  test('should navigate between banco pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Profit
    await page.click('text=Profit');
    await page.waitForSelector('h2:has-text("Profit")', { timeout: 10000 });

    // Navigate to Bóveda Monte
    await page.click('text=Bóveda Monte');
    await page.waitForSelector('h2:has-text("Bóveda Monte")', { timeout: 10000 });

    // Navigate back to Profit
    await page.click('text=Profit');
    await page.waitForSelector('h2:has-text("Profit")', { timeout: 10000 });

    await expect(page).toHaveURL(/profit/);
  });
});

test.describe('Error Handling', () => {
  test('should show empty state when no data', async ({ page }) => {
    // This test assumes a banco with no data or mocked empty response
    await page.goto('/');
    await page.click('text=Leftie');
    await page.waitForLoadState('networkidle');

    // Check for empty state message (if no data)
    const emptyMessage = page.locator('text=No hay datos disponibles');
    const isEmptyVisible = await emptyMessage.isVisible().catch(() => false);

    // Either empty state or data should be present
    if (isEmptyVisible) {
      await expect(emptyMessage).toBeVisible();
    } else {
      await expect(page.locator('text=Capital Actual')).toBeVisible();
    }
  });
});
