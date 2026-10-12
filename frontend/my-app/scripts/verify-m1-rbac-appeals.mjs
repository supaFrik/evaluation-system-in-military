/**
 * Automated Verification Script for Milestone 1: RBAC Data Models & Appeals Store
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function check(condition, desc) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ ${desc}`);
  } else {
    failedChecks++;
    console.error(`  ✗ FAIL: ${desc}`);
  }
}

console.log('===============================================================');
console.log(' VERIFICATION SUITE: M1 RBAC DATA MODELS & APPEALS STORE');
console.log('===============================================================');

// 1. Check types.ts
console.log('\n--- 1. Checking lib/types.ts ---');
const typesPath = path.join(__dirname, '../lib/types.ts');
const typesSource = fs.readFileSync(typesPath, 'utf-8');

check(
  /export\s+type\s+UserRole\s*=\s*'ADMIN'\s*\|\s*'SCORER'\s*\|\s*'SOLDIER'\s*\|\s*'COMMANDER'\s*\|\s*'USER';/.test(typesSource),
  "UserRole includes 'ADMIN' | 'SCORER' | 'SOLDIER' | 'COMMANDER' | 'USER'"
);

check(
  /export\s+type\s+AppealStatus\s*=\s*'PENDING'\s*\|\s*'APPROVED'\s*\|\s*'REJECTED';/.test(typesSource),
  "AppealStatus includes 'PENDING' | 'APPROVED' | 'REJECTED'"
);

check(
  /export\s+interface\s+EmulationAppeal\s*\{[\s\S]*?id:\s*string;[\s\S]*?soldierId:\s*string;[\s\S]*?soldierName:\s*string;[\s\S]*?unitId:\s*string;[\s\S]*?unitName:\s*string;[\s\S]*?date:\s*string;[\s\S]*?reason:\s*string;[\s\S]*?status:\s*AppealStatus;[\s\S]*?createdAt:\s*string;[\s\S]*?\}/.test(typesSource),
  "EmulationAppeal interface contains required fields"
);

check(
  /interface\s+UserAccount\s*\{[\s\S]*?assignedUnitIds:\s*string\[\];[\s\S]*?assignedUnitId\?:\s*string;/.test(typesSource),
  "UserAccount contains assignedUnitIds: string[] and assignedUnitId?: string"
);

// 2. Check mock-data.ts
console.log('\n--- 2. Checking lib/mock-data.ts ---');
const mockDataPath = path.join(__dirname, '../lib/mock-data.ts');
const mockDataSource = fs.readFileSync(mockDataPath, 'utf-8');

check(mockDataSource.includes('export const mockUsers: UserAccount[]'), 'mockUsers is exported');
check(mockDataSource.includes('export const MOCK_USERS = mockUsers'), 'MOCK_USERS alias is exported');
check(mockDataSource.includes('export const mockAppeals: EmulationAppeal[]'), 'mockAppeals is exported');
check(mockDataSource.includes('export const MOCK_APPEALS = mockAppeals'), 'MOCK_APPEALS alias is exported');

// Check accounts in mockUsers
const requiredAccounts = ['admin', 'scorer_c1', 'thang_b1', 'quannhan', 'user_demo'];
requiredAccounts.forEach((username) => {
  check(
    new RegExp(`username:\\s*'${username}'`).test(mockDataSource),
    `Mock user account '${username}' is defined`
  );
});

check(
  /username:\s*'admin'[\s\S]*?role:\s*'ADMIN'[\s\S]*?assignedUnitIds:\s*\[\s*'e335'\s*\]/.test(mockDataSource),
  "admin account has role: 'ADMIN' and assignedUnitIds: ['e335']"
);

check(
  /username:\s*'scorer_c1'[\s\S]*?role:\s*'SCORER'[\s\S]*?assignedUnitIds:\s*\[\s*'C1',\s*'C1-B1',\s*'C1-B2',\s*'C1-B3'\s*\]/.test(mockDataSource),
  "scorer_c1 account has role: 'SCORER' and assignedUnitIds: ['C1', 'C1-B1', 'C1-B2', 'C1-B3']"
);

check(
  /username:\s*'thang_b1'[\s\S]*?role:\s*'SCORER'[\s\S]*?assignedUnitIds:\s*\[\s*'C1-B1'\s*\]/.test(mockDataSource),
  "thang_b1 account has role: 'SCORER' and assignedUnitIds: ['C1-B1']"
);

check(
  /username:\s*'quannhan'[\s\S]*?role:\s*'SOLDIER'[\s\S]*?soldierId:\s*'s1'[\s\S]*?assignedUnitIds:\s*\[\s*'C1-B1-A1'\s*\]/.test(mockDataSource),
  "quannhan account has role: 'SOLDIER', soldierId: 's1' and assignedUnitIds: ['C1-B1-A1']"
);

check(
  /username:\s*'user_demo'[\s\S]*?role:\s*'SOLDIER'[\s\S]*?soldierId:\s*'s2'[\s\S]*?assignedUnitIds:\s*\[\s*'C1-B1-A1'\s*\]/.test(mockDataSource),
  "user_demo account has role: 'SOLDIER', soldierId: 's2' and assignedUnitIds: ['C1-B1-A1']"
);

check(
  /status:\s*'PENDING'/.test(mockDataSource) &&
  /status:\s*'APPROVED'/.test(mockDataSource) &&
  /status:\s*'REJECTED'/.test(mockDataSource),
  "mockAppeals contains PENDING, APPROVED, and REJECTED samples with replies"
);

// 3. Check appeal.service.ts & api/index.ts
console.log('\n--- 3. Checking lib/api/appeal.service.ts & api/index.ts ---');
const appealServicePath = path.join(__dirname, '../lib/api/appeal.service.ts');
check(fs.existsSync(appealServicePath), 'appeal.service.ts exists');
const appealServiceSource = fs.readFileSync(appealServicePath, 'utf-8');

check(appealServiceSource.includes('getAppeals:'), 'appealService has getAppeals()');
check(appealServiceSource.includes('createAppeal:'), 'appealService has createAppeal()');
check(appealServiceSource.includes('resolveAppeal:'), 'appealService has resolveAppeal()');

const apiIndexPath = path.join(__dirname, '../lib/api/index.ts');
const apiIndexSource = fs.readFileSync(apiIndexPath, 'utf-8');
check(apiIndexSource.includes("export * from './appeal.service'"), 'api/index.ts exports appeal.service');

// 4. Check user.service.ts
console.log('\n--- 4. Checking lib/api/user.service.ts ---');
const userServicePath = path.join(__dirname, '../lib/api/user.service.ts');
const userServiceSource = fs.readFileSync(userServicePath, 'utf-8');
check(userServiceSource.includes('assignUnitsToUser:'), 'userService has assignUnitsToUser()');

// 5. Check store.ts
console.log('\n--- 5. Checking lib/store.ts ---');
const storePath = path.join(__dirname, '../lib/store.ts');
const storeSource = fs.readFileSync(storePath, 'utf-8');

check(storeSource.includes("APPEALS: 'thi_dua_appeals'"), "STORAGE_KEYS has APPEALS: 'thi_dua_appeals'");
check(storeSource.includes('const [appeals, setAppeals] = useState<EmulationAppeal[]>('), 'store declares appeals state');
check(storeSource.includes('const createAppeal = async ('), 'store defines createAppeal()');
check(storeSource.includes('const resolveAppeal = async ('), 'store defines resolveAppeal()');
check(storeSource.includes('const assignScorersToUnit = async ('), 'store defines assignScorersToUnit()');

// Check store return object
check(/return\s*\{[\s\S]*?assignScorersToUnit,[\s\S]*?appeals,[\s\S]*?createAppeal,[\s\S]*?resolveAppeal,/.test(storeSource), 'useEmulationStore exports assignScorersToUnit, appeals, createAppeal, resolveAppeal');

// Summary
console.log('\n===============================================================');
console.log(` RESULT: ${passedChecks}/${totalChecks} checks passed (${failedChecks} failed)`);
console.log('===============================================================');

if (failedChecks > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL M1 RBAC & APPEALS CHECKS PASSED PERFECTLY!');
}
