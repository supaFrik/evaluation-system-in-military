import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/aDMIN/.gemini/antigravity/brain/7ce2c603-3de8-4b15-89ec-ec7e803ad01f/responsive-audit';
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

const PAGES_TO_TEST = [
  { id: 'login', title: 'Đăng nhập', url: 'http://localhost:3005/login', auth: false },
  { id: 'dashboard_collective', title: 'Dashboard Thi đua tập thể', url: 'http://localhost:3005/', auth: true, tab: 'platoon_summary', subView: 'COLLECTIVE' },
  { id: 'dashboard_individual', title: 'Bình xét cá nhân', url: 'http://localhost:3005/', auth: true, tab: 'platoon_summary', subView: 'INDIVIDUAL' },
  { id: 'daily_scoring', title: 'Sổ nhập điểm thi đua', url: 'http://localhost:3005/', auth: true, tab: 'daily_scoring' },
  { id: 'commendations', title: 'Biểu dương & Nhắc nhở', url: 'http://localhost:3005/', auth: true, tab: 'commendations' },
  { id: 'soldiers', title: 'Danh sách quân nhân', url: 'http://localhost:3005/', auth: true, tab: 'soldiers' },
];

async function switchToTab(page, tabId, vw) {
  if (vw < 768) {
    const isDrawerOpen = await page.evaluate(() => {
      const aside = document.querySelector('aside');
      return aside && !aside.classList.contains('-translate-x-full');
    });

    if (!isDrawerOpen) {
      const toggle = page.locator('header button[aria-label*="menu" i]').first();
      if (await toggle.isVisible()) {
        await toggle.click();
        await page.waitForTimeout(300);
      }
    }

    const btn = page.locator(`button[data-tab-id="${tabId}"]`).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(300);
    }
  } else {
    const btn = page.locator(`button[data-tab-id="${tabId}"]`).first();
    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(300);
    }
  }
}

