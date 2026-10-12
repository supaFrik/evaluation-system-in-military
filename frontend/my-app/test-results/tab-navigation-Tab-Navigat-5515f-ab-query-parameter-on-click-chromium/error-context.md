# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tab-navigation.spec.ts >> Tab Navigation URL Query String Sync & Browser History Fix >> R2: Synchronizes activeTab with ?tab= query parameter on click
- Location: e2e\tab-navigation.spec.ts:41:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /tab=units/
Received string:  "http://localhost:3005/"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × locator resolved to <html lang="vi" class="geist_a71539c9-module__T19VSG__variable geist_mono_8d43a2aa-module__8Li5zG__variable h-full antialiased overflow-x-hidden max-w-full light">…</html>
       - unexpected value "http://localhost:3005/"

```

```yaml
- banner:
  - button "Đóng / Mở menu điều hướng"
  - img "Cờ Đảng và Cờ Tổ quốc"
  - heading "Sổ tay Thi đua" [level=1]
  - paragraph: Sư đoàn Bộ Binh 324 — Trung đoàn Bộ Binh 335
  - button "Thượng tá Quản trị viên Hệ thống Quản trị viên Hệ thống Quản trị viên Hệ thống":
    - text: Thượng tá Quản trị viên Hệ thống Quản trị viên Hệ thống
    - img "Quản trị viên Hệ thống"
- complementary:
  - navigation:
    - button "Bảng theo dõi thi đua"
    - button "Nhập điểm thi đua"
    - button "Biểu dương & Nhắc nhở"
    - button "Danh sách quân nhân"
    - button "Cây đơn vị quân đội"
    - button "Báo cáo & Đánh giá"
    - button "Quy chế chấm điểm"
  - paragraph: Khẩu hiệu hành động
  - paragraph: “Kỷ luật là sức mạnh của Quân đội”
- main:
  - button "Tải file mẫu Excel"
  - button "Import Excel"
  - button "Xuất dữ liệu"
  - button "Đồng bộ quân số"
  - button "Thêm đơn vị mới"
  - textbox "Tìm kiếm đơn vị, mã định danh, họ tên chỉ huy..."
  - text: "Cấp bậc:"
  - combobox:
    - option "Tất cả cấp bậc" [selected]
    - option "Trung đoàn / Sư đoàn"
    - option "Tiểu đoàn / Khối"
    - option "Đại đội"
    - option "Trung đội"
    - option "Tiểu đội"
  - text: "Chỉ huy:"
  - combobox:
    - option "Tất cả" [selected]
    - option "Đã có chỉ huy"
    - option "Khuyết chỉ huy"
  - button "Cây phân cấp"
  - button "Bảng danh sách"
  - heading "Cấu trúc phân cấp đơn vị" [level=2]
  - text: 17 đơn vị
  - button "Mở rộng tất cả"
  - text: "|"
  - button "Thu gọn tất cả"
  - button "Thu gọn"
  - text: "Trung đoàn Bộ Binh 335 e335 Trung đoàn / Sư đoàn Trung đoàn trưởng:"
  - strong: Thượng tá NGUYỄN QUANG HUY
  - text: 5 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - button "Thu gọn"
  - text: "Khối Đại đội Trực thuộc cTT Tiểu đoàn / Khối Phó Trung đoàn trưởng phụ trách:"
  - strong: Trung tá VŨ ĐÌNH TRỌNG
  - text: 0 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - button "Thu gọn"
  - text: "Đại đội Thông tin (C18) C18 Đại đội Đại đội trưởng:"
  - strong: Đại úy VŨ ĐỨC MẠNH
  - text: 0 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - text: "Trung đội 1 B1 Trung đội Trung đội trưởng:"
  - strong: Thượng úy TRẦN QUANG MINH
  - text: 0 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - button "Thu gọn"
  - text: "Tiểu đoàn Bộ Binh 4 dBB4 Tiểu đoàn / Khối Tiểu đoàn trưởng:"
  - strong: Thiếu tá TRẦN ĐẠI NGHĨA
  - text: 5 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - button "Thu gọn"
  - text: "Đại đội 1 C1 Đại đội Đại đội trưởng:"
  - strong: Đại úy NGUYỄN THẾ ANH
  - text: 5 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - button "Thu gọn"
  - text: "Trung đội 1 B1 Trung đội Trung đội trưởng:"
  - strong: Đại úy NGUYỄN VĂN THẮNG
  - text: 5 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - text: "Tiểu đội 1 A1 Tiểu đội Tiểu đội trưởng:"
  - strong: Trung sĩ TRẦN VĂN BÌNH
  - text: 3 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - text: "Tiểu đội 2 A2 Tiểu đội Tiểu đội trưởng:"
  - strong: Trung sĩ NGUYỄN VĂN HÒA
  - text: 2 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - text: "Tiểu đội 3 A3 Tiểu đội Tiểu đội trưởng:"
  - strong: Hạ sĩ PHẠM QUỐC HƯNG
  - text: 0 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - text: "Trung đội 2 B2 Trung đội Trung đội trưởng:"
  - strong: Trung úy VŨ ĐÌNH TRỌNG
  - text: 0 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - text: "Trung đội 3 B3 Trung đội Trung đội trưởng:"
  - strong: Thiếu úy PHẠM MINH TUẤN
  - text: 0 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - text: "Đại đội 2 C2 Đại đội Đại đội trưởng:"
  - strong: Đại úy HOÀNG VĂN LONG
  - text: 0 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - text: "Đại đội 3 C3 Đại đội Đại đội trưởng:"
  - strong: Đại úy PHẠM TUẤN KIỆT
  - text: 0 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - text: "Đại đội Hỏa lực 4 C4 Đại đội Đại đội trưởng:"
  - strong: Đại úy VŨ MẠNH CƯỜNG
  - text: 0 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - text: "Tiểu đoàn Bộ Binh 5 dBB5 Tiểu đoàn / Khối Tiểu đoàn trưởng:"
  - strong: Thiếu tá LÊ MINH QUÂN
  - text: 0 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
  - text: "Tiểu đoàn Bộ Binh 6 dBB6 Tiểu đoàn / Khối Tiểu đoàn trưởng:"
  - strong: Thiếu tá PHẠM HỒNG SƠN
  - text: 0 đồng chí
  - button "Thêm đơn vị trực thuộc (cấp dưới)"
  - button "Bổ nhiệm / Điều chuyển Cán bộ chỉ huy"
  - button "Sửa thông tin đơn vị"
  - button "Xóa đơn vị"
