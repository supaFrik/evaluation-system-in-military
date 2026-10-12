# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: challenger-scoring-stress.spec.ts >> Adversarial Challenger Suite: Quick Scoring Navigation Stress Test >> Adversarial 4: Sequential unit switching clears previous state and switches soldiers
- Location: e2e\challenger-scoring-stress.spec.ts:163:7

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
  66  |     console.log(`[PASS] Nested Squad 1 scoring filtered accurately to ${squad1Count} soldiers`);
  67  | 
  68  |     // 4. Return to Units Tab and test Empty Nested Squad: Tiểu đội 3 (C1-B1-A3)
  69  |     await page.getByRole('button', { name: /cây đơn vị quân đội/i }).click();
  70  |     await expect(page).toHaveURL(/tab=units/);
  71  | 
  72  |     await searchInput.fill('Tiểu đội 3');
  73  |     await page.waitForTimeout(300);
  74  | 
  75  |     const squad3Btn = page.getByRole('button', { name: 'Nhập điểm thi đua cho Tiểu đội 3' }).first();
  76  |     await expect(squad3Btn).toBeVisible({ timeout: 10000 });
  77  |     await squad3Btn.click();
  78  | 
  79  |     await expect(page).toHaveURL(/tab=daily_scoring/);
  80  |     await expect(page.getByRole('button', { name: /lưu bảng điểm/i })).toBeVisible({ timeout: 10000 });
  81  | 
  82  |     // Squad 3 has 0 soldiers -> Graceful empty state banner displayed
  83  |     await expect(page.getByText('Chưa có danh sách quân nhân cho đơn vị này')).toBeVisible();
  84  |     console.log('[PASS] Empty nested squad correctly rendered graceful fallback empty state');
  85  |   });
  86  | 
  87  |   test('Adversarial 2: Rapid toggles between Tree View and Table View then Quick Scoring', async ({ page }) => {
  88  |     await page.getByRole('button', { name: /cây đơn vị quân đội/i }).click();
  89  |     await expect(page).toHaveURL(/tab=units/);
  90  | 
  91  |     const treeViewBtn = page.getByRole('button', { name: /cây phân cấp/i });
  92  |     const tableViewBtn = page.getByRole('button', { name: /bảng danh sách/i });
  93  | 
  94  |     // Rapidly toggle back and forth 4 times
  95  |     for (let i = 0; i < 4; i++) {
  96  |       await tableViewBtn.click();
  97  |       await treeViewBtn.click();
  98  |     }
  99  | 
  100 |     // Finally stay on Table View
  101 |     await tableViewBtn.click();
  102 |     await expect(page.getByRole('columnheader', { name: /tên đơn vị/i })).toBeVisible();
  103 | 
  104 |     // Rapid search filter and clear
  105 |     const searchInput = page.getByPlaceholder(/tìm kiếm đơn vị/i);
  106 |     await searchInput.fill('Tiểu đoàn');
  107 |     await expect(page.locator('tbody tr').first()).toBeVisible();
  108 |     await searchInput.fill('');
  109 | 
  110 |     // Click quick score from Table View on the first row with quick score
  111 |     const targetRow = page.getByRole('row').filter({
  112 |       has: page.getByRole('button', { name: /nhập điểm/i })
  113 |     }).first();
  114 |     await expect(targetRow).toBeVisible();
  115 | 
  116 |     const quickScoreBtn = targetRow.getByRole('button', { name: /nhập điểm/i });
  117 |     await quickScoreBtn.click();
  118 | 
  119 |     // Verify navigation succeeds without errors
  120 |     await expect(page).toHaveURL(/tab=daily_scoring/);
  121 |     await expect(page.getByRole('button', { name: /lưu bảng điểm/i })).toBeVisible({ timeout: 10000 });
  122 |     console.log('[PASS] Rapid view toggles and table quick score navigation succeeded');
  123 |   });
  124 | 
  125 |   test('Adversarial 3: Multi-step Browser History traversal (Units -> Score -> Back -> Forward)', async ({ page }) => {
  126 |     // 1. Start at home (platoon_summary)
  127 |     expect(page.url()).toBe('http://localhost:3005/');
  128 | 
  129 |     // 2. Go to Units tab
  130 |     const unitTab = page.getByRole('button', { name: /cây đơn vị quân đội/i });
  131 |     await unitTab.click();
  132 |     await expect(page).toHaveURL(/tab=units/);
  133 | 
  134 |     // 3. Click quick scoring on Tree View
  135 |     const quickScoreBtn = page.getByRole('button', { name: /nhập điểm/i }).first();
  136 |     await expect(quickScoreBtn).toBeVisible({ timeout: 10000 });
  137 |     await quickScoreBtn.click();
  138 |     await expect(page).toHaveURL(/tab=daily_scoring/);
  139 | 
  140 |     // 4. Click browser back -> should return to Units tab
  141 |     await page.goBack();
  142 |     await expect(page).toHaveURL(/tab=units/);
  143 |     expect(page.url()).not.toContain('/login');
  144 |     await expect(unitTab).toHaveClass(/bg-\[#b91c1c\]/);
  145 | 
  146 |     // 5. Click browser back -> should return to home (platoon_summary)
  147 |     await page.goBack();
  148 |     expect(page.url()).toBe('http://localhost:3005/');
  149 |     expect(page.url()).not.toContain('/login');
  150 | 
  151 |     // 6. Click browser forward -> should return to Units tab
  152 |     await page.goForward();
  153 |     await expect(page).toHaveURL(/tab=units/);
  154 |     await expect(unitTab).toHaveClass(/bg-\[#b91c1c\]/);
  155 | 
  156 |     // 7. Click browser forward -> should return to daily_scoring tab
  157 |     await page.goForward();
  158 |     await expect(page).toHaveURL(/tab=daily_scoring/);
  159 |     await expect(page.getByRole('button', { name: /(nhập|bảng) điểm thi đua/i })).toHaveClass(/bg-\[#b91c1c\]/);
  160 |     console.log('[PASS] Full back/forward history chain preserved without login redirection');
  161 |   });
  162 | 
  163 |   test('Adversarial 4: Sequential unit switching clears previous state and switches soldiers', async ({ page }) => {
  164 |     // 1. Navigate to Units Tab
  165 |     await page.getByRole('button', { name: /cây đơn vị quân đội/i }).click();
> 166 |     await expect(page).toHaveURL(/tab=units/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  167 | 
  168 |     // 2. Switch to Table View
  169 |     await page.getByRole('button', { name: /bảng danh sách/i }).click();
  170 | 
  171 |     // 3. Search and select "Đại đội 1"
  172 |     const searchInput = page.getByPlaceholder(/tìm kiếm đơn vị/i);
  173 |     await searchInput.fill('Đại đội 1');
  174 |     const c1Row = page.getByRole('row').filter({ hasText: 'Đại đội 1' }).filter({
  175 |       has: page.getByRole('button', { name: /nhập điểm/i })
  176 |     }).first();
  177 |     await expect(c1Row).toBeVisible();
  178 |     await c1Row.getByRole('button', { name: /nhập điểm/i }).click();
  179 | 
  180 |     // Verify C1 loaded (5 soldiers)
  181 |     await expect(page).toHaveURL(/tab=daily_scoring/);
  182 |     await expect(page.getByRole('button', { name: /lưu bảng điểm/i })).toBeVisible({ timeout: 10000 });
  183 |     const c1Count = await page.locator('tbody tr.table-row-hover').count();
  184 |     expect(c1Count).toBe(5);
  185 | 
  186 |     // 4. Return to Units, switch to Table View again, search "Tiểu đội 2"
  187 |     await page.getByRole('button', { name: /cây đơn vị quân đội/i }).click();
  188 |     await expect(page).toHaveURL(/tab=units/);
  189 |     await page.getByRole('button', { name: /bảng danh sách/i }).click();
  190 | 
  191 |     await searchInput.fill('Tiểu đội 2');
  192 |     const squad2Row = page.getByRole('row').filter({ hasText: 'Tiểu đội 2' }).filter({
  193 |       has: page.getByRole('button', { name: /nhập điểm/i })
  194 |     }).first();
  195 |     await expect(squad2Row).toBeVisible();
  196 |     await squad2Row.getByRole('button', { name: /nhập điểm/i }).click();
  197 | 
  198 |     // Verify Squad 2 loaded with 2 soldiers (cleanly replacing C1's 5 soldiers)
  199 |     await expect(page).toHaveURL(/tab=daily_scoring/);
  200 |     await expect(page.getByRole('button', { name: /lưu bảng điểm/i })).toBeVisible({ timeout: 10000 });
  201 |     const squad2Count = await page.locator('tbody tr.table-row-hover').count();
  202 |     expect(squad2Count).toBe(2);
  203 | 
  204 |     console.log(`[PASS] Clean unit transition: C1 (${c1Count} soldiers) switched to Squad 2 (${squad2Count} soldiers)`);
  205 |   });
  206 | 
  207 | });
  208 | 
```