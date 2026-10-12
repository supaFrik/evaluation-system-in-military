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

  const buttonTexts = await page.locator('button').allInnerTexts();
  console.log('Button texts:', buttonTexts);

  await browser.close();
})();
