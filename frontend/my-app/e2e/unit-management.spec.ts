import { test, expect } from '@playwright/test';

test.describe('Unit Management UX/UI Tab (Cây Đơn Vị Quân Đội)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');

    // Fill login form
    const identifierInput = page.locator('#signin-email');
    const passwordInput = page.locator('#signin-password');
    const loginButton = page.locator('button[type="submit"]');

    await expect(identifierInput).toBeVisible({ timeout: 10000 });
    await identifierInput.fill('admin');
    await passwordInput.fill('Password@123');
    await loginButton.click();

    // Wait for redirect to home
    await page.waitForURL('/', { timeout: 15000 });
    await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
  });

  test('should render Unit Management tab with minimal header and action buttons', async ({ page }) => {
    // Click on "Cây đơn vị quân đội" tab in Sidebar
    const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
    await expect(unitTab).toBeVisible();
    await unitTab.click();

    // Verify Action Buttons exist in minimal header
    await expect(page.getByRole('button', { name: /tải file mẫu excel/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /import excel/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /xuất dữ liệu/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /đồng bộ quân số/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /thêm đơn vị mới/i })).toBeVisible();
  });

  test('should toggle between Tree View and Table View seamlessly', async ({ page }) => {
    const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
    await unitTab.click();

    // Switch to Table View (Bảng danh sách)
    const tableViewBtn = page.getByRole('button', { name: /bảng danh sách/i });
    await tableViewBtn.click();

    // Verify Table Headers
    await expect(page.getByRole('columnheader', { name: /tên đơn vị/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /cấp bậc/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /cán bộ chỉ huy/i })).toBeVisible();

    // Switch back to Tree View (Cây phân cấp)
    const treeViewBtn = page.getByRole('button', { name: /cây phân cấp/i });
    await treeViewBtn.click();

    await expect(page.getByText('Cấu trúc phân cấp đơn vị')).toBeVisible();
    await expect(page.getByRole('button', { name: /mở rộng tất cả/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /thu gọn tất cả/i })).toBeVisible();
  });

  test('should open Add Unit Modal with correct 100% Vietnamese labels', async ({ page }) => {
    const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
    await unitTab.click();

    // Click "Thêm đơn vị mới"
    const addBtn = page.getByRole('button', { name: /thêm đơn vị mới/i });
    await addBtn.click();

    // Verify Modal
    await expect(page.getByRole('heading', { name: /thêm mới đơn vị quân đội/i })).toBeVisible();
    await expect(page.getByPlaceholder(/ví dụ: đại đội 1/i)).toBeVisible();

    // Close Modal
    await page.getByRole('button', { name: /hủy/i }).click();
  });

  test('should filter tree units and highlight keywords in search', async ({ page }) => {
    const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
    await unitTab.click();

    const searchInput = page.getByPlaceholder(/tìm kiếm đơn vị/i);
    await searchInput.fill('Đại đội');

    // Verify tree filter renders matching results
    await expect(page.locator('mark', { hasText: 'Đại đội' }).first()).toBeVisible();
  });

  test('should navigate to daily_scoring tab and preselect unit when clicking quick score button in Tree View', async ({ page }) => {
    // 1. Click on "Cây đơn vị quân đội" tab in Sidebar
    const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
    await expect(unitTab).toBeVisible();
    await unitTab.click();
    await expect(page).toHaveURL(/tab=units/);

    // 2. Ensure Tree View is displayed
    await expect(page.getByText('Cấu trúc phân cấp đơn vị')).toBeVisible();

    // 3. Locate quick scoring button on unit item in Tree View
    const quickScoreBtn = page.getByRole('button', { name: /nhập điểm/i }).first();
    await expect(quickScoreBtn).toBeVisible({ timeout: 10000 });
    await quickScoreBtn.click();

    // 4. Verify instant navigation to daily_scoring tab
    await expect(page).toHaveURL(/tab=daily_scoring/);

    // 5. Verify DailyScoringSheet is rendered and active
    await expect(page.getByRole('button', { name: /lưu bảng điểm/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('columnheader', { name: /quân nhân/i })).toBeVisible();
  });

  test('should navigate to daily_scoring tab and preselect unit when clicking quick score button in Table View', async ({ page }) => {
    // 1. Click on "Cây đơn vị quân đội" tab in Sidebar
    const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
    await expect(unitTab).toBeVisible();
    await unitTab.click();
    await expect(page).toHaveURL(/tab=units/);

    // 2. Switch to Table View (Bảng danh sách)
    const tableViewBtn = page.getByRole('button', { name: /bảng danh sách/i });
    await tableViewBtn.click();
    await expect(page.getByRole('columnheader', { name: /tên đơn vị/i })).toBeVisible();

    // 3. Locate quick scoring button in table row
    const tableRow = page.getByRole('row').filter({ has: page.getByRole('button', { name: /nhập điểm/i }) }).first();
    await expect(tableRow).toBeVisible();
    const quickScoreBtn = tableRow.getByRole('button', { name: /nhập điểm/i });
    await expect(quickScoreBtn).toBeVisible({ timeout: 10000 });
    await quickScoreBtn.click();

    // 4. Verify instant navigation to daily_scoring tab
    await expect(page).toHaveURL(/tab=daily_scoring/);

    // 5. Verify DailyScoringSheet is rendered and active
    await expect(page.getByRole('button', { name: /lưu bảng điểm/i })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('columnheader', { name: /quân nhân/i })).toBeVisible();
  });
});
