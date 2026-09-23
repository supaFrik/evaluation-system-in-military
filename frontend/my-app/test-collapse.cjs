const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.addInitScript(() => {
    localStorage.setItem(
      'thi_dua_user',
      JSON.stringify({
        id: 'u1',
        username: 'trungdoan',
        name: 'Thượng tá Nguyễn Quang Huy',
        role: 'COMMANDER',
        roleTitle: 'Trung đoàn trưởng',
        unitName: 'Trung đoàn Bộ Binh 335',
        rank: 'Thượng tá',
        avatarUrl: '/default-avatar.png',
      })
    );
  });
  const page = await context.newPage();
  await page.goto('http://localhost:3005');
  await page.waitForTimeout(600);
  
  // Click hamburger to collapse
  await page.click('button[aria-label="Đóng / Mở menu điều hướng"]');
  await page.waitForTimeout(500);
  
  const outPath = path.resolve('C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/collapsed-menu.png');
  await page.screenshot({ path: outPath });
  console.log('Saved to', outPath);
  await browser.close();
})();
