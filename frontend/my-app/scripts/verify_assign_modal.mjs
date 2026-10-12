import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const adminCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await adminCtx.addInitScript(() => {
    localStorage.setItem('thi_dua_user', JSON.stringify({
      id: 'demo-admin',
      username: 'admin',
      name: 'Nguyễn Văn A',
      rank: 'Đại úy',
      position: 'Trợ lý Tham mưu',
      role: 'ADMIN',
      unitId: 'e335'
    }));
    localStorage.setItem('thi_dua_auth_token', 'mock-token-admin');
  });
  const adminPage = await adminCtx.newPage();
  await adminPage.goto('http://localhost:3005/?tab=units', { waitUntil: 'networkidle' });
  await adminPage.waitForTimeout(1000);

  // Click the assign button on first node
  const keyBtn = adminPage.getByRole('button', { name: /Phân quyền cán bộ chấm điểm/i }).first();
  await keyBtn.click();
  await adminPage.waitForTimeout(600);

  const isModalVisible = await adminPage.getByText('Phân quyền cán bộ chấm điểm').isVisible();
  console.log('Assign Scorer Modal visible:', isModalVisible);
  await adminPage.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/e2e_admin_assign_modal.png' });

  await browser.close();
})();
