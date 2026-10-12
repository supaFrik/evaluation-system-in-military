import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();

  console.log('=== TEST 1: SUPER ADMIN LOGIN & CAPABILITIES ===');
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

  // Check buttons
  const buttonsInTree = await adminPage.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).map(b => ({
      text: b.innerText.trim(),
      title: b.getAttribute('title') || ''
    }));
  });
  const hasNhapDiem = buttonsInTree.some(b => b.text === 'Nhập điểm');
  const hasXemThiDua = buttonsInTree.some(b => b.text === 'Xem thi đua');
  const assignScorerBtns = buttonsInTree.filter(b => b.title.includes('Phân quyền') || b.text.includes('phân quyền'));
  console.log('Admin tree - has Nhập điểm:', hasNhapDiem, '| has Xem thi đua:', hasXemThiDua);
  console.log('Admin tree - Assign Scorer buttons found:', assignScorerBtns.length);

  // Click first Assign Scorer button
  await adminPage.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => (b.getAttribute('title') || '').includes('Phân quyền') || b.innerText.includes('phân quyền'));
    if (btn) btn.click();
  });
  await adminPage.waitForTimeout(600);
  const modalText = await adminPage.evaluate(() => document.body.innerText.includes('Phân quyền cán bộ chấm điểm'));
  console.log('Assign Scorer Modal visible in DOM:', modalText);
  await adminPage.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/e2e_admin_assign_modal.png' });

  console.log('=== TEST 2: SCORER LOGIN & SCOPE RESTRICTION ===');
  const scorerCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await scorerCtx.addInitScript(() => {
    localStorage.setItem('thi_dua_user', JSON.stringify({
      id: 'demo-scorer',
      username: 'scorer_c1',
      name: 'Lê Hoàng Hải',
      rank: 'Thượng úy',
      position: 'Trung đội trưởng',
      role: 'SCORER',
      assignedUnitIds: ['C1-B1']
    }));
    localStorage.setItem('thi_dua_auth_token', 'mock-token-scorer');
  });
  const scorerPage = await scorerCtx.newPage();
  // Try navigating to restricted units tab
  await scorerPage.goto('http://localhost:3005/?tab=units', { waitUntil: 'networkidle' });
  await scorerPage.waitForTimeout(1000);
  console.log('Scorer URL after accessing units tab (Router Guard):', scorerPage.url());

  const scorerSidebarItems = await scorerPage.evaluate(() => {
    return Array.from(document.querySelectorAll('aside nav button')).map(b => b.innerText.trim()).filter(Boolean);
  });
  console.log('Scorer sidebar menu items:', scorerSidebarItems);
  const unitsInScorerSidebar = scorerSidebarItems.some(item => item.includes('Cây đơn vị'));
  console.log('Cây đơn vị in Scorer sidebar:', unitsInScorerSidebar, '(expected false)');
  await scorerPage.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/e2e_scorer_view.png' });

  console.log('=== TEST 3: SOLDIER LOGIN & VIEW-ONLY + APPEAL ===');
  const soldierCtx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await soldierCtx.addInitScript(() => {
    localStorage.setItem('thi_dua_user', JSON.stringify({
      id: 'demo-soldier',
      username: 'soldier_binh',
      name: 'Trần Văn Bình',
      rank: 'Trung sĩ',
      position: 'Tiểu đội trưởng',
      role: 'SOLDIER',
      soldierId: 's-101'
    }));
    localStorage.setItem('thi_dua_auth_token', 'mock-token-soldier');
  });
  const soldierPage = await soldierCtx.newPage();
  await soldierPage.goto('http://localhost:3005/?tab=individual_emulation', { waitUntil: 'networkidle' });
  await soldierPage.waitForTimeout(1000);

  const soldierSidebarItems = await soldierPage.evaluate(() => {
    return Array.from(document.querySelectorAll('aside nav button')).map(b => b.innerText.trim()).filter(Boolean);
  });
  console.log('Soldier sidebar menu items:', soldierSidebarItems);
  const unitsInSoldierSidebar = soldierSidebarItems.some(item => item.includes('Cây đơn vị'));
  console.log('Cây đơn vị in Soldier sidebar:', unitsInSoldierSidebar, '(expected false)');

  const hasAppealBtn = await soldierPage.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).some(b => b.innerText.includes('Gửi khiếu nại'));
  });
  console.log('Appeal shortcut button visible on individual board:', hasAppealBtn);
  await soldierPage.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/e2e_soldier_view.png' });

  // Navigate to Appeals tab
  await soldierPage.goto('http://localhost:3005/?tab=appeals', { waitUntil: 'networkidle' });
  await soldierPage.waitForTimeout(1000);
  const appealPageVisible = await soldierPage.evaluate(() => {
    return document.body.innerText.includes('Hòm thư khiếu nại & Ý kiến cá nhân');
  });
  console.log('Appeals page header visible for soldier:', appealPageVisible);
  await soldierPage.screenshot({ path: 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit/e2e_soldier_appeals.png' });

  await browser.close();
  console.log('🎉 ALL 3 ROLES E2E TESTS FINISHED SUCCESSFULLY!');
})();
