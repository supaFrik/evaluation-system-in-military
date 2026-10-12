import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  
  await context.addInitScript(() => {
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

  const page = await context.newPage();
  await page.goto('http://localhost:3005/?tab=units', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('Tree view URL:', page.url());
  await page.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/flow_tree_navigation.png', fullPage: false });

  // Check buttons present
  const nhapDiemCount = await page.getByRole('button', { name: 'Nhập điểm' }).count();
  const xemThiDuaCount = await page.getByRole('button', { name: 'Xem thi đua' }).count();
  const headcountCount = await page.getByRole('button', { name: /đồng chí/i }).count();
  console.log({ nhapDiemCount, xemThiDuaCount, headcountCount });

  // 1. Click Nhập điểm on Platoon
  if (nhapDiemCount > 0) {
    await page.getByRole('button', { name: 'Nhập điểm' }).first().click();
    await page.waitForTimeout(800);
    console.log('1. Clicked Nhap diem -> Current URL:', page.url());
    await page.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/flow_daily_scoring_target.png' });
  }

  // 2. Back to units & Click Headcount on a unit
  await page.goto('http://localhost:3005/?tab=units', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  if (headcountCount > 0) {
    await page.getByRole('button', { name: /đồng chí/i }).first().click();
    await page.waitForTimeout(800);
    console.log('2. Clicked Headcount -> Current URL:', page.url());
    await page.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/flow_individual_emulation_target.png' });
  }

  // 3. Back to units & Click Xem thi đua on Company/Battalion
  await page.goto('http://localhost:3005/?tab=units', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  if (xemThiDuaCount > 0) {
    await page.getByRole('button', { name: 'Xem thi đua' }).first().click();
    await page.waitForTimeout(800);
    console.log('3. Clicked Xem thi dua -> Current URL:', page.url());
    await page.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/flow_platoon_summary_target.png' });
  }

  await browser.close();
})();
