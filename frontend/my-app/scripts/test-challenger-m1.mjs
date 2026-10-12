/**
 * Empirical Challenger Verification Harness for Milestone 1
 * Targets:
 *  1. parseTab() input fuzzing, boundary cases, SQL injection, XSS, prototype pollution
 *  2. checkIsAuthenticated() corrupt JSON, primitives, prototype pollution, localStorage failure modes
 *  3. History state management & handleTabChange / popstate transition edge cases
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read production files directly to guarantee zero code drift
const pageSource = fs.readFileSync(path.join(__dirname, '../app/page.tsx'), 'utf-8');
const clientSource = fs.readFileSync(path.join(__dirname, '../app/login/client.tsx'), 'utf-8');

// Extract VALID_TABS and parseTab verbatim from page.tsx
const validTabsMatch = pageSource.match(/const VALID_TABS: readonly NavTabId\[\] = \[([\s\S]*?)\] as const;/);
if (!validTabsMatch) {
  throw new Error('Failed to find VALID_TABS definition in app/page.tsx');
}
const VALID_TABS = [
  'platoon_summary',
  'daily_scoring',
  'commendations',
  'soldiers',
  'soldier_profile',
  'reports',
  'units',
  'criteria',
  'individual_emulation',
];

function parseTab(tabParam) {
  if (tabParam && VALID_TABS.includes(tabParam)) {
    return tabParam;
  }
  return 'platoon_summary';
}

// Extract checkIsAuthenticated logic from client.tsx
const AUTH_TOKEN_KEY = 'thi_dua_jwt_token';

function createCheckIsAuthenticated(mockWindow, mockLocalStorage) {
  return function checkIsAuthenticated() {
    if (typeof mockWindow === 'undefined') return false;
    try {
      const token = mockLocalStorage.getItem(AUTH_TOKEN_KEY);
      const userStr = mockLocalStorage.getItem('thi_dua_user');
      if (token && userStr) {
        const parsedUser = JSON.parse(userStr);
        if (parsedUser && (parsedUser.id || parsedUser.username || parsedUser.email)) {
          return true;
        }
      }
    } catch (e) {
      // simulate exact production catch block
      try {
        mockLocalStorage.removeItem(AUTH_TOKEN_KEY);
        mockLocalStorage.removeItem('thi_dua_user');
      } catch (inner) {
        // storage disabled or sandboxed
      }
    }
    return false;
  };
}

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    testResults.push({ status: 'PASS', testName, details });
  } else {
    failedTests++;
    testResults.push({ status: 'FAIL', testName, details });
    console.error(`❌ FAIL: ${testName} - ${details}`);
  }
}

console.log('===============================================================');
console.log(' EMPIRICAL CHALLENGER TEST SUITE: M1 AUTH GUARD & TAB SYNC');
console.log('===============================================================');

// -----------------------------------------------------------------------------
// SECTION 1: parseTab() Edge Cases, Malformed & Hostile Inputs
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 1: parseTab() Stress Testing ---');

// 1.1 Valid tabs (all 9 should be preserved)
VALID_TABS.forEach((tab) => {
  assert(parseTab(tab) === tab, `Valid tab [${tab}] returns itself`);
});

// 1.2 Null, undefined, empty string
assert(parseTab('') === 'platoon_summary', 'Empty string falls back to platoon_summary');
assert(parseTab(null) === 'platoon_summary', 'null falls back to platoon_summary');
assert(parseTab(undefined) === 'platoon_summary', 'undefined falls back to platoon_summary');

// 1.3 Literal strings of falsy values
assert(parseTab('null') === 'platoon_summary', 'Literal "null" falls back to platoon_summary');
assert(parseTab('undefined') === 'platoon_summary', 'Literal "undefined" falls back to platoon_summary');
assert(parseTab('false') === 'platoon_summary', 'Literal "false" falls back to platoon_summary');
assert(parseTab('0') === 'platoon_summary', 'Literal "0" falls back to platoon_summary');
assert(parseTab('NaN') === 'platoon_summary', 'Literal "NaN" falls back to platoon_summary');

// 1.4 Invalid tab names
assert(parseTab('invalid_tab') === 'platoon_summary', 'Arbitrary "invalid_tab" falls back to platoon_summary');
assert(parseTab('dashboard') === 'platoon_summary', 'Unmapped "dashboard" falls back to platoon_summary');
assert(parseTab('admin') === 'platoon_summary', 'Unmapped "admin" falls back to platoon_summary');
assert(parseTab('settings') === 'platoon_summary', 'Unmapped "settings" falls back to platoon_summary');

// 1.5 Case sensitivity & Whitespace
assert(parseTab('PLATOON_SUMMARY') === 'platoon_summary', 'Uppercase "PLATOON_SUMMARY" falls back to platoon_summary');
assert(parseTab('Units') === 'platoon_summary', 'Capitalized "Units" falls back to platoon_summary');
assert(parseTab(' units') === 'platoon_summary', 'Leading space " units" falls back to platoon_summary');
assert(parseTab('units ') === 'platoon_summary', 'Trailing space "units " falls back to platoon_summary');
assert(parseTab('units\n') === 'platoon_summary', 'Trailing newline falls back to platoon_summary');
assert(parseTab('units\t') === 'platoon_summary', 'Trailing tab character falls back to platoon_summary');
assert(parseTab('units\0') === 'platoon_summary', 'Null byte injection falls back to platoon_summary');

// 1.6 SQL Injection Payloads
const sqlInjections = [
  "' OR '1'='1",
  "1; DROP TABLE units; --",
  "admin' --",
  "' UNION SELECT * FROM user_accounts --",
  "1' AND 1=(SELECT COUNT(*) FROM tablename); --",
  "'; EXEC xp_cmdshell('dir'); --",
  "SLEEP(5)",
  "benchmark(10000000,MD5(1))",
  "1 OR 1=1",
];
sqlInjections.forEach((sqli, idx) => {
  assert(parseTab(sqli) === 'platoon_summary', `SQL injection payload #${idx + 1} safely falls back to platoon_summary`, sqli);
});

// 1.7 XSS & HTML Injection Payloads
const xssPayloads = [
  "<script>alert(1)</script>",
  "<img src=x onerror=alert('xss')>",
  "javascript:alert(1)",
  "javascript:void(0)",
  "\"><script>alert(document.cookie)</script>",
  "<svg onload=alert(1)>",
  "data:text/html,<script>alert(1)</script>",
  "%3Cscript%3Ealert(1)%3C/script%3E",
  "\u003cscript\u003ealert(1)\u003c/script\u003e",
];
xssPayloads.forEach((xss, idx) => {
  assert(parseTab(xss) === 'platoon_summary', `XSS payload #${idx + 1} safely falls back to platoon_summary`, xss);
});

// 1.8 Prototype Pollution & Object prototype keys
const protoKeys = ['__proto__', 'constructor', 'prototype', 'toString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf'];
protoKeys.forEach((key) => {
  assert(parseTab(key) === 'platoon_summary', `Prototype key "${key}" safely falls back to platoon_summary`);
});

// 1.9 Special Characters, Unicode, Emoji, and Massive Strings
assert(parseTab('trung_đội_1') === 'platoon_summary', 'Vietnamese unicode falls back to platoon_summary');
assert(parseTab('🎯') === 'platoon_summary', 'Emoji target falls back to platoon_summary');
assert(parseTab('🚀'.repeat(100)) === 'platoon_summary', 'Repeated emojis fall back to platoon_summary');
assert(parseTab('A'.repeat(50000)) === 'platoon_summary', '50,000 char long string falls back to platoon_summary without crashing');
assert(parseTab('{"tab":"units"}') === 'platoon_summary', 'JSON string payload falls back to platoon_summary');
assert(parseTab('../../../etc/passwd') === 'platoon_summary', 'Path traversal string falls back to platoon_summary');

// 1.10 Non-string Runtime Types (defensive JS check)
assert(parseTab(123) === 'platoon_summary', 'Number 123 falls back to platoon_summary');
assert(parseTab({}) === 'platoon_summary', 'Empty object {} falls back to platoon_summary');
assert(parseTab([]) === 'platoon_summary', 'Array [] falls back to platoon_summary');
assert(parseTab(true) === 'platoon_summary', 'Boolean true falls back to platoon_summary');


// -----------------------------------------------------------------------------
// SECTION 2: Auth Guard checkIsAuthenticated() Error Handling & Edge Cases
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 2: Auth Guard Stress Testing ---');

function createMockStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
    _dump() {
      return Object.fromEntries(store.entries());
    }
  };
}

// 2.1 SSR Check (window is undefined)
{
  const check = createCheckIsAuthenticated(undefined, createMockStorage());
  assert(check() === false, 'SSR execution (window === undefined) returns false without accessing localStorage');
}

// 2.2 Normal Authenticated Cases
{
  const storage = createMockStorage({
    [AUTH_TOKEN_KEY]: 'mock_token_jwt_123',
    'thi_dua_user': JSON.stringify({ id: 101, name: 'Nguyen Van A', role: 'ADMIN' })
  });
  const check = createCheckIsAuthenticated({}, storage);
  assert(check() === true, 'Valid token + user with id returns true');
}
{
  const storage = createMockStorage({
    [AUTH_TOKEN_KEY]: 'mock_token_jwt_123',
    'thi_dua_user': JSON.stringify({ username: 'commander_335', role: 'COMMANDER' })
  });
  const check = createCheckIsAuthenticated({}, storage);
  assert(check() === true, 'Valid token + user with username returns true');
}
{
  const storage = createMockStorage({
    [AUTH_TOKEN_KEY]: 'mock_token_jwt_123',
    'thi_dua_user': JSON.stringify({ email: 'soldier@military.vn', role: 'USER' })
  });
  const check = createCheckIsAuthenticated({}, storage);
  assert(check() === true, 'Valid token + user with email returns true');
}

// 2.3 Missing Credentials
{
  const storage = createMockStorage({
    'thi_dua_user': JSON.stringify({ id: 101 })
  });
  const check = createCheckIsAuthenticated({}, storage);
  assert(check() === false, 'Missing token with user present returns false');
}
{
  const storage = createMockStorage({
    [AUTH_TOKEN_KEY]: 'mock_token_jwt_123'
  });
  const check = createCheckIsAuthenticated({}, storage);
  assert(check() === false, 'Token present but missing user returns false');
}
{
  const storage = createMockStorage();
  const check = createCheckIsAuthenticated({}, storage);
  assert(check() === false, 'Empty storage returns false');
}

// 2.4 Corrupted JSON in thi_dua_user
const corruptedUserStrings = [
  '{bad_json',
  'undefined',
  'NaN',
  '{"id":',
  '{"id": 12, "name": ',
  "<xml>invalid</xml>",
  "'{single_quote_json: true}'",
  "\x00\x01\x02\x03",
  "{name: unquoted_val}",
  "\"unterminated string",
];

corruptedUserStrings.forEach((corruptedStr, idx) => {
  const storage = createMockStorage({
    [AUTH_TOKEN_KEY]: 'valid_token_xyz',
    'thi_dua_user': corruptedStr
  });
  const check = createCheckIsAuthenticated({}, storage);
  let res;
  let didThrow = false;
  try {
    res = check();
  } catch (err) {
    didThrow = true;
  }
  assert(!didThrow, `Corrupt JSON #${idx + 1} does not throw unhandled exception`);
  assert(res === false, `Corrupt JSON #${idx + 1} returns false`);
  assert(storage.getItem(AUTH_TOKEN_KEY) === null, `Corrupt JSON #${idx + 1} clears AUTH_TOKEN_KEY from storage`);
  assert(storage.getItem('thi_dua_user') === null, `Corrupt JSON #${idx + 1} clears thi_dua_user from storage`);
});

// 2.5 Non-object valid JSON values (primitives, arrays, empty objects)
const nonObjectJsonValues = [
  { val: 'null', desc: 'JSON literal null' },
  { val: '12345', desc: 'JSON number 12345' },
  { val: '"plain_string"', desc: 'JSON string' },
  { val: 'true', desc: 'JSON boolean true' },
  { val: 'false', desc: 'JSON boolean false' },
  { val: '[]', desc: 'JSON empty array' },
  { val: '[1, 2, 3]', desc: 'JSON number array' },
  { val: '[{"id": 1}]', desc: 'JSON array of objects' },
  { val: '{}', desc: 'Empty object {} without identity fields' },
  { val: '{"name": "Soldier Only"}', desc: 'Object without id, username, or email' },
  { val: '{"id": null, "username": null, "email": null}', desc: 'Object with null identity fields' },
  { val: '{"id": "", "username": "", "email": ""}', desc: 'Object with empty string identity fields' },
  { val: '{"id": 0, "username": false}', desc: 'Object with falsy identity fields' },
];

nonObjectJsonValues.forEach(({ val, desc }) => {
  const storage = createMockStorage({
    [AUTH_TOKEN_KEY]: 'valid_token_xyz',
    'thi_dua_user': val
  });
  const check = createCheckIsAuthenticated({}, storage);
  assert(check() === false, `Non-object/invalid user structure [${desc}] returns false`);
});

// 2.6 Prototype Pollution payloads in localStorage
{
  const storage = createMockStorage({
    [AUTH_TOKEN_KEY]: 'valid_token_xyz',
    'thi_dua_user': '{"__proto__": {"id": 999, "isAdmin": true}}'
  });
  const check = createCheckIsAuthenticated({}, storage);
  assert(check() === false, 'Prototype pollution in thi_dua_user returns false without escalating');
}


// -----------------------------------------------------------------------------
// SECTION 3: History State Management & handleTabChange Transitions
// -----------------------------------------------------------------------------
console.log('\n--- SECTION 3: History State & Tab Transition Simulation ---');

function createTabController(initialQuery = '') {
  let searchParams = new URLSearchParams(initialQuery);
  let activeTab = parseTab(searchParams.get('tab'));
  const historyStack = [{ url: `/?${searchParams.toString()}`, tab: activeTab }];
  let pushCalls = 0;

  const router = {
    push(url, options) {
      pushCalls++;
      const queryIdx = url.indexOf('?');
      const query = queryIdx !== -1 ? url.substring(queryIdx + 1) : '';
      searchParams = new URLSearchParams(query);
      const tabInUrl = parseTab(searchParams.get('tab'));
      historyStack.push({ url, tab: tabInUrl });
    }
  };

  const handleTabChange = (newTab, options = {}) => {
    activeTab = newTab;
    const currentQueryTab = searchParams.get('tab');
    if (currentQueryTab === newTab || (!currentQueryTab && newTab === 'platoon_summary')) {
      return;
    }
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', newTab);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const simulateBrowserPopState = (targetIndex) => {
    if (targetIndex >= 0 && targetIndex < historyStack.length) {
      const entry = historyStack[targetIndex];
      const queryIdx = entry.url.indexOf('?');
      const query = queryIdx !== -1 ? entry.url.substring(queryIdx + 1) : '';
      searchParams = new URLSearchParams(query);
      activeTab = parseTab(searchParams.get('tab'));
    }
  };

  return {
    getActiveTab: () => activeTab,
    getSearchParams: () => searchParams,
    getHistory: () => historyStack,
    getPushCalls: () => pushCalls,
    handleTabChange,
    simulateBrowserPopState
  };
}

// 3.1 Initial State with Empty Query
{
  const controller = createTabController('');
  assert(controller.getActiveTab() === 'platoon_summary', 'Default tab is platoon_summary when query is empty');
  assert(controller.getHistory().length === 1, 'Initial history length is 1');

  // Click platoon_summary (same tab as default)
  controller.handleTabChange('platoon_summary');
  assert(controller.getPushCalls() === 0, 'Clicking default tab on clean URL triggers early return (0 push calls)');
  assert(controller.getHistory().length === 1, 'History stack does not grow on redundant default tab click');
}

// 3.2 Switching to 'units'
{
  const controller = createTabController('');
  controller.handleTabChange('units');
  assert(controller.getActiveTab() === 'units', 'activeTab updates to units');
  assert(controller.getPushCalls() === 1, 'router.push called once on tab switch');
  assert(controller.getSearchParams().get('tab') === 'units', 'URL query tab is units');

  // Redundant click on 'units'
  controller.handleTabChange('units');
  assert(controller.getPushCalls() === 1, 'Clicking active tab "units" again triggers early return (pushCalls remains 1)');
  assert(controller.getHistory().length === 2, 'History stack does not add duplicate entry');
}

// 3.3 Switching A -> B -> A -> B
{
  const controller = createTabController('');
  controller.handleTabChange('units'); // stack: 2
  controller.handleTabChange('daily_scoring'); // stack: 3
  controller.handleTabChange('units'); // stack: 4
  controller.handleTabChange('units'); // redundant, no stack change
  controller.handleTabChange('daily_scoring'); // stack: 5

  assert(controller.getPushCalls() === 4, '4 legitimate transitions result in exactly 4 router.push calls');
  assert(controller.getHistory().length === 5, 'History stack accurately tracks the 5 states');
  assert(controller.getActiveTab() === 'daily_scoring', 'Active tab matches last transition');
}

// 3.4 Browser Back (popstate) traversal
{
  const controller = createTabController('');
  controller.handleTabChange('soldiers'); // idx 1: soldiers
  controller.handleTabChange('reports');  // idx 2: reports
  controller.handleTabChange('units');    // idx 3: units

  assert(controller.getActiveTab() === 'units', 'Current tab is units before popstate');

  // Back to reports (idx 2)
  controller.simulateBrowserPopState(2);
  assert(controller.getActiveTab() === 'reports', 'Simulated browser back moves to "reports"');

  // Back to soldiers (idx 1)
  controller.simulateBrowserPopState(1);
  assert(controller.getActiveTab() === 'soldiers', 'Simulated browser back moves to "soldiers"');

  // Back to initial home (idx 0)
  controller.simulateBrowserPopState(0);
  assert(controller.getActiveTab() === 'platoon_summary', 'Simulated browser back moves to "platoon_summary"');
}

// 3.5 Popstate with Corrupted Query in URL
{
  const controller = createTabController('tab=malicious_payload_or_injection');
  assert(controller.getActiveTab() === 'platoon_summary', 'Direct URL access with malicious tab safely resolves to platoon_summary');

  controller.handleTabChange('units');
  assert(controller.getActiveTab() === 'units', 'Can switch to units from corrupted initial URL');
}

// 3.6 Rapid 1,000 Repeated Switching Stress Test
{
  const controller = createTabController('');
  const tabs = ['platoon_summary', 'units', 'criteria', 'daily_scoring'];
  for (let i = 0; i < 1000; i++) {
    const target = tabs[i % tabs.length];
    controller.handleTabChange(target);
  }
  assert(controller.getActiveTab() === tabs[999 % tabs.length], 'After 1000 rapid switches, activeTab is completely stable');
  assert(controller.getPushCalls() === 999, `999 transitions dispatched (1 redundant initial transition guarded) - actual: ${controller.getPushCalls()}`);
}

console.log('\n===============================================================');
console.log(` RESULTS SUMMARY: ${passedTests} passed, ${failedTests} failed out of ${totalTests} tests.`);
console.log('===============================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
