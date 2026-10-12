import { test, expect } from '@playwright/test';

test.describe('Adversarial Challenger Suite: Quick Scoring Navigation Stress Test', () => {

  test.beforeEach(async ({ page }) => {
    // Authenticate as ADMIN
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

  test('Adversarial 1: Root unit (Regiment) vs Nested units (Platoon, Squad, Empty Unit) filtering', async ({ page }) => {
    // 1. Navigate to Units Tab
    await page.getByRole('button', { name: /cây đơn vị quân đội/i }).click();
    await expect(page).toHaveURL(/tab=units/);

    // Expand all tree nodes
    const expandAllBtn = page.getByRole('button', { name: /mở rộng tất cả/i });
    if (await expandAllBtn.isVisible()) {
      await expandAllBtn.click();
    }

    // 2. Click "Nhập điểm" on Root Unit (Trung đoàn Bộ Binh 335)
    const rootScoreBtn = page.getByRole('button', { name: 'Nhập điểm thi đua cho Trung đoàn Bộ Binh 335' });
    await expect(rootScoreBtn).toBeVisible({ timeout: 10000 });
    await rootScoreBtn.click();

    // Verify transition to daily_scoring
    await expect(page).toHaveURL(/tab=daily_scoring/);
    await expect(page.getByRole('button', { name: /lưu bảng điểm/i })).toBeVisible({ timeout: 10000 });

    // In Regiment tier, all regiment soldiers are displayed (5 soldiers seeded)
    const regimentSoldierRows = page.locator('tbody tr.table-row-hover');
    const regimentCount = await regimentSoldierRows.count();
    expect(regimentCount).toBe(5);
    console.log(`[PASS] Root Regiment scoring rendered all ${regimentCount} soldiers`);

    // 3. Return to Units Tab and test Nested Squad: Tiểu đội 1 (C1-B1-A1)
    await page.getByRole('button', { name: /cây đơn vị quân đội/i }).click();
    await expect(page).toHaveURL(/tab=units/);

    const searchInput = page.getByPlaceholder(/tìm kiếm đơn vị/i);
    await searchInput.fill('Tiểu đội 1');
    await page.waitForTimeout(300);

    const squad1Btn = page.getByRole('button', { name: 'Nhập điểm thi đua cho Tiểu đội 1' }).first();
    await expect(squad1Btn).toBeVisible({ timeout: 10000 });
    await squad1Btn.click();

    await expect(page).toHaveURL(/tab=daily_scoring/);
    await expect(page.getByRole('button', { name: /lưu bảng điểm/i })).toBeVisible({ timeout: 10000 });

    // Squad 1 has exactly 3 soldiers (s1, s2, s4)
    const squad1SoldierRows = page.locator('tbody tr.table-row-hover');
    const squad1Count = await squad1SoldierRows.count();
    expect(squad1Count).toBe(3);
    console.log(`[PASS] Nested Squad 1 scoring filtered accurately to ${squad1Count} soldiers`);

    // 4. Return to Units Tab and test Empty Nested Squad: Tiểu đội 3 (C1-B1-A3)
    await page.getByRole('button', { name: /cây đơn vị quân đội/i }).click();
    await expect(page).toHaveURL(/tab=units/);

    await searchInput.fill('Tiểu đội 3');
    await page.waitForTimeout(300);

    const squad3Btn = page.getByRole('button', { name: 'Nhập điểm thi đua cho Tiểu đội 3' }).first();
    await expect(squad3Btn).toBeVisible({ timeout: 10000 });
    await squad3Btn.click();

    await expect(page).toHaveURL(/tab=daily_scoring/);
    await expect(page.getByRole('button', { name: /lưu bảng điểm/i })).toBeVisible({ timeout: 10000 });

    // Squad 3 has 0 soldiers -> Graceful empty state banner displayed
    await expect(page.getByText('Chưa có danh sách quân nhân cho đơn vị này')).toBeVisible();
    console.log('[PASS] Empty nested squad correctly rendered graceful fallback empty state');
  });

  test('Adversarial 2: Rapid toggles between Tree View and Table View then Quick Scoring', async ({ page }) => {
    await page.getByRole('button', { name: /cây đơn vị quân đội/i }).click();
    await expect(page).toHaveURL(/tab=units/);

    const treeViewBtn = page.getByRole('button', { name: /cây phân cấp/i });
    const tableViewBtn = page.getByRole('button', { name: /bảng danh sách/i });

    // Rapidly toggle back and forth 4 times
    for (let i = 0; i < 4; i++) {
      await tableViewBtn.click();
      await treeViewBtn.click();
    }

    // Finally stay on Table View
    await tableViewBtn.click();
    await expect(page.getByRole('columnheader', { name: /tên đơn vị/i })).toBeVisible();

    // Rapid search filter and clear
    const searchInput = page.getByPlaceholder(/tìm kiếm đơn vị/i);
    await searchInput.fill('Tiểu đoàn');
    await expect(page.locator('tbody tr').first()).toBeVisible();
    await searchInput.fill('');

    // Click quick score from Table View on the first row with quick score
    const targetRow = page.getByRole('row').filter({
      has: page.getByRole('button', { name: /nhập điểm/i })
    }).first();
    await expect(targetRow).toBeVisible();

    const quickScoreBtn = targetRow.getByRole('button', { name: /nhập điểm/i });
    await quickScoreBtn.click();

    // Verify navigation succeeds without errors
    await expect(page).toHaveURL(/tab=daily_scoring/);
    await expect(page.getByRole('button', { name: /lưu bảng điểm/i })).toBeVisible({ timeout: 10000 });
    console.log('[PASS] Rapid view toggles and table quick score navigation succeeded');
  });

  test('Adversarial 3: Multi-step Browser History traversal (Units -> Score -> Back -> Forward)', async ({ page }) => {
    // 1. Start at home (platoon_summary)
    expect(page.url()).toBe('http://localhost:3005/');

    // 2. Go to Units tab
    const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
    await unitTab.click();
    await expect(page).toHaveURL(/tab=units/);

    // 3. Click quick scoring on Tree View
    const quickScoreBtn = page.getByRole('button', { name: /nhập điểm/i }).first();
    await expect(quickScoreBtn).toBeVisible({ timeout: 10000 });
    await quickScoreBtn.click();
    await expect(page).toHaveURL(/tab=daily_scoring/);

    // 4. Click browser back -> should return to Units tab
    await page.goBack();
    await expect(page).toHaveURL(/tab=units/);
    expect(page.url()).not.toContain('/login');
    await expect(unitTab).toHaveClass(/bg-\[#b91c1c\]/);

    // 5. Click browser back -> should return to home (platoon_summary)
    await page.goBack();
    expect(page.url()).toBe('http://localhost:3005/');
    expect(page.url()).not.toContain('/login');

    // 6. Click browser forward -> should return to Units tab
    await page.goForward();
    await expect(page).toHaveURL(/tab=units/);
    await expect(unitTab).toHaveClass(/bg-\[#b91c1c\]/);

    // 7. Click browser forward -> should return to daily_scoring tab
    await page.goForward();
    await expect(page).toHaveURL(/tab=daily_scoring/);
    await expect(page.getByRole('button', { name: /(nhập|bảng) điểm thi đua/i })).toHaveClass(/bg-\[#b91c1c\]/);
    console.log('[PASS] Full back/forward history chain preserved without login redirection');
  });

  test('Adversarial 4: Sequential unit switching clears previous state and switches soldiers', async ({ page }) => {
    // 1. Navigate to Units Tab
    await page.getByRole('button', { name: /cây đơn vị quân đội/i }).click();
    await expect(page).toHaveURL(/tab=units/);

    // 2. Switch to Table View
    await page.getByRole('button', { name: /bảng danh sách/i }).click();

    // 3. Search and select "Đại đội 1"
    const searchInput = page.getByPlaceholder(/tìm kiếm đơn vị/i);
    await searchInput.fill('Đại đội 1');
    const c1Row = page.getByRole('row').filter({ hasText: 'Đại đội 1' }).filter({
      has: page.getByRole('button', { name: /nhập điểm/i })
    }).first();
    await expect(c1Row).toBeVisible();
    await c1Row.getByRole('button', { name: /nhập điểm/i }).click();

    // Verify C1 loaded (5 soldiers)
    await expect(page).toHaveURL(/tab=daily_scoring/);
    await expect(page.getByRole('button', { name: /lưu bảng điểm/i })).toBeVisible({ timeout: 10000 });
    const c1Count = await page.locator('tbody tr.table-row-hover').count();
    expect(c1Count).toBe(5);

    // 4. Return to Units, switch to Table View again, search "Tiểu đội 2"
    await page.getByRole('button', { name: /cây đơn vị quân đội/i }).click();
    await expect(page).toHaveURL(/tab=units/);
    await page.getByRole('button', { name: /bảng danh sách/i }).click();

    await searchInput.fill('Tiểu đội 2');
    const squad2Row = page.getByRole('row').filter({ hasText: 'Tiểu đội 2' }).filter({
      has: page.getByRole('button', { name: /nhập điểm/i })
    }).first();
    await expect(squad2Row).toBeVisible();
    await squad2Row.getByRole('button', { name: /nhập điểm/i }).click();

    // Verify Squad 2 loaded with 2 soldiers (cleanly replacing C1's 5 soldiers)
    await expect(page).toHaveURL(/tab=daily_scoring/);
    await expect(page.getByRole('button', { name: /lưu bảng điểm/i })).toBeVisible({ timeout: 10000 });
    const squad2Count = await page.locator('tbody tr.table-row-hover').count();
    expect(squad2Count).toBe(2);

    console.log(`[PASS] Clean unit transition: C1 (${c1Count} soldiers) switched to Squad 2 (${squad2Count} soldiers)`);
  });

});
