import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  
  // Set localStorage user session
  await context.addInitScript(() => {
    localStorage.setItem('emulation_user', JSON.stringify({
      id: 'demo-admin',
      username: 'admin',
      name: 'Nguyễn Văn A',
      rank: 'Đại úy',
      position: 'Trợ lý Tham mưu',
      role: 'ADMIN',
      unitId: 'REG-335'
    }));
  });

  const page = await context.newPage();
  await page.goto('http://localhost:3005/?tab=units', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Take screenshot of units tree showing new buttons
  await page.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/flow_tree_navigation.png', fullPage: false });

  // 1. Click 'Nhập điểm' on Platoon/Squad
  const nhapDiemBtn = page.getByRole('button', { name: 'Nhập điểm' }).first();
  if (await nhapDiemBtn.isVisible()) {
    console.log('Found Nhap diem button, clicking...');
    await nhapDiemBtn.click();
    await page.waitForTimeout(800);
    console.log('Navigated URL after clicking Nhap diem:', page.url());
    await page.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/flow_daily_scoring_target.png' });
  }

  // 2. Go back to units & Click Headcount badge
  await page.goto('http://localhost:3005/?tab=units', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const headcountBtn = page.getByRole('button', { name: /đồng chí/i }).first();
  if (await headcountBtn.isVisible()) {
    console.log('Found Headcount button, clicking...');
    await headcountBtn.click();
    await page.waitForTimeout(800);
    console.log('Navigated URL after clicking Headcount:', page.url());
    await page.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/flow_individual_emulation_target.png' });
  }

  // 3. Go back to units & Click 'Xem thi đua' on Company/Battalion/Regiment
  await page.goto('http://localhost:3005/?tab=units', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);

  const xemThiDuaBtn = page.getByRole('button', { name: 'Xem thi đua' }).first();
  if (await xemThiDuaBtn.isVisible()) {
    console.log('Found Xem thi dua button, clicking...');
    await xemThiDuaBtn.click();
    await page.waitForTimeout(800);
    console.log('Navigated URL after clicking Xem thi dua:', page.url());
    await page.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/flow_platoon_summary_target.png' });
  }

  await browser.close();
  console.log('Flow validation finished with logged-in session.');
})();
