import { test, expect } from '@playwright/test';

test.describe('Tab Navigation URL Query String Sync & Browser History Fix', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Authenticate via genuine login
    await page.goto('/login');
    const identifierInput = page.locator('#signin-email');
    const passwordInput = page.locator('#signin-password');
    const loginButton = page.locator('button[type="submit"]');

    await expect(identifierInput).toBeVisible({ timeout: 10000 });
    await identifierInput.fill('admin');
    await passwordInput.fill('Password@123');
    await loginButton.click();

    // Wait for redirect to home '/'
    await page.waitForURL('/', { timeout: 15000 });
    await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
  });

  test('R1: window.location.replace removes /login from history stack on login', async ({ page }) => {
    // We arrived at '/' via login replace redirect.
    expect(page.url()).toBe('http://localhost:3005/');

    // Attempting to go back should not land back on /login
    await page.goBack();
    // URL should still be '/' (or about:blank/empty if history had nothing prior), NOT '/login'
    expect(page.url()).not.toContain('/login');
  });

  test('R1: Auth Guard redirects authenticated user away from /login to /', async ({ page }) => {
    // User is already authenticated in this session context
    await page.goto('/login');

    // Auth Guard must automatically redirect back to '/'
    await page.waitForURL('http://localhost:3005/', { timeout: 10000 });
    expect(page.url()).toBe('http://localhost:3005/');
  });

  test('R2: Synchronizes activeTab with ?tab= query parameter on click', async ({ page }) => {
    // Click Cây đơn vị quân đội
    const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
    await expect(unitTab).toBeVisible();
    await unitTab.click();

    await expect(page).toHaveURL(/tab=units/);
    expect(page.url()).toContain('?tab=units');

    // Click Quy chế chấm điểm
    const criteriaTab = page.getByRole('button', { name: /quy chế/i });
    await expect(criteriaTab).toBeVisible();
    await criteriaTab.click();

    await expect(page).toHaveURL(/tab=criteria/);
    expect(page.url()).toContain('?tab=criteria');
  });

  test('R2: Browser Back and Forward buttons navigate through tab history', async ({ page }) => {
    // Switch to units
    await page.getByRole('button', { name: /cây đơn vị quân đội/i }).click();
    await expect(page).toHaveURL(/tab=units/);

    // Switch to criteria
    await page.getByRole('button', { name: /quy chế/i }).click();
    await expect(page).toHaveURL(/tab=criteria/);

    // Browser Back -> returns to units
    await page.goBack();
    await expect(page).toHaveURL(/tab=units/);
    await expect(page.getByRole('button', { name: /cây đơn vị quân đội/i })).toHaveClass(/bg-\[#b91c1c\]/);

    // Browser Back -> returns to home (platoon_summary)
    await page.goBack();
    await expect(page.getByRole('button', { name: /bảng theo dõi thi đua/i })).toHaveClass(/bg-\[#b91c1c\]/);

    // Browser Forward -> returns to units
    await page.goForward();
    await expect(page).toHaveURL(/tab=units/);

    // Browser Forward -> returns to criteria
    await page.goForward();
    await expect(page).toHaveURL(/tab=criteria/);
  });

  test('R2: Deep linking to ?tab= renders corresponding view directly', async ({ page }) => {
    await page.goto('/?tab=units');
    await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
    expect(page.url()).toContain('?tab=units');

    // Verify Unit Management tab is active in sidebar
    const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
    await expect(unitTab).toBeVisible();
    await expect(unitTab).toHaveClass(/bg-\[#b91c1c\]/);
  });

  test('R2: Invalid ?tab falls back safely to platoon_summary', async ({ page }) => {
    await page.goto('/?tab=non_existent_tab_123');
    await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });

    // Fallback tab platoon_summary should be active
    const platoonTab = page.locator('aside button[data-tab-id="platoon_summary"]');
    await expect(platoonTab).toBeVisible();
    await expect(platoonTab).toHaveClass(/bg-\[#b91c1c\]/);
  });

  test('R2: Quick scoring button from Unit Management navigates to daily_scoring and preserves browser history back', async ({ page }) => {
    // 1. Navigate to units tab
    const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
    await expect(unitTab).toBeVisible();
    await unitTab.click();
    await expect(page).toHaveURL(/tab=units/);

    // 2. Click quick scoring button on unit card
    const quickScoreBtn = page.getByRole('button', { name: /nhập điểm/i }).first();
    await expect(quickScoreBtn).toBeVisible({ timeout: 10000 });
    await quickScoreBtn.click();

    // 3. Verify URL is updated to daily_scoring and sidebar reflects active state
    await expect(page).toHaveURL(/tab=daily_scoring/);
    const scoringTab = page.getByRole('button', { name: /(nhập|bảng) điểm thi đua/i });
    await expect(scoringTab).toBeVisible();
    await expect(scoringTab).toHaveClass(/bg-\[#b91c1c\]/);

    // 4. Browser Back returns seamlessly to units tab
    await page.goBack();
    await expect(page).toHaveURL(/tab=units/);
    await expect(unitTab).toHaveClass(/bg-\[#b91c1c\]/);
  });
});
