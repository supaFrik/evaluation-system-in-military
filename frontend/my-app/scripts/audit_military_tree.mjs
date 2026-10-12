import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/military-tree-audit';
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const BREAKPOINTS = [
  { width: 320, name: '320px_iPhone_SE' },
  { width: 375, name: '375px_iPhone_14' },
  { width: 768, name: '768px_iPad_Portrait' },
  { width: 1024, name: '1024px_iPad_Landscape' },
  { width: 1280, name: '1280px_Laptop' },
  { width: 1440, name: '1440px_Desktop' },
  { width: 1920, name: '1920px_Full_HD' },
  { width: 2560, name: '2560px_UltraWide_4K' }
];

async function runAudit() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext();

  // Inject Commander / Admin user
  await context.addInitScript(() => {
    localStorage.setItem('thi_dua_user', JSON.stringify({
      id: 'u-trungdoan',
      username: 'trungdoan',
      name: 'Thượng tá NGUYỄN QUANG HUY',
      rank: 'Thượng tá',
      role: 'ADMIN',
      roleTitle: 'Trung đoàn trưởng',
      unitScopeTier: 'REGIMENT',
      assignedUnitId: 'e335'
    }));
    localStorage.setItem('thi_dua_jwt_token', 'audit_offline_token');
  });

  const page = await context.newPage();
  const auditReport = [];

  for (const bp of BREAKPOINTS) {
    console.log(`\n========================================`);
    console.log(`Auditing Breakpoint: ${bp.width}px (${bp.name})`);
    console.log(`========================================`);

    await page.setViewportSize({ width: bp.width, height: 900 });
    await page.goto('http://localhost:3005/?tab=units', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(600);

    // Wait for UnitManagement container or nodes
    await page.waitForSelector('.group\\/node, h1:has-text("Cây đơn vị quân đội"), text=Cây đơn vị quân đội', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(400);

    // 1. Audit Tree View (Default view)
    const treeViewAudit = await page.evaluate((vw) => {
      const htmlWidth = document.documentElement.scrollWidth;
      const bodyWidth = document.body.scrollWidth;
      const windowWidth = window.innerWidth;
      const hasHorizontalOverflow = htmlWidth > windowWidth || bodyWidth > windowWidth;

      // Check small touch targets on mobile
      const smallTouchTargets = [];
      if (vw < 768) {
        const interactives = document.querySelectorAll('button, a, select, input');
        for (const el of interactives) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight) {
            if (rect.height < 40 || rect.width < 40) {
              const text = (el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim().slice(0, 30);
              smallTouchTargets.push({
                tag: el.tagName.toLowerCase(),
                text,
                size: `${Math.round(rect.width)}x${Math.round(rect.height)}`
              });
              if (smallTouchTargets.length >= 8) break;
            }
          }
        }
      }

      // Check node cards
      const nodeCards = document.querySelectorAll('.group\\/node');
      const nodeCount = nodeCards.length;

      // Find deepest node width
      let minCardWidth = 9999;
      let deepestLevel = 0;
      nodeCards.forEach(n => {
        const cardBox = n.querySelector('div[class*="border-l-4"]');
        if (cardBox) {
          const w = cardBox.getBoundingClientRect().width;
          if (w < minCardWidth) minCardWidth = Math.round(w);
        }
      });

      return {
        windowWidth,
        htmlWidth,
        bodyWidth,
        hasHorizontalOverflow,
        overflowDelta: Math.max(0, htmlWidth - windowWidth, bodyWidth - windowWidth),
        smallTouchTargetsCount: smallTouchTargets.length,
        smallTouchTargetsSample: smallTouchTargets,
        nodeCount,
        minCardWidth: minCardWidth === 9999 ? 0 : minCardWidth
      };
    }, bp.width);

    // Screenshot Tree View
    const treeShotName = `tree_view_${bp.width}px.png`;
    await page.screenshot({ path: path.join(ARTIFACT_DIR, treeShotName), fullPage: false });

    // 2. Switch to Table View and Audit
    const tableBtn = page.locator('button:has-text("Bảng danh sách")').first();
    let hasTable = false;
    let tableShotName = null;
    let tableViewAudit = null;

    if (await tableBtn.isVisible()) {
      await tableBtn.click();
      await page.waitForTimeout(400);
      hasTable = true;
      tableShotName = `table_view_${bp.width}px.png`;
      await page.screenshot({ path: path.join(ARTIFACT_DIR, tableShotName), fullPage: false });

      tableViewAudit = await page.evaluate(() => {
        const htmlWidth = document.documentElement.scrollWidth;
        const bodyWidth = document.body.scrollWidth;
        const windowWidth = window.innerWidth;
        const hasHorizontalOverflow = htmlWidth > windowWidth || bodyWidth > windowWidth;
        const table = document.querySelector('table');
        const tableWidth = table ? table.getBoundingClientRect().width : 0;
        return {
          hasHorizontalOverflow,
          overflowDelta: Math.max(0, htmlWidth - windowWidth, bodyWidth - windowWidth),
          tableWidth: Math.round(tableWidth)
        };
      });

      // Switch back to Tree View
      const treeBtn = page.locator('button:has-text("Cây phân cấp")').first();
      if (await treeBtn.isVisible()) {
        await treeBtn.click();
        await page.waitForTimeout(300);
      }
    }

    // 3. Test Add Unit Modal on 375px (Mobile) and 1280px (Desktop)
    let modalShotName = null;
    if (bp.width === 375 || bp.width === 1280) {
      const addBtn = page.locator('button:has-text("Thêm đơn vị mới")').first();
      if (await addBtn.isVisible()) {
        await addBtn.click();
        await page.waitForTimeout(300);
        modalShotName = `modal_add_unit_${bp.width}px.png`;
        await page.screenshot({ path: path.join(ARTIFACT_DIR, modalShotName), fullPage: false });
        // Close modal
        await page.keyboard.press('Escape');
        await page.waitForTimeout(300);
      }
    }

    auditReport.push({
      width: bp.width,
      name: bp.name,
      treeView: { ...treeViewAudit, screenshot: treeShotName },
      tableView: { ...tableViewAudit, screenshot: tableShotName },
      modalScreenshot: modalShotName
    });

    console.log(`[${bp.width}px] Tree Overflow: ${treeViewAudit.hasHorizontalOverflow ? `YES (+${treeViewAudit.overflowDelta}px)` : 'NO (0px)'} | Min Card Width: ${treeViewAudit.minCardWidth}px | Small Touch: ${treeViewAudit.smallTouchTargetsCount}`);
  }

  // 4. Test CascadingUnitSelector on Dashboard
  console.log(`\n========================================`);
  console.log(`Auditing CascadingUnitSelector on Dashboard`);
  console.log(`========================================`);
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('http://localhost:3005/?tab=platoon_summary', { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cascading_selector_375px.png'), fullPage: false });

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'cascading_selector_1280px.png'), fullPage: false });

  await browser.close();

  const jsonPath = path.join(ARTIFACT_DIR, 'military_tree_audit.json');
  fs.writeFileSync(jsonPath, JSON.stringify(auditReport, null, 2), 'utf-8');
  console.log(`\nAudit complete! Report saved to ${jsonPath}`);
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
