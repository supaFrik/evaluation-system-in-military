# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: unit-management.spec.ts >> Unit Management UX/UI Tab (Cây Đơn Vị Quân Đội) >> should navigate to daily_scoring tab and preselect unit when clicking quick score button in Table View
- Location: e2e\unit-management.spec.ts:109:7

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
  14  |     await identifierInput.fill('admin');
  15  |     await passwordInput.fill('Password@123');
  16  |     await loginButton.click();
  17  | 
  18  |     // Wait for redirect to home
  19  |     await page.waitForURL('/', { timeout: 15000 });
  20  |     await expect(page.locator('text=Đang tải dữ liệu thi đua')).toHaveCount(0, { timeout: 10000 });
  21  |   });
  22  | 
  23  |   test('should render Unit Management tab with minimal header and action buttons', async ({ page }) => {
  24  |     // Click on "Cây đơn vị quân đội" tab in Sidebar
  25  |     const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
  26  |     await expect(unitTab).toBeVisible();
  27  |     await unitTab.click();
  28  | 
  29  |     // Verify Action Buttons exist in minimal header
  30  |     await expect(page.getByRole('button', { name: /tải file mẫu excel/i })).toBeVisible();
  31  |     await expect(page.getByRole('button', { name: /import excel/i })).toBeVisible();
  32  |     await expect(page.getByRole('button', { name: /xuất dữ liệu/i })).toBeVisible();
  33  |     await expect(page.getByRole('button', { name: /đồng bộ quân số/i })).toBeVisible();
  34  |     await expect(page.getByRole('button', { name: /thêm đơn vị mới/i })).toBeVisible();
  35  |   });
  36  | 
  37  |   test('should toggle between Tree View and Table View seamlessly', async ({ page }) => {
  38  |     const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
  39  |     await unitTab.click();
  40  | 
  41  |     // Switch to Table View (Bảng danh sách)
  42  |     const tableViewBtn = page.getByRole('button', { name: /bảng danh sách/i });
  43  |     await tableViewBtn.click();
  44  | 
  45  |     // Verify Table Headers
  46  |     await expect(page.getByRole('columnheader', { name: /tên đơn vị/i })).toBeVisible();
  47  |     await expect(page.getByRole('columnheader', { name: /cấp bậc/i })).toBeVisible();
  48  |     await expect(page.getByRole('columnheader', { name: /cán bộ chỉ huy/i })).toBeVisible();
  49  | 
  50  |     // Switch back to Tree View (Cây phân cấp)
  51  |     const treeViewBtn = page.getByRole('button', { name: /cây phân cấp/i });
  52  |     await treeViewBtn.click();
  53  | 
  54  |     await expect(page.getByText('Cấu trúc phân cấp đơn vị')).toBeVisible();
  55  |     await expect(page.getByRole('button', { name: /mở rộng tất cả/i })).toBeVisible();
  56  |     await expect(page.getByRole('button', { name: /thu gọn tất cả/i })).toBeVisible();
  57  |   });
  58  | 
  59  |   test('should open Add Unit Modal with correct 100% Vietnamese labels', async ({ page }) => {
  60  |     const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
  61  |     await unitTab.click();
  62  | 
  63  |     // Click "Thêm đơn vị mới"
  64  |     const addBtn = page.getByRole('button', { name: /thêm đơn vị mới/i });
  65  |     await addBtn.click();
  66  | 
  67  |     // Verify Modal
  68  |     await expect(page.getByRole('heading', { name: /thêm mới đơn vị quân đội/i })).toBeVisible();
  69  |     await expect(page.getByPlaceholder(/ví dụ: đại đội 1/i)).toBeVisible();
  70  | 
  71  |     // Close Modal
  72  |     await page.getByRole('button', { name: /hủy/i }).click();
  73  |   });
  74  | 
  75  |   test('should filter tree units and highlight keywords in search', async ({ page }) => {
  76  |     const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
  77  |     await unitTab.click();
  78  | 
  79  |     const searchInput = page.getByPlaceholder(/tìm kiếm đơn vị/i);
  80  |     await searchInput.fill('Đại đội');
  81  | 
  82  |     // Verify tree filter renders matching results
  83  |     await expect(page.locator('mark', { hasText: 'Đại đội' }).first()).toBeVisible();
  84  |   });
  85  | 
  86  |   test('should navigate to daily_scoring tab and preselect unit when clicking quick score button in Tree View', async ({ page }) => {
  87  |     // 1. Click on "Cây đơn vị quân đội" tab in Sidebar
  88  |     const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
  89  |     await expect(unitTab).toBeVisible();
  90  |     await unitTab.click();
  91  |     await expect(page).toHaveURL(/tab=units/);
  92  | 
  93  |     // 2. Ensure Tree View is displayed
  94  |     await expect(page.getByText('Cấu trúc phân cấp đơn vị')).toBeVisible();
  95  | 
  96  |     // 3. Locate quick scoring button on unit item in Tree View
  97  |     const quickScoreBtn = page.getByRole('button', { name: /nhập điểm/i }).first();
  98  |     await expect(quickScoreBtn).toBeVisible({ timeout: 10000 });
  99  |     await quickScoreBtn.click();
  100 | 
  101 |     // 4. Verify instant navigation to daily_scoring tab
  102 |     await expect(page).toHaveURL(/tab=daily_scoring/);
  103 | 
  104 |     // 5. Verify DailyScoringSheet is rendered and active
  105 |     await expect(page.getByRole('button', { name: /lưu bảng điểm/i })).toBeVisible({ timeout: 10000 });
  106 |     await expect(page.getByRole('columnheader', { name: /quân nhân/i })).toBeVisible();
  107 |   });
  108 | 
  109 |   test('should navigate to daily_scoring tab and preselect unit when clicking quick score button in Table View', async ({ page }) => {
  110 |     // 1. Click on "Cây đơn vị quân đội" tab in Sidebar
  111 |     const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
  112 |     await expect(unitTab).toBeVisible();
  113 |     await unitTab.click();
> 114 |     await expect(page).toHaveURL(/tab=units/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  115 | 
  116 |     // 2. Switch to Table View (Bảng danh sách)
  117 |     const tableViewBtn = page.getByRole('button', { name: /bảng danh sách/i });
  118 |     await tableViewBtn.click();
  119 |     await expect(page.getByRole('columnheader', { name: /tên đơn vị/i })).toBeVisible();
  120 | 
  121 |     // 3. Locate quick scoring button in table row
  122 |     const tableRow = page.getByRole('row').filter({ has: page.getByRole('button', { name: /nhập điểm/i }) }).first();
  123 |     await expect(tableRow).toBeVisible();
  124 |     const quickScoreBtn = tableRow.getByRole('button', { name: /nhập điểm/i });
  125 |     await expect(quickScoreBtn).toBeVisible({ timeout: 10000 });
  126 |     await quickScoreBtn.click();
  127 | 
  128 |     // 4. Verify instant navigation to daily_scoring tab
  129 |     await expect(page).toHaveURL(/tab=daily_scoring/);
  130 | 
  131 |     // 5. Verify DailyScoringSheet is rendered and active
  132 |     await expect(page.getByRole('button', { name: /lưu bảng điểm/i })).toBeVisible({ timeout: 10000 });
  133 |     await expect(page.getByRole('columnheader', { name: /quân nhân/i })).toBeVisible();
  134 |   });
  135 | });
  136 | 
```