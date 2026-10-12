import fs from 'fs';
import path from 'path';

const unitManagementPath = path.resolve('components/unit/unit-management.tsx');
const pagePath = path.resolve('app/page.tsx');

let passed = 0;
let failed = 0;

function check(title, condition, details = '') {
  if (condition) {
    console.log(`  ✓ ${title}`);
    passed++;
  } else {
    console.error(`  ✗ ${title} - ${details}`);
    failed++;
  }
}

console.log('===============================================================');
console.log(' VERIFICATION SUITE: M2 UNIT TREE MINIMALIST UI & ASSIGN SCORER');
console.log('===============================================================');

console.log('\n--- 1. Checking components/unit/unit-management.tsx ---');
const unitContent = fs.readFileSync(unitManagementPath, 'utf8');

// A. UnitManagementProps
check(
  'UnitManagementProps contains users?: UserAccount[]',
  /users\?:\s*UserAccount\[\];/.test(unitContent)
);
check(
  'UnitManagementProps contains onAssignScorers?: (unitId: string, scorerUserIds: string[]) => Promise<any>',
  /onAssignScorers\?:\s*\(unitId:\s*string,\s*scorerUserIds:\s*string\[\]\)\s*=>\s*Promise<any>;/.test(unitContent)
);
check(
  'UnitManagementProps does NOT contain onNavigateToScoring',
  !unitContent.includes('onNavigateToScoring')
);
check(
  'UnitManagementProps does NOT contain onNavigateToIndividualEmulation',
  !unitContent.includes('onNavigateToIndividualEmulation')
);

// B. Removed action buttons & icons
check(
  'ClipboardCheck icon is completely removed',
  !unitContent.includes('ClipboardCheck')
);
check(
  'TrendingUp icon is completely removed',
  !unitContent.includes('TrendingUp')
);
check(
  'Award icon is completely removed',
  !unitContent.includes('Award')
);
check(
  'Text "Nhập điểm" is removed from action buttons',
  !unitContent.includes('>Nhập điểm<') && !unitContent.includes('<span>Nhập điểm</span>')
);
check(
  'Text "Xem thi đua" is removed from action buttons',
  !unitContent.includes('>Xem thi đua<') && !unitContent.includes('<span>Xem thi đua</span>')
);

// C. Read-only soldier count badge
check(
  'Tree view soldier headcount badge is read-only <div> without onClick',
  /<div[\s\S]*?title=\{`Quân số biên chế hiện tại:\s*\$\{node\.totalSoldiers[\s\S]*?<span>\{node\.totalSoldiers\s*\|\|\s*0\}\s*đồng chí<\/span>/m.test(unitContent)
);
check(
  'Table view soldier headcount badge is read-only <span> without onClick',
  /<span[\s\S]*?title=\{`Quân số biên chế hiện tại:\s*\$\{unit\.totalSoldiers[\s\S]*?<span>\{unit\.totalSoldiers\s*\|\|\s*0\}\s*đồng chí<\/span>/m.test(unitContent)
);

// D. Key icon in Action buttons
check(
  'Tree view action buttons include Key icon for scorer assignment',
  /onClick=\{\(\)\s*=>\s*handleOpenAssignScorers\(node\)\}[\s\S]*?title="Phân quyền cán bộ chấm điểm"[\s\S]*?<Key\s/m.test(unitContent)
);
check(
  'Table view action buttons include Key icon for scorer assignment',
  /onClick=\{\(\)\s*=>\s*handleOpenAssignScorers\(unit\)\}[\s\S]*?title="Phân quyền cán bộ chấm điểm"[\s\S]*?<Key\s/m.test(unitContent)
);

// E. Scorer Tag on cards & table rows
check(
  'Tree view displays scorer tag with Key icon and handles click',
  /unitScorers\.length\s*>\s*0\s*\?[\s\S]*?handleOpenAssignScorers\(node\)[\s\S]*?<Key\s+className="h-3\.5 w-3\.5 text-indigo-600/m.test(unitContent)
);
check(
  'Tree view displays "+ Chưa phân quyền chấm" button when unitScorers is empty',
  /handleOpenAssignScorers\(node\)[\s\S]*?\+\s*Chưa phân quyền chấm/m.test(unitContent)
);
check(
  'Table view displays Cán bộ chấm điểm header and column cell',
  /<th[\s\S]*?>Cán bộ chấm điểm<\/th>/m.test(unitContent) &&
  /unitScorers\.length\s*>\s*0\s*\?[\s\S]*?handleOpenAssignScorers\(unit\)/m.test(unitContent)
);

// F. Assign Scorer Modal
check(
  'Assign Scorer Modal is implemented with header',
  /Phân quyền Chấm điểm:\s*\{activeUnitForScorer\.name\}/m.test(unitContent)
);
check(
  'Assign Scorer Modal has search input',
  /value=\{scorerSearchTerm\}[\s\S]*?onChange=\{\(e\)\s*=>\s*setScorerSearchTerm\(e\.target\.value\)\}/m.test(unitContent)
);
check(
  'Assign Scorer Modal filters candidate list',
  /candidateScorers\.map\(\(user\)\s*=>/m.test(unitContent)
);
check(
  'Assign Scorer Modal has checkbox for multi-select',
  /type="checkbox"[\s\S]*?checked=\{isChecked\}/m.test(unitContent)
);
check(
  'Assign Scorer Modal displays other assigned units tag',
  /Đang chấm:\s*\{otherAssignedUnits\.map/m.test(unitContent)
);
check(
  'Assign Scorer Modal has "Bỏ chọn tất cả" button',
  /onClick=\{\(\)\s*=>\s*setSelectedScorerUserIds\(\[\]\)\}[\s\S]*?Bỏ chọn tất cả/m.test(unitContent)
);
check(
  'Assign Scorer Modal has "Lưu phân quyền" button invoking onAssignScorers',
  /onClick=\{handleSubmitAssignScorers\}[\s\S]*?Lưu phân quyền/m.test(unitContent) &&
  /onAssignScorers\(activeUnitForScorer\.id,\s*selectedScorerUserIds\)/.test(unitContent)
);

console.log('\n--- 2. Checking app/page.tsx ---');
const pageContent = fs.readFileSync(pagePath, 'utf8');

check(
  'app/page.tsx destructures users from useEmulationStore',
  /const\s*\{[\s\S]*?users,[\s\S]*?\}\s*=\s*useEmulationStore\(\);/m.test(pageContent)
);
check(
  'app/page.tsx destructures assignScorersToUnit from useEmulationStore',
  /const\s*\{[\s\S]*?assignScorersToUnit,[\s\S]*?\}\s*=\s*useEmulationStore\(\);/m.test(pageContent)
);
check(
  'UnitManagement receives users={users}',
  /<UnitManagement[\s\S]*?users=\{users\}/m.test(pageContent)
);
check(
  'UnitManagement receives onAssignScorers={assignScorersToUnit}',
  /<UnitManagement[\s\S]*?onAssignScorers=\{assignScorersToUnit\}/m.test(pageContent)
);
check(
  'UnitManagement does NOT receive onNavigateToScoring',
  !pageContent.includes('onNavigateToScoring={')
);
check(
  'UnitManagement does NOT receive onNavigateToIndividualEmulation',
  !pageContent.includes('onNavigateToIndividualEmulation={')
);

console.log('\n===============================================================');
console.log(` RESULT: ${passed}/${passed + failed} checks passed (${failed} failed)`);
console.log('===============================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL M2 UNIT TREE & ASSIGN SCORER CHECKS PASSED PERFECTLY!\n');
}
