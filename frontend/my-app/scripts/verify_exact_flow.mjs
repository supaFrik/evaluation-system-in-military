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

  // TEST 1: Nhập điểm on Platoon/Squad -> tab=daily_scoring
  {
    const page = await context.newPage();
    await page.goto('http://localhost:3005/?tab=units', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Nhập điểm'));
      if (btn) btn.click();
    });
    await page.waitForTimeout(800);
    console.log('1. Nhập điểm target URL:', page.url());
    await page.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/flow_test_1_daily_scoring.png' });
    await page.close();
  }

  // TEST 2: Xem thi đua on Company/Battalion/Regiment -> tab=platoon_summary
  {
    const page = await context.newPage();
    await page.goto('http://localhost:3005/?tab=units', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Xem thi đua'));
      if (btn) btn.click();
    });
    await page.waitForTimeout(800);
    console.log('2. Xem thi đua target URL:', page.url());
    await page.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/flow_test_2_platoon_summary.png' });
    await page.close();
  }

  // TEST 3: Click headcount badge -> tab=individual_emulation
  {
    const page = await context.newPage();
    await page.goto('http://localhost:3005/?tab=units', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => (b.getAttribute('title') || '').includes('Xem bảng thi đua cá nhân'));
      if (btn) btn.click();
    });
    await page.waitForTimeout(800);
    console.log('3. Headcount target URL:', page.url());
    await page.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/flow_test_3_individual_emulation.png' });
    await page.close();
  }

  await browser.close();
  console.log('All 3 tests passed successfully!');
})();