- alert
- region "Notifications"
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('Tab Navigation URL Query String Sync & Browser History Fix', () => {
  4   | 
  5   |   test.beforeEach(async ({ page }) => {
  6   |     // 1. Authenticate via genuine login
  7   |     await page.goto('/login');
  8   |     const identifierInput = page.locator('#signin-email');
  9   |     const passwordInput = page.locator('#signin-password');
  10  |     const loginButton = page.locator('button[type="submit"]');
  11  | 
  12  |     await expect(identifierInput).toBeVisible({ timeout: 10000 });
  13  |     await identifierInput.fill('admin');
  14  |     await passwordInput.fill('Password@123');
  15  |     await loginButton.click();
  16  | 
  17  |     // Wait for redirect to home '/'
  18  |     await page.waitForURL('/', { timeout: 15000 });
  19  |     await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
  20  |   });
  21  | 
  22  |   test('R1: window.location.replace removes /login from history stack on login', async ({ page }) => {
  23  |     // We arrived at '/' via login replace redirect.
  24  |     expect(page.url()).toBe('http://localhost:3005/');
  25  | 
  26  |     // Attempting to go back should not land back on /login
  27  |     await page.goBack();
  28  |     // URL should still be '/' (or about:blank/empty if history had nothing prior), NOT '/login'
  29  |     expect(page.url()).not.toContain('/login');
  30  |   });
  31  | 
  32  |   test('R1: Auth Guard redirects authenticated user away from /login to /', async ({ page }) => {
  33  |     // User is already authenticated in this session context
  34  |     await page.goto('/login');
  35  | 
  36  |     // Auth Guard must automatically redirect back to '/'
  37  |     await page.waitForURL('http://localhost:3005/', { timeout: 10000 });
  38  |     expect(page.url()).toBe('http://localhost:3005/');
  39  |   });
  40  | 
  41  |   test('R2: Synchronizes activeTab with ?tab= query parameter on click', async ({ page }) => {
  42  |     // Click Cây đơn vị quân đội
  43  |     const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
  44  |     await expect(unitTab).toBeVisible();
  45  |     await unitTab.click();
  46  | 
> 47  |     await expect(page).toHaveURL(/tab=units/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  48  |     expect(page.url()).toContain('?tab=units');
  49  | 
  50  |     // Click Quy chế chấm điểm
  51  |     const criteriaTab = page.getByRole('button', { name: /quy chế/i });
  52  |     await expect(criteriaTab).toBeVisible();
  53  |     await criteriaTab.click();
  54  | 
  55  |     await expect(page).toHaveURL(/tab=criteria/);
  56  |     expect(page.url()).toContain('?tab=criteria');
  57  |   });
  58  | 
  59  |   test('R2: Browser Back and Forward buttons navigate through tab history', async ({ page }) => {
  60  |     // Switch to units
  61  |     await page.getByRole('button', { name: /cây đơn vị quân đội/i }).click();
  62  |     await expect(page).toHaveURL(/tab=units/);
  63  | 
  64  |     // Switch to criteria
  65  |     await page.getByRole('button', { name: /quy chế/i }).click();
  66  |     await expect(page).toHaveURL(/tab=criteria/);
  67  | 
  68  |     // Browser Back -> returns to units
  69  |     await page.goBack();
  70  |     await expect(page).toHaveURL(/tab=units/);
  71  |     await expect(page.getByRole('button', { name: /cây đơn vị quân đội/i })).toHaveClass(/bg-\[#b91c1c\]/);
  72  | 
  73  |     // Browser Back -> returns to home (platoon_summary)
  74  |     await page.goBack();
  75  |     await expect(page.getByRole('button', { name: /bảng theo dõi thi đua/i })).toHaveClass(/bg-\[#b91c1c\]/);
  76  | 
  77  |     // Browser Forward -> returns to units
  78  |     await page.goForward();
  79  |     await expect(page).toHaveURL(/tab=units/);
  80  | 
  81  |     // Browser Forward -> returns to criteria
  82  |     await page.goForward();
  83  |     await expect(page).toHaveURL(/tab=criteria/);
  84  |   });
  85  | 
  86  |   test('R2: Deep linking to ?tab= renders corresponding view directly', async ({ page }) => {
  87  |     await page.goto('/?tab=units');
  88  |     await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
  89  |     expect(page.url()).toContain('?tab=units');
  90  | 
  91  |     // Verify Unit Management tab is active in sidebar
  92  |     const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
  93  |     await expect(unitTab).toBeVisible();
  94  |     await expect(unitTab).toHaveClass(/bg-\[#b91c1c\]/);
  95  |   });
  96  | 
  97  |   test('R2: Invalid ?tab falls back safely to platoon_summary', async ({ page }) => {
  98  |     await page.goto('/?tab=non_existent_tab_123');
  99  |     await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
  100 | 
  101 |     // Fallback tab platoon_summary should be active
  102 |     const platoonTab = page.locator('aside button[data-tab-id="platoon_summary"]');
  103 |     await expect(platoonTab).toBeVisible();
  104 |     await expect(platoonTab).toHaveClass(/bg-\[#b91c1c\]/);
  105 |   });
  106 | 
  107 |   test('R2: Quick scoring button from Unit Management navigates to daily_scoring and preserves browser history back', async ({ page }) => {
  108 |     // 1. Navigate to units tab
  109 |     const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
  110 |     await expect(unitTab).toBeVisible();
  111 |     await unitTab.click();
  112 |     await expect(page).toHaveURL(/tab=units/);
  113 | 
  114 |     // 2. Click quick scoring button on unit card
  115 |     const quickScoreBtn = page.getByRole('button', { name: /nhập điểm/i }).first();
  116 |     await expect(quickScoreBtn).toBeVisible({ timeout: 10000 });
  117 |     await quickScoreBtn.click();
  118 | 
  119 |     // 3. Verify URL is updated to daily_scoring and sidebar reflects active state
  120 |     await expect(page).toHaveURL(/tab=daily_scoring/);
  121 |     const scoringTab = page.getByRole('button', { name: /(nhập|bảng) điểm thi đua/i });
  122 |     await expect(scoringTab).toBeVisible();
  123 |     await expect(scoringTab).toHaveClass(/bg-\[#b91c1c\]/);
  124 | 
  125 |     // 4. Browser Back returns seamlessly to units tab
  126 |     await page.goBack();
  127 |     await expect(page).toHaveURL(/tab=units/);
  128 |     await expect(unitTab).toHaveClass(/bg-\[#b91c1c\]/);
  129 |   });
  130 | });
  131 | 
```