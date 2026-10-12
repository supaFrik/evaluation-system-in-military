import fs from 'node:fs';
import path from 'node:path';

const pagePath = path.resolve('app/page.tsx');
const pageContent = fs.readFileSync(pagePath, 'utf8');

const validTabsMatch = pageContent.match(/const VALID_TABS:[^=]*=\s*\[([\s\S]*?)\]\s*as const;/);
if (!validTabsMatch) {
  console.error('ERROR: Could not find VALID_TABS definition in app/page.tsx');
  process.exit(1);
}

const rawTabs = validTabsMatch[1]
  .split('\n')
  .map(line => line.trim().replace(/[',]/g, ''))
  .filter(Boolean);

console.log('Detected VALID_TABS (' + rawTabs.length + '):', rawTabs);

const tabMappingResults = [];

for (const tab of rawTabs) {
  // Check if activeTab === 'tab' is present in JSX
  const conditionRegex = new RegExp(`activeTab\\s*===?\\s*['"]${tab}['"]`);
  const isRendered = conditionRegex.test(pageContent);

  // Extract component name if rendered
  let componentName = null;
  if (isRendered) {
    const componentRegex = new RegExp(`activeTab\\s*===?\\s*['"]${tab}['"][\\s\\S]*?<([A-Z][a-zA-Z0-9]+)`, 'm');
    const compMatch = pageContent.match(componentRegex);
    componentName = compMatch ? compMatch[1] : 'Unknown';
  }

  tabMappingResults.push({
    tab,
    isRendered,
    componentName
  });
}

console.log('\n--- TAB MAPPING VERIFICATION TABLE ---');
console.table(tabMappingResults);

const unmapped = tabMappingResults.filter(r => !r.isRendered);
if (unmapped.length > 0) {
  console.error('\n[CHALLENGE FINDING] The following tabs in VALID_TABS are NOT mapped to any component in app/page.tsx:');
  unmapped.forEach(u => console.error(`  ❌ Tab '${u.tab}' has NO component rendered in app/page.tsx!`));
  process.exit(2);
} else {
  console.log('\n[PASS] All tabs in VALID_TABS map to components rendered in app/page.tsx.');
}