async function runAudit() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const allResults = [];

  for (const pageDef of PAGES_TO_TEST) {
    console.log(`\n========================================`);
    console.log(`Auditing: ${pageDef.title} (${pageDef.id})`);
    console.log(`========================================`);

    const pageResults = {
      pageId: pageDef.id,
      title: pageDef.title,
      breakpoints: {}
    };

    const context = await browser.newContext();
    if (pageDef.auth) {
      await context.addInitScript(() => {
        localStorage.setItem('thi_dua_user', JSON.stringify({
          id: 'u-chihuy',
          username: 'chihuy',
          name: 'Đại úy NGUYỄN THẾ ANH',
          rank: 'Đại úy',
          role: 'COMMANDER',
          roleTitle: 'Đại đội trưởng',
          unitScopeTier: 'COMPANY',
          assignedUnitId: 'C1'
        }));
      });
    }

    const page = await context.newPage();

    for (const bp of BREAKPOINTS) {
      await page.setViewportSize({ width: bp.width, height: 900 });
      await page.goto(pageDef.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(400);

      // Trigger resize for react state
      await page.evaluate(() => window.dispatchEvent(new Event('resize')));
      await page.waitForTimeout(300);

      if (pageDef.auth) {
        if (pageDef.tab && pageDef.tab !== 'platoon_summary') {
          await switchToTab(page, pageDef.tab, bp.width);
        }

        if (pageDef.subView === 'INDIVIDUAL') {
          const indTab = page.locator('button:has-text("Bình xét cá nhân")').first();
          if (await indTab.isVisible()) {
            await indTab.click();
            await page.waitForTimeout(300);
          }
        }
      }

      // Check layout criteria
      const audit = await page.evaluate((vw) => {
        const bodyWidth = document.body.scrollWidth;
        const htmlWidth = document.documentElement.scrollWidth;
        const windowWidth = window.innerWidth;
        const hasHorizontalOverflow = htmlWidth > windowWidth || bodyWidth > windowWidth;

        // Elements causing overflow
        const overflowingElements = [];
        if (hasHorizontalOverflow) {
          const allEls = document.querySelectorAll('*');
          for (const el of allEls) {
            const rect = el.getBoundingClientRect();
            if (rect.right > windowWidth + 1) {
              const tag = el.tagName.toLowerCase();
              const className = (el.className || '').toString().slice(0, 80);
              overflowingElements.push({
                tag,
                className,
                rectRight: Math.round(rect.right),
                excess: Math.round(rect.right - windowWidth)
              });
              if (overflowingElements.length >= 5) break;
            }
          }
        }

        // Touch target audit (<44px on mobile <768px)
        const smallTouchTargets = [];
        if (vw < 768) {
          const interactives = document.querySelectorAll('button, a, input, select, [role="button"]');
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
                if (smallTouchTargets.length >= 6) break;
              }
            }
          }
        }

        // Navigation state
        const drawerBtn = document.querySelector('header button[aria-label*="menu" i]');
        const sidebar = document.querySelector('aside');
        let navMode = 'none';
        if (drawerBtn && window.getComputedStyle(drawerBtn).display !== 'none') {
          navMode = 'mobile_drawer_toggle';
        }
        if (sidebar && window.getComputedStyle(sidebar).display !== 'none') {
          const sbWidth = sidebar.getBoundingClientRect().width;
          if (sbWidth > 150) {
            navMode = 'desktop_expanded (' + Math.round(sbWidth) + 'px)';
          } else if (sbWidth > 40) {
            navMode = 'tablet_collapsed (' + Math.round(sbWidth) + 'px)';
          }
        }

        // Tables check
        const tables = document.querySelectorAll('table');
        let tablesWithOverflowContainer = 0;
        tables.forEach(t => {
          let p = t.parentElement;
          while (p && p !== document.body) {
            const style = window.getComputedStyle(p);
            if (style.overflowX === 'auto' || style.overflowX === 'scroll') {
              tablesWithOverflowContainer++;
              break;
            }
            p = p.parentElement;
          }
        });

        const headerTitleEl = document.querySelector('header h1, header .font-extrabold');
        const headerTitle = headerTitleEl ? headerTitleEl.textContent?.trim() : null;

        return {
          windowWidth,
          htmlWidth,
          bodyWidth,
          hasHorizontalOverflow,
          overflowDelta: Math.max(0, htmlWidth - windowWidth, bodyWidth - windowWidth),
          overflowingElements,
          smallTouchTargetsCount: smallTouchTargets.length,
          smallTouchTargetsSample: smallTouchTargets,
          navMode,
          tablesFound: tables.length,
          tablesWithOverflowContainer,
          headerTitle
        };
      }, bp.width);

      const shotFileName = `${pageDef.id}_${bp.width}px.png`;
      const shotPath = path.join(ARTIFACT_DIR, shotFileName);
      await page.screenshot({ path: shotPath, fullPage: false });

      pageResults.breakpoints[bp.width] = {
        ...audit,
        screenshot: shotFileName
      };

      const status = audit.hasHorizontalOverflow ? `FAIL (+${audit.overflowDelta}px)` : (audit.smallTouchTargetsCount > 0 ? `WARN (${audit.smallTouchTargetsCount} targets < 40px)` : 'PASS');
      console.log(`[${bp.width}px] Status: ${status} | Nav: ${audit.navMode} | Tables: ${audit.tablesFound} | Shot: ${shotFileName}`);
    }

    await page.close();
    await context.close();
    allResults.push(pageResults);
  }

  await browser.close();

  const jsonOut = path.join(ARTIFACT_DIR, 'audit_results_final.json');
  fs.writeFileSync(jsonOut, JSON.stringify(allResults, null, 2), 'utf-8');
  console.log(`\n========================================`);
  console.log(`Audit complete! Final results saved to ${jsonOut}`);
  console.log(`========================================`);
}

runAudit().catch(e => {
  console.error('Audit run error:', e);
  process.exit(1);
});
