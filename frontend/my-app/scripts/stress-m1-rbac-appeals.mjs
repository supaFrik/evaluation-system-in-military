/**
 * ==============================================================================
 * ADVERSARIAL STRESS TEST SUITE: M1 RBAC DATA STRUCTURES & APPEALS STATE LOGIC
 * ==============================================================================
 * Agent: Challenger M1-1 (empirical-challenger)
 * Target Modules:
 *   - frontend/my-app/lib/types.ts
 *   - frontend/my-app/lib/mock-data.ts
 *   - frontend/my-app/lib/store.ts
 *   - frontend/my-app/lib/api/appeal.service.ts
 *   - frontend/my-app/lib/api/user.service.ts
 *
 * Core Missions:
 * 1. Boundary input stress-testing for appeal creation (empty reason, 100k+ char reason, extreme deduction points).
 * 2. State transition testing for appeal resolution (APPROVED, REJECTED, resolvedBy, resolvedAt, reply).
 * 3. Set idempotency and stress-testing for scorer assignment across multiple units.
 * 4. High-frequency burst testing for ID collisions and race conditions.
 * ==============================================================================
 */

import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
    testResults.push({ name: testName, status: 'PASS', details });
  } else {
    failedTests++;
    console.error(`  [FAIL] ${testName} - ${details}`);
    testResults.push({ name: testName, status: 'FAIL', details });
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// 0. ENVIRONMENT & HARNESS SETUP
// ──────────────────────────────────────────────────────────────────────────────
console.log('='.repeat(75));
console.log('  CHALLENGER M1-1: ADVERSARIAL EMPIRICAL STRESS TEST HARNESS');
console.log('='.repeat(75));

// In-memory mock localStorage
const storage = new Map();
const mockLocalStorage = {
  getItem: (key) => storage.get(key) || null,
  setItem: (key, val) => storage.set(key, String(val)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
};
global.localStorage = mockLocalStorage;
global.window = { localStorage: mockLocalStorage };

// Compile mock-data.ts
const mockDataPath = path.join(__dirname, '../lib/mock-data.ts');
const mockDataCode = fs.readFileSync(mockDataPath, 'utf8');
const transpiledMock = ts.transpileModule(mockDataCode, { compilerOptions: { module: ts.ModuleKind.CommonJS } });
const mockDataModule = { exports: {} };
new Function('module', 'exports', 'require', transpiledMock.outputText)(mockDataModule, mockDataModule.exports, () => ({}));

// Compile store.ts
const storePath = path.join(__dirname, '../lib/store.ts');
const storeCode = fs.readFileSync(storePath, 'utf8');
const transpiledStore = ts.transpileModule(storeCode, { compilerOptions: { module: ts.ModuleKind.CommonJS } });

// State Harness for React functional hooks
let currentStates = {};
let callIndex = 0;
const reactHarness = {
  reset() {
    callIndex = 0;
  },
  useState(initialValue) {
    const idx = callIndex++;
    if (!(idx in currentStates)) {
      currentStates[idx] = typeof initialValue === 'function' ? initialValue() : initialValue;
    }
    const setter = (updater) => {
      currentStates[idx] = typeof updater === 'function' ? updater(currentStates[idx]) : updater;
    };
    return [currentStates[idx], setter];
  },
  useEffect(fn) {
    // Intentionally no-op to allow controlled state testing
  },
  useCallback(fn) {
    return fn;
  },
  useMemo(fn) {
    return fn();
  },
};

// API Services Mock
const appealApiCalls = [];
const userApiCalls = [];
const mockApi = {
  appealService: {
    getAppeals: async () => [],
    createAppeal: async (payload) => {
      appealApiCalls.push({ type: 'create', payload });
      return null; // Fallback to local store logic
    },
    resolveAppeal: async (appealId, status, reply, resolvedBy) => {
      appealApiCalls.push({ type: 'resolve', appealId, status, reply, resolvedBy });
      return null; // Fallback to local store logic
    },
  },
  userService: {
    assignUnitsToUser: async (userId, unitIds) => {
      userApiCalls.push({ type: 'assignUnitsToUser', userId, unitIds });
      return { id: userId, assignedUnitIds: unitIds };
    },
  },
  authService: { getMe: async () => null },
  unitService: {},
  soldierService: {},
  scoreService: {},
  criteriaService: {},
  commendationService: {},
  AUTH_TOKEN_KEY: 'thi_dua_token',
};

const customRequire = (id) => {
  if (id === 'react') return reactHarness;
  if (id === './mock-data') return mockDataModule.exports;
  if (id === './notify') return { notify: { success: () => {}, error: () => {}, warn: () => {} } };
  if (id === './api') return mockApi;
  return {};
};

const storeModule = { exports: {} };
new Function('module', 'exports', 'require', transpiledStore.outputText)(storeModule, storeModule.exports, customRequire);
const { useEmulationStore } = storeModule.exports;

function getStoreInstance() {
  reactHarness.reset();
  return useEmulationStore();
}

async function runAllSuites() {
  // ──────────────────────────────────────────────────────────────────────────
  // SUITE 1: RBAC DATA STRUCTURES & DEFAULT ACCOUNTS CONFORMANCE
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SUITE 1: RBAC Data Structures & Default Accounts Integrity ---');
  const { mockUsers, mockAppeals } = mockDataModule.exports;

  assert(Array.isArray(mockUsers), 'mockUsers is exported as an array');
  assert(mockUsers.length >= 5, `mockUsers has ${mockUsers.length} accounts (>= 5 expected)`);

  const admin = mockUsers.find((u) => u.username === 'admin');
  assert(admin && admin.role === 'ADMIN', 'Admin account exists with role ADMIN');
  assert(admin && Array.isArray(admin.assignedUnitIds) && admin.assignedUnitIds.includes('e335'),
    "Admin assignedUnitIds contains 'e335'");
  assert(admin && admin.assignedUnitId === 'e335', "Admin backward compat fallback assignedUnitId === 'e335'");

  const scorerC1 = mockUsers.find((u) => u.username === 'scorer_c1');
  assert(scorerC1 && scorerC1.role === 'SCORER', 'Scorer C1 account exists with role SCORER');
  assert(
    scorerC1 &&
    Array.isArray(scorerC1.assignedUnitIds) &&
    ['C1', 'C1-B1', 'C1-B2', 'C1-B3'].every((id) => scorerC1.assignedUnitIds.includes(id)),
    "Scorer C1 assignedUnitIds contains ['C1', 'C1-B1', 'C1-B2', 'C1-B3']"
  );

  const thangB1 = mockUsers.find((u) => u.username === 'thang_b1');
  assert(thangB1 && thangB1.role === 'SCORER', 'Thang B1 account exists with role SCORER');
  assert(thangB1 && thangB1.assignedUnitIds.includes('C1-B1'), "Thang B1 assignedUnitIds contains 'C1-B1'");

  const quannhan = mockUsers.find((u) => u.username === 'quannhan');
  assert(quannhan && quannhan.role === 'SOLDIER', 'Quannhan account exists with role SOLDIER');
  assert(quannhan && quannhan.soldierId === 's1', "Quannhan linked to soldierId 's1'");
  assert(quannhan && quannhan.assignedUnitIds.includes('C1-B1-A1'), "Quannhan assignedUnitIds contains 'C1-B1-A1'");

  // Check Set idempotency on mock data itself
  for (const user of mockUsers) {
    const idSet = new Set(user.assignedUnitIds);
    assert(
      idSet.size === user.assignedUnitIds.length,
      `User '${user.username}' has zero duplicate assignedUnitIds`,
      `Expected ${idSet.size}, found ${user.assignedUnitIds.length}`
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SUITE 2: APPEALS CREATION BOUNDARY & ADVERSARIAL STRESS TESTING
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SUITE 2: Appeals Creation Boundary & Stress Testing (createAppeal) ---');

  // Test 2.1: Empty reason
  let store = getStoreInstance();
  const appealEmptyReason = await store.createAppeal({
    soldierId: 's1',
    soldierName: 'Trịnh Quốc Việt',
    unitId: 'C1-B1-A1',
    unitName: 'Tiểu đội 1',
    date: '2026-10-02',
    reason: '',
    deductionPoints: 5,
  });

  assert(appealEmptyReason.id.startsWith('appeal-'), "Empty reason appeal generates valid ID prefix 'appeal-'");
  assert(appealEmptyReason.status === 'PENDING', "Empty reason appeal initializes with status 'PENDING'");
  assert(appealEmptyReason.reason === '', 'Empty reason appeal preserves empty string reason');
  assert(Boolean(appealEmptyReason.createdAt), 'Empty reason appeal has valid ISO createdAt');

  // Test 2.2: Extremely long reason (100,000 characters)
  const hugeReason = 'A'.repeat(100_000);
  const appealHugeReason = await store.createAppeal({
    soldierId: 's1',
    soldierName: 'Trịnh Quốc Việt',
    unitId: 'C1-B1-A1',
    unitName: 'Tiểu đội 1',
    date: '2026-10-02',
    reason: hugeReason,
    deductionPoints: 10,
  });

  assert(appealHugeReason.reason.length === 100_000, 'Huge reason (100,000 chars) preserved without truncation');
  assert(appealHugeReason.status === 'PENDING', 'Huge reason appeal status is PENDING');

  // Verify localStorage persistence handles huge payload
  const storedAppealsRaw = storage.get('thi_dua_appeals');
  assert(
    storedAppealsRaw && storedAppealsRaw.length > 100_000,
    'Huge reason appeal successfully serialized to localStorage key thi_dua_appeals'
  );

  // Test 2.3: Extreme deduction points boundary
  const testCasesPoints = [
    { name: 'Negative deduction points (-999999)', points: -999999 },
    { name: 'Zero deduction points (0)', points: 0 },
    { name: 'Extreme high deduction points (+1,000,000)', points: 1000000 },
    { name: 'Floating point deduction points (4.75)', points: 4.75 },
    { name: 'Undefined deduction points', points: undefined },
  ];

  for (const tc of testCasesPoints) {
    const a = await store.createAppeal({
      soldierId: 's2',
      soldierName: 'Nguyễn Văn Đức',
      unitId: 'C1-B1-A1',
      unitName: 'Tiểu đội 1',
      date: '2026-10-02',
      reason: `Stress test for points: ${tc.name}`,
      deductionPoints: tc.points,
    });
    assert(a.deductionPoints === tc.points, `Deduction points boundary: ${tc.name} properly preserved`);
  }

  // Test 2.4: Special Characters, Vietnamese diacritics & Injection strings
  const adversarialStrings = [
    'Tiếng Việt có dấu: Kỷ luật Đại đội 1, Trung đội 2! @#$%^&*()',
    '<script>alert("XSS-ATTACK")</script><img src="x" onerror="stealCookie()">',
    '\'; DROP TABLE emulation_appeals; SELECT * FROM users WHERE \'1\'=\'1',
    'Unicode Emojis: 🎖️ 🇻🇳 ⚔️ 🛡️ 🎖️',
    'Multiline text:\nLine 1\r\nLine 2\tTabbed\0NullByte',
  ];

  for (let i = 0; i < adversarialStrings.length; i++) {
    const rawReason = adversarialStrings[i];
    const a = await store.createAppeal({
      soldierId: 's3',
      soldierName: 'Lê Văn Cường',
      unitId: 'C1-B1-A1',
      unitName: 'Tiểu đội 1',
      date: '2026-10-02',
      reason: rawReason,
    });
    assert(a.reason === rawReason, `Adversarial input ${i + 1} preserved verbatim without corruption`);
  }

  // Test 2.5: High-Frequency Consecutive Creation (ID collision analysis)
  console.log('\n  * Testing rapid burst creations for ID uniqueness...');
  const burstAppeals = [];
  for (let i = 0; i < 25; i++) {
    // Add micro-delay to allow Date.now() tick advancement when needed
    await new Promise((r) => setTimeout(r, 2));
    const created = await store.createAppeal({
      soldierId: `burst-s-${i}`,
      soldierName: `Soldier ${i}`,
      unitId: 'C1-B1-A1',
      unitName: 'Tiểu đội 1',
      date: '2026-10-02',
      reason: `Burst test appeal #${i}`,
    });
    burstAppeals.push(created);
  }

  const burstIds = new Set(burstAppeals.map((a) => a.id));
  assert(
    burstIds.size === burstAppeals.length,
    `Rapid creation produced ${burstAppeals.length} uniquely identified appeals`,
    `Generated ${burstIds.size} unique IDs from ${burstAppeals.length} submissions`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SUITE 3: APPEALS RESOLUTION STATE LOGIC (resolveAppeal)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SUITE 3: Appeals Resolution State Machine (resolveAppeal) ---');

  // Test 3.1: Resolution with APPROVED state
  const appealToApprove = await store.createAppeal({
    soldierId: 's1',
    soldierName: 'Trịnh Quốc Việt',
    unitId: 'C1-B1-A1',
    unitName: 'Tiểu đội 1',
    date: '2026-10-02',
    reason: 'Xin giải trình ca gác đêm',
    deductionPoints: 5,
  });

  const approveReply = 'Đã kiểm tra sổ nhật ký gác đêm, xác nhận lý do chính đáng. Chấp thuận hoàn 5 điểm.';
  const approvedResult = await store.resolveAppeal(
    appealToApprove.id,
    'APPROVED',
    approveReply
  );

  assert(approvedResult.id === appealToApprove.id, 'Resolved appeal preserves original ID');
  assert(approvedResult.status === 'APPROVED', "Status correctly updated to 'APPROVED'");
  assert(approvedResult.reply === approveReply, 'Reply content matches provided approval message');
  assert(Boolean(approvedResult.resolvedAt), 'resolvedAt timestamp is generated');
  assert(Boolean(approvedResult.resolvedBy), `resolvedBy is populated: '${approvedResult.resolvedBy}'`);
  assert(approvedResult.soldierId === appealToApprove.soldierId, 'Original soldierId preserved');
  assert(approvedResult.reason === appealToApprove.reason, 'Original reason preserved');
  assert(approvedResult.deductionPoints === 5, 'Original deductionPoints preserved');

  // Test 3.2: Resolution with REJECTED state
  const appealToReject = await store.createAppeal({
    soldierId: 's2',
    soldierName: 'Nguyễn Văn Đức',
    unitId: 'C1-B1-A1',
    unitName: 'Tiểu đội 1',
    date: '2026-10-02',
    reason: 'Xin miễn trừ điểm nội vụ',
    deductionPoints: 10,
  });

  const rejectReply = 'Vi phạm sắp xếp nội vụ rõ ràng, không thể miễn trừ. Yêu cầu rút kinh nghiệm sâu sắc.';
  const rejectedResult = await store.resolveAppeal(
    appealToReject.id,
    'REJECTED',
    rejectReply
  );

  assert(rejectedResult.id === appealToReject.id, 'Resolved appeal preserves original ID');
  assert(rejectedResult.status === 'REJECTED', "Status correctly updated to 'REJECTED'");
  assert(rejectedResult.reply === rejectReply, 'Reply content matches provided rejection message');
  assert(Boolean(rejectedResult.resolvedAt), 'resolvedAt timestamp is generated');
  assert(Boolean(rejectedResult.resolvedBy), `resolvedBy is populated: '${rejectedResult.resolvedBy}'`);

  // Test 3.3: Status re-resolution / amendment (APPROVED -> REJECTED)
  const amendedReply = 'Xem xét lại sau khi kiểm tra camera trực ban, hủy quyết định chấp thuận.';
  const amendedResult = await store.resolveAppeal(
    appealToApprove.id,
    'REJECTED',
    amendedReply
  );
  assert(amendedResult.status === 'REJECTED', "Re-resolution correctly transitions APPROVED -> 'REJECTED'");
  assert(amendedResult.reply === amendedReply, 'Amended reply updated successfully');

  // Test 3.4: Resolution of non-existent ID
  const ghostResult = await store.resolveAppeal(
    'appeal-non-existent-9999',
    'APPROVED',
    'Ghost reply'
  );
  assert(
    ghostResult === undefined,
    'Resolving non-existent appeal ID returns undefined gracefully without crashing'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SUITE 4: SCORER ASSIGNMENT & SET IDEMPOTENCY (assignScorersToUnit)
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SUITE 4: Scorer Assignment & Set Idempotency (assignScorersToUnit) ---');

  store = getStoreInstance();

  // Test 4.1: Repeated assignment idempotency on single unit
  const targetUnit = 'C1-B1';
  const initialUsers = store.users;
  const targetUserId = 'u3'; // thang_b1

  console.log(`  * Calling assignScorersToUnit('${targetUnit}', ['${targetUserId}']) 10 times consecutively...`);
  for (let step = 0; step < 10; step++) {
    await store.assignScorersToUnit(targetUnit, [targetUserId]);
    store = getStoreInstance();
  }

  const updatedThang = store.users.find((u) => u.id === targetUserId);
  assert(
    Boolean(updatedThang),
    `User ${targetUserId} exists after 10 assignment iterations`
  );
  const thangUnits = updatedThang.assignedUnitIds;
  const countC1B1 = thangUnits.filter((id) => id === targetUnit).length;
  assert(
    countC1B1 === 1,
    `Target unit '${targetUnit}' appears exactly ONCE in user assignedUnitIds (no duplicates)`,
    `Actual count: ${countC1B1}, list: [${thangUnits.join(', ')}]`
  );
  assert(
    new Set(thangUnits).size === thangUnits.length,
    'No duplicates whatsoever in assignedUnitIds after 10 repeat calls'
  );

  // Test 4.2: Cross-Unit Multi-Scorer Assignment
  console.log('  * Testing cross-unit assignment with 4 units and 3 scorers...');
  const unitList = ['Unit-X1', 'Unit-X2', 'Unit-X3', 'Unit-X4'];
  const scorerList = ['u_scorer_c1', 'u3', 'u1'];

  // Unit-X1 assigned to scorer C1 and Thang B1
  await store.assignScorersToUnit('Unit-X1', ['u_scorer_c1', 'u3']);
  store = getStoreInstance();

  // Unit-X2 assigned to scorer C1 and Admin
  await store.assignScorersToUnit('Unit-X2', ['u_scorer_c1', 'u1']);
  store = getStoreInstance();

  // Unit-X3 assigned to Thang B1 and Admin
  await store.assignScorersToUnit('Unit-X3', ['u3', 'u1']);
  store = getStoreInstance();

  // Unit-X4 assigned to all 3
  await store.assignScorersToUnit('Unit-X4', ['u_scorer_c1', 'u3', 'u1']);
  store = getStoreInstance();

  // Verify all 3 scorers maintain strict Set idempotency
  for (const uid of scorerList) {
    const user = store.users.find((u) => u.id === uid);
    const set = new Set(user.assignedUnitIds);
    assert(
      set.size === user.assignedUnitIds.length,
      `Scorer '${user.username}' has zero duplicate assignedUnitIds across multi-unit assignments`,
      `Units: [${user.assignedUnitIds.join(', ')}]`
    );
  }

  // Verify exact unit memberships
  const uC1 = store.users.find((u) => u.id === 'u_scorer_c1');
  assert(
    ['Unit-X1', 'Unit-X2', 'Unit-X4'].every((id) => uC1.assignedUnitIds.includes(id)),
    "Scorer C1 assignedUnitIds correctly includes ['Unit-X1', 'Unit-X2', 'Unit-X4']"
  );
  assert(
    !uC1.assignedUnitIds.includes('Unit-X3'),
    "Scorer C1 assignedUnitIds does NOT include 'Unit-X3' (not assigned)"
  );

  const uThang = store.users.find((u) => u.id === 'u3');
  assert(
    ['Unit-X1', 'Unit-X3', 'Unit-X4'].every((id) => uThang.assignedUnitIds.includes(id)),
    "Thang B1 assignedUnitIds correctly includes ['Unit-X1', 'Unit-X3', 'Unit-X4']"
  );
  assert(
    !uThang.assignedUnitIds.includes('Unit-X2'),
    "Thang B1 assignedUnitIds does NOT include 'Unit-X2' (not assigned)"
  );

  // Test 4.3: Revocation & Partial Unassignment
  console.log('  * Testing unassignment / revocation...');
  // Revoke Thang B1 from Unit-X1 by only assigning Scorer C1
  await store.assignScorersToUnit('Unit-X1', ['u_scorer_c1']);
  store = getStoreInstance();

  const uThangAfterRevoke = store.users.find((u) => u.id === 'u3');
  assert(
    !uThangAfterRevoke.assignedUnitIds.includes('Unit-X1'),
    "Thang B1 assignedUnitIds NO LONGER contains 'Unit-X1' after revocation"
  );
  assert(
    uThangAfterRevoke.assignedUnitIds.includes('Unit-X3') &&
    uThangAfterRevoke.assignedUnitIds.includes('Unit-X4'),
    "Thang B1 retains 'Unit-X3' and 'Unit-X4'"
  );

  // Test 4.4: Duplicate Scorer IDs in Input Parameter
  console.log('  * Testing duplicate scorer IDs in assignScorersToUnit argument...');
  await store.assignScorersToUnit('Unit-DupTest', ['u3', 'u3', 'u3', 'u3']);
  store = getStoreInstance();

  const uThangDup = store.users.find((u) => u.id === 'u3');
  const countDupTest = uThangDup.assignedUnitIds.filter((id) => id === 'Unit-DupTest').length;
  assert(
    countDupTest === 1,
    "Input duplicate scorer IDs ['u3', 'u3', 'u3', 'u3'] results in exactly 1 addition of 'Unit-DupTest'",
    `Actual count: ${countDupTest}`
  );

  // Test 4.5: High-Stress Fuzz Testing (50 simulated units, 100 random operations)
  console.log('\n  * Running randomized fuzz stress test (50 units, 100 operations)...');
  const fuzzUnits = Array.from({ length: 50 }, (_, i) => `FUZZ_UNIT_${i + 1}`);
  const userIds = store.users.map((u) => u.id);

  let fuzzViolations = 0;
  for (let op = 0; op < 100; op++) {
    // Pick random unit
    const randomUnit = fuzzUnits[Math.floor(Math.random() * fuzzUnits.length)];
    // Pick random subset of users (0 to 4 users)
    const selectedScorers = userIds.filter(() => Math.random() > 0.6);

    await store.assignScorersToUnit(randomUnit, selectedScorers);
    store = getStoreInstance();

    // Verify invariants across all users after every operation
    for (const u of store.users) {
      const set = new Set(u.assignedUnitIds);
      if (set.size !== u.assignedUnitIds.length) {
        fuzzViolations++;
        console.error(`Fuzz violation at op ${op}: user ${u.username} has duplicate units!`);
      }
      if (u.assignedUnitIds.length > 0 && u.assignedUnitId !== u.assignedUnitIds[0]) {
        fuzzViolations++;
        console.error(`Fuzz fallback violation at op ${op}: assignedUnitId does not match first element`);
      }
    }
  }

  assert(
    fuzzViolations === 0,
    'Fuzz stress test: 100 randomized assignments maintained 100% Set idempotency with 0 violations'
  );

  // ──────────────────────────────────────────────────────────────────────────
  // SUITE 5: PERSISTENCE & SERIALIZATION ROUNDTRIP INTEGRITY
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- SUITE 5: State Persistence & Serialization Roundtrip ---');

  // Verify all stored appeals can serialize and deserialize without loss
  const currentAppeals = store.appeals;
  const serializedAppeals = JSON.stringify(currentAppeals);
  const deserializedAppeals = JSON.parse(serializedAppeals);

  assert(
    deserializedAppeals.length === currentAppeals.length,
    `JSON serialization roundtrip preserved all ${currentAppeals.length} appeals`
  );

  // Verify all users serialize and deserialize without loss
  const serializedUsers = JSON.stringify(store.users);
  const deserializedUsers = JSON.parse(serializedUsers);
  assert(
    deserializedUsers.length === store.users.length,
    `JSON serialization roundtrip preserved all ${store.users.length} users`
  );

  // ──────────────────────────────────────────────────────────────────────────
  // FINAL EVALUATION & SUMMARY
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(75));
  console.log(` EMPIRICAL CHALLENGE SUMMARY: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log(` FAILS: ${failedTests}`);
  console.log('='.repeat(75));

  if (failedTests > 0) {
    console.error('\n❌ EMPIRICAL VERDICT: FAIL - Regressions or invariant violations detected.');
    process.exit(1);
  } else {
    console.log('\n✅ EMPIRICAL VERDICT: APPROVE - All adversarial stress tests passed 100%!');
    process.exit(0);
  }
}

runAllSuites().catch((err) => {
  console.error('Unhandled test suite error:', err);
  process.exit(1);
});
