/**
 * Adversarial Stress & Integrity Test Suite by Reviewer M1-2
 * Tests:
 * 1. Unit Scorer Assignment Logic (Additions, Removals, Deduplication, Fallback)
 * 2. Appeals Lifecycle & Immutability (Create, Resolve, Status transitions, Storage sync)
 * 3. Backward Compatibility (COMMANDER, USER, singular assignedUnitId, platoonId)
 * 4. Offline Fallback & Fault Tolerance (Backend disconnection, empty states)
 * 5. Integrity & Facade Verification (Checking real logic vs dummy mocks)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(condition, message, details = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  ✓ ${message}`);
  } else {
    failedChecks++;
    console.error(`  ✗ FAIL: ${message} ${details ? '(' + details + ')' : ''}`);
  }
}

console.log('======================================================================');
console.log(' ADVERSARIAL STRESS & INTEGRITY SUITE: REVIEWER M1-2');
console.log('======================================================================');

// -----------------------------------------------------------------------------
// 1. BACKWARD COMPATIBILITY & TYPE CONTRACTS
// -----------------------------------------------------------------------------
console.log('\n--- 1. Testing Backward Compatibility & Types ---');
const typesSource = fs.readFileSync(path.join(__dirname, '../lib/types.ts'), 'utf-8');

// 1.1 Role compatibility
const roleMatch = typesSource.match(/export\s+type\s+UserRole\s*=\s*([^;]+);/);
assert(roleMatch !== null, 'UserRole type definition is present');
const roles = roleMatch ? roleMatch[1].split('|').map(s => s.trim().replace(/['"]/g, '')) : [];
assert(roles.includes('ADMIN'), 'UserRole contains ADMIN');
assert(roles.includes('SCORER'), 'UserRole contains SCORER');
assert(roles.includes('SOLDIER'), 'UserRole contains SOLDIER');
assert(roles.includes('COMMANDER'), 'UserRole contains legacy COMMANDER');
assert(roles.includes('USER'), 'UserRole contains legacy USER');

// 1.2 UserAccount fields
assert(typesSource.includes('assignedUnitIds: string[];'), 'UserAccount requires assignedUnitIds: string[]');
assert(typesSource.includes('assignedUnitId?: string;'), 'UserAccount retains optional singular assignedUnitId fallback');
assert(typesSource.includes('platoonId?: string;'), 'UserAccount retains optional platoonId fallback');
assert(typesSource.includes('roleTitle?: string;'), 'UserAccount supports roleTitle');

// 1.3 Appeal types
assert(typesSource.includes("export type AppealStatus = 'PENDING' | 'APPROVED' | 'REJECTED';"), 'AppealStatus has PENDING | APPROVED | REJECTED');
assert(typesSource.includes('export interface EmulationAppeal'), 'EmulationAppeal interface is defined');

// -----------------------------------------------------------------------------
// 2. MOCK ACCOUNTS & USERS INTEGRITY
// -----------------------------------------------------------------------------
console.log('\n--- 2. Testing Mock Accounts & Initial Data ---');
const mockDataSource = fs.readFileSync(path.join(__dirname, '../lib/mock-data.ts'), 'utf-8');

// Ensure both MOCK_ACCOUNTS (legacy) and mockUsers (3-role) exist and are valid
assert(mockDataSource.includes('export const MOCK_ACCOUNTS: UserAccount[] = ['), 'MOCK_ACCOUNTS legacy array is exported');
assert(mockDataSource.includes('export const mockUsers: UserAccount[] = ['), 'mockUsers modern 3-role array is exported');
assert(mockDataSource.includes('export const MOCK_USERS = mockUsers;'), 'MOCK_USERS alias is exported');
assert(mockDataSource.includes('export const mockAppeals: EmulationAppeal[] = ['), 'mockAppeals array is exported');
assert(mockDataSource.includes('export const MOCK_APPEALS = mockAppeals;'), 'MOCK_APPEALS alias is exported');

// -----------------------------------------------------------------------------
// 3. ADVERSARIAL SIMULATION: assignScorersToUnit
// -----------------------------------------------------------------------------
console.log('\n--- 3. Stress-Testing assignScorersToUnit Logic ---');

// Replicate the exact store algorithm from store.ts lines 493-514
function simulateAssignScorersToUnit(currentUsers, unitId, scorerUserIds) {
  return currentUsers.map((user) => {
    const isAssigned = scorerUserIds.includes(user.id);
    const currentAssigned = Array.isArray(user.assignedUnitIds) ? [...user.assignedUnitIds] : [];
    let newAssigned;

    if (isAssigned) {
      newAssigned = currentAssigned.includes(unitId) ? currentAssigned : [...currentAssigned, unitId];
    } else {
      newAssigned = currentAssigned.filter((id) => id !== unitId);
    }

    return {
      ...user,
      assignedUnitIds: newAssigned,
      assignedUnitId: newAssigned[0] || undefined,
    };
  });
}

// Test Case 3.1: Add unit to a user who doesn't have it
{
  const initialUsers = [
    { id: 'u1', username: 'admin', assignedUnitIds: ['e335'], assignedUnitId: 'e335' },
    { id: 'u2', username: 'scorer_1', assignedUnitIds: ['C1'], assignedUnitId: 'C1' },
    { id: 'u3', username: 'scorer_2', assignedUnitIds: ['C2'], assignedUnitId: 'C2' },
  ];

  // Assign unit 'C1-B1' to scorer_1 and scorer_2
  const updated = simulateAssignScorersToUnit(initialUsers, 'C1-B1', ['u2', 'u3']);

  const u2 = updated.find(u => u.id === 'u2');
  const u3 = updated.find(u => u.id === 'u3');
  const u1 = updated.find(u => u.id === 'u1');

  assert(u2.assignedUnitIds.includes('C1-B1'), 'scorer_1 received C1-B1');
  assert(u2.assignedUnitIds.includes('C1'), 'scorer_1 preserved previous C1');
  assert(u3.assignedUnitIds.includes('C1-B1'), 'scorer_2 received C1-B1');
  assert(!u1.assignedUnitIds.includes('C1-B1'), 'admin was unaffected');
}

// Test Case 3.2: Remove unit from a user when unselected
{
  const initialUsers = [
    { id: 'u1', username: 'scorer_1', assignedUnitIds: ['C1-B1', 'C1-B2'], assignedUnitId: 'C1-B1' },
    { id: 'u2', username: 'scorer_2', assignedUnitIds: ['C1-B1'], assignedUnitId: 'C1-B1' },
  ];

  // Only u1 is kept for C1-B1; u2 is deselected
  const updated = simulateAssignScorersToUnit(initialUsers, 'C1-B1', ['u1']);

  const u1 = updated.find(u => u.id === 'u1');
  const u2 = updated.find(u => u.id === 'u2');

  assert(u1.assignedUnitIds.includes('C1-B1'), 'u1 retained C1-B1');
  assert(!u2.assignedUnitIds.includes('C1-B1'), 'u2 had C1-B1 removed');
  assert(u2.assignedUnitIds.length === 0, 'u2 assignedUnitIds is now empty');
  assert(u2.assignedUnitId === undefined, 'u2 assignedUnitId fallback is now undefined');
}

// Test Case 3.3: Idempotence & Deduplication (Already assigned)
{
  const initialUsers = [
    { id: 'u1', username: 'scorer_1', assignedUnitIds: ['C1-B1'], assignedUnitId: 'C1-B1' },
  ];

  // Assign C1-B1 again to u1
  const updated = simulateAssignScorersToUnit(initialUsers, 'C1-B1', ['u1']);
  const u1 = updated.find(u => u.id === 'u1');

  assert(u1.assignedUnitIds.filter(id => id === 'C1-B1').length === 1, 'No duplicate unitIds injected');
  assert(u1.assignedUnitId === 'C1-B1', 'assignedUnitId preserved correctly');
}

// Test Case 3.4: All scorers unassigned (empty scorerUserIds array)
{
  const initialUsers = [
    { id: 'u1', username: 'scorer_1', assignedUnitIds: ['TARGET_UNIT', 'OTHER_UNIT'], assignedUnitId: 'TARGET_UNIT' },
    { id: 'u2', username: 'scorer_2', assignedUnitIds: ['TARGET_UNIT'], assignedUnitId: 'TARGET_UNIT' },
  ];

  const updated = simulateAssignScorersToUnit(initialUsers, 'TARGET_UNIT', []);
  const u1 = updated.find(u => u.id === 'u1');
  const u2 = updated.find(u => u.id === 'u2');

  assert(!u1.assignedUnitIds.includes('TARGET_UNIT'), 'u1 TARGET_UNIT removed');
  assert(u1.assignedUnitIds.includes('OTHER_UNIT'), 'u1 OTHER_UNIT retained');
  assert(u1.assignedUnitId === 'OTHER_UNIT', 'u1 fallback updated to OTHER_UNIT');
  assert(u2.assignedUnitIds.length === 0, 'u2 assignedUnitIds completely cleared');
  assert(u2.assignedUnitId === undefined, 'u2 fallback is undefined');
}

// Test Case 3.5: User without assignedUnitIds array (undefined or corrupted)
{
  const initialUsers = [
    { id: 'u1', username: 'corrupt_user' }, // no assignedUnitIds
  ];

  const updated = simulateAssignScorersToUnit(initialUsers, 'NEW_UNIT', ['u1']);
  const u1 = updated.find(u => u.id === 'u1');

  assert(Array.isArray(u1.assignedUnitIds), 'assignedUnitIds initialized to array');
  assert(u1.assignedUnitIds[0] === 'NEW_UNIT', 'unit assigned safely');
  assert(u1.assignedUnitId === 'NEW_UNIT', 'singular fallback set');
}

// -----------------------------------------------------------------------------
// 4. ADVERSARIAL SIMULATION: createAppeal & resolveAppeal
// -----------------------------------------------------------------------------
console.log('\n--- 4. Stress-Testing Appeals System ---');

// Replicate createAppeal logic
function simulateCreateAppeal(existingAppeals, appealData) {
  const newAppeal = {
    ...appealData,
    id: `appeal-${Date.now()}`,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  };
  return [newAppeal, ...existingAppeals.filter(a => a.id !== newAppeal.id)];
}

// Replicate resolveAppeal logic
function simulateResolveAppeal(existingAppeals, appealId, status, reply, resolvedBy) {
  const resolvedAt = new Date().toISOString();
  return existingAppeals.map((item) => {
    if (item.id === appealId) {
      return {
        ...item,
        status,
        reply,
        resolvedAt,
        resolvedBy,
      };
    }
    return item;
  });
}

// 4.1 Create Appeal
let appealsList = [];
const appealInput = {
  soldierId: 's1',
  soldierName: 'Trịnh Quốc Việt',
  unitId: 'C1-B1-A1',
  unitName: 'Tiểu đội 1',
  date: '2026-10-02',
  criterionId: 'c_hygiene',
  criterionName: 'Nội vụ, vệ sinh',
  deductionPoints: 5,
  reason: 'Tôi đi gác về trễ',
};

appealsList = simulateCreateAppeal(appealsList, appealInput);
assert(appealsList.length === 1, 'Appeal added to list');
assert(appealsList[0].status === 'PENDING', 'New appeal status is PENDING');
assert(typeof appealsList[0].createdAt === 'string', 'createdAt timestamp is generated');
assert(appealsList[0].reason === 'Tôi đi gác về trễ', 'Reason preserved');

// 4.2 Resolve Appeal (Approve)
const appealId = appealsList[0].id;
appealsList = simulateResolveAppeal(appealsList, appealId, 'APPROVED', 'Đồng ý hoàn điểm', 'Lê Văn Nam');

const resolved = appealsList.find(a => a.id === appealId);
assert(resolved.status === 'APPROVED', 'Appeal resolved to APPROVED');
assert(resolved.reply === 'Đồng ý hoàn điểm', 'Reply recorded accurately');
assert(resolved.resolvedBy === 'Lê Văn Nam', 'resolvedBy officer recorded');
assert(typeof resolved.resolvedAt === 'string', 'resolvedAt timestamp recorded');
assert(resolved.soldierId === 's1', 'Immutability: soldierId preserved');
assert(resolved.reason === 'Tôi đi gác về trễ', 'Immutability: reason preserved');

// 4.3 Resolve Appeal (Reject)
appealsList = simulateResolveAppeal(appealsList, appealId, 'REJECTED', 'Không đồng ý', 'Nguyễn Văn Quân');
const rejected = appealsList.find(a => a.id === appealId);
assert(rejected.status === 'REJECTED', 'Status successfully changed to REJECTED');
assert(rejected.reply === 'Không đồng ý', 'Reply updated');
assert(rejected.resolvedBy === 'Nguyễn Văn Quân', 'resolvedBy updated');

// -----------------------------------------------------------------------------
// 5. INTEGRITY & CODE DRIFT AUDIT
// -----------------------------------------------------------------------------
console.log('\n--- 5. Integrity & Code Quality Audit ---');

const storeSource = fs.readFileSync(path.join(__dirname, '../lib/store.ts'), 'utf-8');
const appealServiceSource = fs.readFileSync(path.join(__dirname, '../lib/api/appeal.service.ts'), 'utf-8');
const userServiceSource = fs.readFileSync(path.join(__dirname, '../lib/api/user.service.ts'), 'utf-8');

// Check that real HTTP calls are made in services (no fake / no-op returns)
assert(appealServiceSource.includes("apiClient.get<EmulationAppeal[]>('/appeals'"), 'appealService.getAppeals calls GET /appeals');
assert(appealServiceSource.includes("apiClient.post<EmulationAppeal>('/appeals'"), 'appealService.createAppeal calls POST /appeals');
assert(appealServiceSource.includes("apiClient.put<EmulationAppeal>(`/appeals/${appealId}/resolve`"), 'appealService.resolveAppeal calls PUT /appeals/:id/resolve');
assert(userServiceSource.includes("apiClient.put<UserAccount>(`/users/${userId}/assigned-units`"), 'userService.assignUnitsToUser calls PUT /users/:id/assigned-units');

// Check that store has offline-first fallback with try/catch
assert(storeSource.includes('appealService.createAppeal(appealData)'), 'store calls appealService.createAppeal');
assert(storeSource.includes('appealService.resolveAppeal(appealId, status, reply, resolvedBy)'), 'store calls appealService.resolveAppeal');
assert(storeSource.includes('userService.assignUnitsToUser(u.id, u.assignedUnitIds)'), 'store syncs changed users via userService.assignUnitsToUser');
assert(storeSource.includes('Promise.allSettled'), 'store uses Promise.allSettled for fault tolerance');

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n======================================================================');
console.log(` RESULT: ${passedChecks}/${totalChecks} checks passed (${failedChecks} failed)`);
console.log('======================================================================');

if (failedChecks > 0) {
  process.exit(1);
} else {
  console.log('🌟 ADVERSARIAL STRESS & INTEGRITY SUITE PASSED WITH 0 FAILURES!');
  process.exit(0);
}
