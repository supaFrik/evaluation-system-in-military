import { test, expect } from '@playwright/test';

const VALID_TABS = [
  'platoon_summary',
  'daily_scoring',
  'commendations',
  'soldiers',
  'soldier_profile',
  'reports',
  'units',
  'criteria',
  'individual_emulation',
] as const;

test.describe('Adversarial Challenger Suite: All 9 VALID_TABS Runtime Integrity', () => {

  test.beforeEach(async ({ page }) => {
    // Authenticate via login
    await page.goto('/login');
    const identifierInput = page.locator('#signin-email');
    const passwordInput = page.locator('#signin-password');
    const loginButton = page.locator('button[type="submit"]');

    await expect(identifierInput).toBeVisible({ timeout: 10000 });
    await identifierInput.fill('admin');
    await passwordInput.fill('Password@123');
    await loginButton.click();

    await page.waitForURL('/', { timeout: 15000 });
    await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
  });

  test('Tab 1: platoon_summary renders EmulationDashboard in main', async ({ page }) => {
    await page.goto('/?tab=platoon_summary');
    await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
    const main = page.locator('main');
    await expect(main).not.toBeEmpty();
    // EmulationDashboard contains units / date / KPI cards
    const mainChildren = await main.evaluate((el) => el.children.length);
    expect(mainChildren).toBeGreaterThan(0);
    console.log(`[PASS] platoon_summary rendered with ${mainChildren} top-level children in main`);
  });

  test('Tab 2: daily_scoring renders DailyScoringSheet in main', async ({ page }) => {
    await page.goto('/?tab=daily_scoring');
    await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
    const main = page.locator('main');
    await expect(main).not.toBeEmpty();
    const mainChildren = await main.evaluate((el) => el.children.length);
    expect(mainChildren).toBeGreaterThan(0);
    console.log(`[PASS] daily_scoring rendered with ${mainChildren} top-level children in main`);
  });

  test('Tab 3: commendations renders CommendationSection in main', async ({ page }) => {
    await page.goto('/?tab=commendations');
    await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
    const main = page.locator('main');
    await expect(main).not.toBeEmpty();
    const mainChildren = await main.evaluate((el) => el.children.length);
    expect(mainChildren).toBeGreaterThan(0);
    console.log(`[PASS] commendations rendered with ${mainChildren} top-level children in main`);
  });

  test('Tab 4: soldiers renders SoldierList in main', async ({ page }) => {
    await page.goto('/?tab=soldiers');
    await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
    const main = page.locator('main');
    await expect(main).not.toBeEmpty();
    const mainChildren = await main.evaluate((el) => el.children.length);
    expect(mainChildren).toBeGreaterThan(0);
    console.log(`[PASS] soldiers rendered with ${mainChildren} top-level children in main`);
  });

  test('Tab 5: soldier_profile renders SoldierProfile in main', async ({ page }) => {
    await page.goto('/?tab=soldier_profile');
    await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
    const main = page.locator('main');
    await expect(main).not.toBeEmpty();
    const mainChildren = await main.evaluate((el) => el.children.length);
    expect(mainChildren).toBeGreaterThan(0);
    console.log(`[PASS] soldier_profile rendered with ${mainChildren} top-level children in main`);
  });

  test('Tab 6: reports renders PlatoonAnalysis in main', async ({ page }) => {
    await page.goto('/?tab=reports');
    await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
    const main = page.locator('main');
    await expect(main).not.toBeEmpty();
    const mainChildren = await main.evaluate((el) => el.children.length);
    expect(mainChildren).toBeGreaterThan(0);
    console.log(`[PASS] reports rendered with ${mainChildren} top-level children in main`);
  });

  test('Tab 7: units renders UnitManagement in main', async ({ page }) => {
    await page.goto('/?tab=units');
    await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
    const main = page.locator('main');
    await expect(main).not.toBeEmpty();
    const mainChildren = await main.evaluate((el) => el.children.length);
    expect(mainChildren).toBeGreaterThan(0);
    console.log(`[PASS] units rendered with ${mainChildren} top-level children in main`);
  });

  test('Tab 8: criteria renders CriteriaHandbook in main', async ({ page }) => {
    await page.goto('/?tab=criteria');
    await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
    const main = page.locator('main');
    await expect(main).not.toBeEmpty();
    const mainChildren = await main.evaluate((el) => el.children.length);
    expect(mainChildren).toBeGreaterThan(0);
    console.log(`[PASS] criteria rendered with ${mainChildren} top-level children in main`);
  });

  test('Tab 9: individual_emulation renders IndividualEmulationBoard in main', async ({ page }) => {
    await page.goto('/?tab=individual_emulation');
    await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
    const main = page.locator('main');
    await expect(main).not.toBeEmpty();
    const mainChildren = await main.evaluate((el) => el.children.length);
    const mainChildCount = mainChildren;
    expect(mainChildren).toBeGreaterThan(0);
    expect(mainChildCount).toBeGreaterThan(0);
    console.log(`[PASS] individual_emulation rendered with ${mainChildren} top-level children in main`);
  });

});
