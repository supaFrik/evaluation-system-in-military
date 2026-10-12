const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const adminUser = {
  id: 'usr-admin',
  username: 'admin',
  role: 'ADMIN',
  name: 'Thượng tá Nguyễn Văn A',
  assignedUnitIds: ['e335'],
  unitScopeTier: 'REGIMENT',
  status: 'ACTIVE'
};

async function captureScreens() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const outDir = path.join('C:', 'Users', 'aDMIN', '.gemini', 'antigravity', 'brain', '7ce2c603-3de8-4b15-89ec-ec7e803ad01f', 'design-review');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Set local storage once
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
  await page.evaluate((u) => {
    localStorage.setItem('thi_dua_user', JSON.stringify(u));
  }, adminUser);

  const tabs = [
    { name: '01_dashboard', tab: 'platoon_summary' },
    { name: '02_unit_treeview', tab: 'units' },
    { name: '03_daily_scoring', tab: 'daily_scoring' },
    { name: '04_individual_emulation', tab: 'individual_emulation' },
    { name: '05_appeal_management', tab: 'appeals' },
    { name: '06_criteria_handbook', tab: 'criteria' },
    { name: '07_commendation_section', tab: 'commendations' },
    { name: '08_soldier_list', tab: 'soldiers' },
  ];

  for (const item of tabs) {
    await page.goto(`http://localhost:3001/?tab=${item.tab}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: path.join(outDir, `${item.name}.png`), fullPage: true });
  }

  await browser.close();
  console.log('Finished capturing all screenshots with seeded user to', outDir);
}

captureScreens().catch(console.error);
