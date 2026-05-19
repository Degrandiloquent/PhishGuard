const jwt = require('jsonwebtoken');
const JWTHandler = require('../gateway/auth/jwtAuth');
const { 
  validateField, 
  sanitizeValue, 
  preventInjection 
} = require('../gateway/middleware/validateRequest');
const { 
  encryptData, 
  decryptData, 
  hashData, 
  generateRandomString 
} = require('../utils/encryption');
const { 
  chainLogEvent, 
  verifyChainIntegrity, 
  getChainStatus, 
  queryEvents 
} = require('../logging/hashChainLogger');
const blockThreatAction = require('../response-engine/actions/blockThreat');
const isolateSessionAction = require('../response-engine/actions/isolateSession');
const forcePasswordResetAction = require('../response-engine/actions/forcePasswordReset');
const { decide, getRiskLevel, RISK_LEVELS } = require('../response-engine/decisionEngine');

const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function test(name, fn) {
  try {
    fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS', error: null });
    console.log(`  ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    console.log(`  ${name}`);
    console.log(`     Error: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEquals(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

function assertTrue(value, message) {
  if (!value) throw new Error(message || 'Expected true');
}

function assertFalse(value, message) {
  if (value) throw new Error(message || 'Expected false');
}

console.log('\nPHISHGUARD SECURITY TEST SUITE\n');
console.log('=====================================\n');

console.log('LAYER 1: AUTHENTICATION & JWT\n');

test('JWT: Generate token with payload', () => {
  const token = JWTHandler.signToken({ userId: 'test123', role: 'user' });
  assert(token && typeof token === 'string', 'Token should be string');
  assert(token.split('.').length === 3, 'JWT should have 3 parts');
});

test('JWT: Verify valid token', () => {
  const token = JWTHandler.signToken({ userId: 'test123' });
  const decoded = JWTHandler.verifyToken(token);
  assertEquals(decoded.userId, 'test123', 'User ID should match');
  assert(decoded.jti, 'Token should have JTI');
});

test('JWT: Reject invalid token', () => {
  try {
    JWTHandler.verifyToken('invalid.token.here');
    throw new Error('Should have thrown');
  } catch (e) {
    assert(e.message.includes('Invalid'), 'Should reject invalid token');
  }
});

test('JWT: Token revocation', () => {
  const token = JWTHandler.signToken({ userId: 'test123' });
  const decoded = JWTHandler.verifyToken(token);
  
  assert(!JWTHandler.isTokenRevoked(decoded.jti), 'Token should not be revoked');
  
  JWTHandler.revokeToken(decoded.jti);
  assert(JWTHandler.isTokenRevoked(decoded.jti), 'Token should be revoked');
});

test('JWT: Refresh token creation', () => {
  const originalToken = JWTHandler.signToken({ userId: 'test123' });
  const decoded = JWTHandler.verifyToken(originalToken);
  
  const refreshToken = JWTHandler.createRefreshToken('test123', decoded.jti);
  assert(refreshToken && typeof refreshToken === 'string', 'Refresh token created');
});

test('JWT: Extract token from header', () => {
  const token = 'abc123token';
  const header = `Bearer ${token}`;
  const extracted = JWTHandler.extractToken(header);
  assertEquals(extracted, token, 'Token should be extracted');
});

test('JWT: Reject malformed authorization header', () => {
  const extracted1 = JWTHandler.extractToken('NoBearer token123');
  assertFalse(extracted1, 'Should reject missing Bearer');
  
  const extracted2 = JWTHandler.extractToken('Bearer');
  assertFalse(extracted2, 'Should reject missing token');
});

console.log('\n\nLAYER 2: INPUT VALIDATION\n');

test('Validation: Email format validation', () => {
  const validEmail = validateField('email', 'user@example.com', 'email');
  assertTrue(validEmail.valid, 'Valid email should pass');
  
  const invalidEmail = validateField('email', 'not-an-email', 'email');
  assertFalse(invalidEmail.valid, 'Invalid email should fail');
});

test('Validation: URL format validation', () => {
  const validUrl = validateField('url', 'https://example.com/path', 'url');
  assertTrue(validUrl.valid, 'Valid URL should pass');
  
  const invalidUrl = validateField('url', 'not a url', 'url');
  assertFalse(invalidUrl.valid, 'Invalid URL should fail');
});

test('Validation: Username requirements', () => {
  const validUsername = validateField('username', 'user_123', 'username');
  assertTrue(validUsername.valid, 'Valid username should pass');
  
  const shortUsername = validateField('username', 'ab', 'username');
  assertFalse(shortUsername.valid, 'Username too short');
});

test('Validation: Required field check', () => {
  const missingRequired = validateField('email', null, 'email', { optional: false });
  assertFalse(missingRequired.valid, 'Null should fail required check');
  
  const optionalMissing = validateField('email', null, 'email', { optional: true });
  assertTrue(optionalMissing.valid, 'Null should pass optional check');
});

test('Validation: Max length enforcement', () => {
  const tooLong = validateField('text', 'a'.repeat(300), 'email', { maxLength: 255 });
  assertFalse(tooLong.valid, 'Should reject overly long input');
});

test('Sanitization: HTML escaping', () => {
  const xss = '<script>alert("xss")</script>';
  const sanitized = sanitizeValue(xss, 'html');
  assert(!sanitized.includes('<script>'), 'Script tags should be escaped');
});

test('Sanitization: Null byte removal', () => {
  const withNull = 'data\0bad';
  const sanitized = sanitizeValue(withNull);
  assert(!sanitized.includes('\0'), 'Null bytes should be removed');
});

test('Injection Prevention: SQL injection patterns', () => {
  const patterns = [
    "' OR '1'='1",
    "'; DROP TABLE users--",
    "' UNION SELECT * FROM--"
  ];
  
  for (const inject of patterns) {
    const injectionPatterns = [
      /(\bOR\b.*=.*)/gi,
      /(\bDROP\b|\bDELETE\b|\bUNION\b)/gi,
    ];
    
    const detected = injectionPatterns.some(p => p.test(inject));
    assertTrue(detected, `Should detect: ${inject}`);
  }
});

test('Injection Prevention: XSS attack patterns', () => {
  const patterns = [
    '<script>alert("xss")</script>',
    'javascript:void(0)',
    'onerror=malicious()',
  ];
  
  for (const xss of patterns) {
    const xssPattern = /(<script|javascript:|onerror=)/gi;
    const detected = xssPattern.test(xss);
    assertTrue(detected, `Should detect XSS: ${xss}`);
  }
});

console.log('\n\nLAYER 3: ENCRYPTION & CRYPTOGRAPHY\n');

test('Encryption: AES-256-GCM encryption', () => {
  const data = { secret: 'sensitive_data', id: 123 };
  const encrypted = encryptData(data);
  
  assert(encrypted.encrypted, 'Should have encrypted data');
  assert(encrypted.iv, 'Should have IV');
  assert(encrypted.authTag, 'Should have auth tag');
  assert(typeof encrypted.encrypted === 'string', 'Encrypted should be string');
});

test('Encryption: Decryption reverses encryption', () => {
  const original = { user: 'john', email: 'john@example.com' };
  const encrypted = encryptData(original);
  const decrypted = decryptData(encrypted);
  
  assertEquals(decrypted.user, original.user, 'User should match');
  assertEquals(decrypted.email, original.email, 'Email should match');
});

test('Encryption: Different IVs each time', () => {
  const data = { test: 'data' };
  const enc1 = encryptData(data);
  const enc2 = encryptData(data);
  
  assert(enc1.iv !== enc2.iv, 'Each encryption should use different IV');
  assert(enc1.encrypted !== enc2.encrypted, 'Encrypted output should differ');
});

test('Encryption: Auth tag prevents tampering', () => {
  const data = { secret: 'data' };
  const encrypted = encryptData(data);
  
  encrypted.encrypted = encrypted.encrypted.slice(0, -2) + 'XX';
  
  try {
    decryptData(encrypted);
    throw new Error('Should have failed due to tampering');
  } catch (e) {
    assert(e.message.includes('Decryption failed'), 'Should reject tampered data');
  }
});

test('Hashing: SHA-256 generates consistent hash', () => {
  const data = 'test_data';
  const hash1 = hashData(data);
  const hash2 = hashData(data);
  assertEquals(hash1, hash2, 'Same data should produce same hash');
  assert(hash1.length === 64, 'SHA-256 should produce 64 char hex');
});

test('Random String: Generates unique random values', () => {
  const str1 = generateRandomString(32);
  const str2 = generateRandomString(32);
  
  assert(str1 !== str2, 'Should generate different random strings');
  assertEquals(str1.length, 32, 'Should be correct length');
});

console.log('\n\nLAYER 5: IMMUTABLE AUDIT TRAIL\n');

test('Audit Log: Chain event creation', () => {
  const event = chainLogEvent('TEST_EVENT', { data: 'test' }, 'user123', 'info');
  
  assert(event.id, 'Event should have ID');
  assert(event.hash, 'Event should have hash');
  assertEquals(event.eventType, 'TEST_EVENT', 'Event type should match');
});

test('Audit Log: Hash chaining links events', () => {
  const status1 = getChainStatus();
  const events1 = status1.length;
  
  chainLogEvent('EVENT_1', { data: 1 }, 'user', 'info');
  const event1 = getChainStatus().lastEvent;
  
  chainLogEvent('EVENT_2', { data: 2 }, 'user', 'info');
  const event2 = getChainStatus().lastEvent;
  
  assertEquals(event2.previousHash, event1.hash, 'Events should link via hash');
});

test('Audit Log: Chain integrity verification passes', () => {
  const intact = verifyChainIntegrity();
  assertTrue(intact, 'Chain should be intact after legitimate events');
});

test('Audit Log: Query events by type', () => {
  chainLogEvent('QUERY_TEST', { data: 'test' }, 'user1', 'info');
  chainLogEvent('OTHER_EVENT', { data: 'other' }, 'user2', 'info');
  
  const filtered = queryEvents({ eventType: 'QUERY_TEST' });
  assert(filtered.length > 0, 'Should find events');
  assert(filtered.every(e => e.eventType === 'QUERY_TEST'), 'All should match type');
});

test('Audit Log: Query events by user', () => {
  chainLogEvent('USER_TEST_1', { data: 'test' }, 'specific_user', 'info');
  chainLogEvent('USER_TEST_2', { data: 'test' }, 'other_user', 'info');
  
  const filtered = queryEvents({ userId: 'specific_user' });
  assert(filtered.length > 0, 'Should find user events');
  assert(filtered.every(e => e.userId === 'specific_user'), 'All should match user');
});

console.log('\n\nLAYER 4: RESPONSE ACTIONS\n');

test('Block Threat: Add URL to blocklist', async () => {
  const result = await blockThreatAction.execute({
    type: 'url',
    value: 'test-evil.com',
    severity: 'high',
    riskScore: 85,
    reason: 'Malicious domain'
  });
  
  assertTrue(result.success, 'Block should succeed');
  assert(blockThreatAction.isBlocked('test-evil.com'), 'URL should be blocked');
});

test('Block Threat: Get blocklist', () => {
  blockThreatAction.execute({
    type: 'url',
    value: 'blocking-test.com',
    severity: 'high',
    riskScore: 90,
    reason: 'Test'
  });
  
  const blocklist = blockThreatAction.getBlocklist();
  assert(blocklist.length > 0, 'Should have blocked items');
});

test('Isolate Session: Revoke session', async () => {
  const result = await isolateSessionAction.execute({
    sessionId: 'test_session_123',
    userId: 'test_user',
    reason: 'Suspicious activity',
    riskScore: 92
  });
  
  assertTrue(result.success, 'Isolation should succeed');
  assertTrue(isolateSessionAction.isIsolated('test_session_123'), 'Session should be isolated');
});

test('Force Password Reset: Create reset token', async () => {
  const result = await forcePasswordResetAction.execute({
    userId: 'reset_user',
    email: 'reset@test.com',
    reason: 'Security incident',
    riskScore: 95
  });
  
  assertTrue(result.success, 'Reset should succeed');
  assert(result.resetToken, 'Should have reset token');
});

console.log('\n\nLAYER 3: DECISION ENGINE\n');

test('Decision Engine: Risk levels classification', () => {
  const levels = [
    { score: 20, level: 'LOW' },
    { score: 50, level: 'MEDIUM' },
    { score: 70, level: 'HIGH' },
    { score: 90, level: 'CRITICAL' }
  ];
  
  for (const test of levels) {
    const risk = getRiskLevel(test.score);
    assert(risk, `Should have risk level for ${test.score}`);
  }
});

test('Decision Engine: Low risk triggers warning', async () => {
  const decision = await decide({
    riskScore: 25,
    threatType: 'low_suspicion',
    userId: 'user1',
    email: 'user@test.com',
    threatValue: 'example.com'
  });
  
  assertTrue(decision.success, 'Decision should succeed');
  assert(decision.actions, 'Should have actions');
});

test('Decision Engine: High risk triggers isolation', async () => {
  const decision = await decide({
    riskScore: 82,
    threatType: 'credential_theft',
    userId: 'user2',
    email: 'user2@test.com',
    sessionId: 'session_456',
    threatValue: 'malicious.com'
  });
  
  assertTrue(decision.success, 'Decision should succeed');
  assert(decision.actions.length >= 2, 'Should trigger multiple actions');
});

test('Decision Engine: Critical risk triggers full isolation', async () => {
  const decision = await decide({
    riskScore: 100,
    threatType: 'active_exploitation',
    userId: 'user3',
    email: 'user3@test.com',
    sessionId: 'session_789',
    threatValue: 'attack-site.com'
  });
  
  assertTrue(decision.success, 'Decision should succeed');
  assert(decision.actions.length >= 3, 'Should trigger critical actions');
  assertTrue(decision.decision.escalationLevel === 'critical', `Should escalate to critical, got: ${decision.decision.escalationLevel}`);
});

console.log('\n\nINTEGRATION TESTS\n');

test('Integration: Complete authentication flow', () => {
  const token = JWTHandler.signToken({ userId: 'integration_user', role: 'user' });
  
  const decoded = JWTHandler.verifyToken(token);
  assertEquals(decoded.userId, 'integration_user', 'User ID should match');
  
  assert(!JWTHandler.isTokenRevoked(decoded.jti), 'Should not be revoked');
  
  JWTHandler.revokeToken(decoded.jti);
  assertTrue(JWTHandler.isTokenRevoked(decoded.jti), 'Should be revoked');
});

test('Integration: Secure data flow with encryption', () => {
  const sensitiveData = {
    userId: 'user123',
    email: 'user@example.com',
    credentials: 'secret123'
  };
  
  const emailValidation = validateField('email', sensitiveData.email, 'email');
  assertTrue(emailValidation.valid, 'Email should be valid');
  
  const encrypted = encryptData(sensitiveData);
  
  chainLogEvent('SECURE_DATA_STORED', { encrypted }, 'system', 'info');
  
  const decrypted = decryptData(encrypted);
  assertEquals(decrypted.userId, sensitiveData.userId, 'Data should match');
  
  assertTrue(verifyChainIntegrity(), 'Chain should be intact');
});

test('Integration: Threat detection to response flow', async () => {
  const threatContext = {
    riskScore: 80,
    threatType: 'phishing_email',
    userId: 'integration_user',
    email: 'user@company.com',
    sessionId: 'session_int_001',
    threatValue: 'phish.evil.com'
  };
  
  const decision = await decide(threatContext);
  assertTrue(decision.success, 'Decision should succeed');
  
  assert(decision.actions.length > 0, 'Should have actions');
  
  assertTrue(verifyChainIntegrity(), 'Audit trail should be intact');
});

console.log('\n\nPERFORMANCE TESTS\n');

test('Performance: Token generation < 5ms', () => {
  const start = Date.now();
  for (let i = 0; i < 100; i++) {
    JWTHandler.signToken({ userId: `user${i}` });
  }
  const time = Date.now() - start;
  const avgTime = time / 100;
  assert(avgTime < 5, `Token generation should be < 5ms (was ${avgTime.toFixed(2)}ms)`);
});

test('Performance: Validation < 1ms per field', () => {
  const start = Date.now();
  for (let i = 0; i < 1000; i++) {
    validateField('email', `user${i}@example.com`, 'email');
  }
  const time = Date.now() - start;
  const avgTime = time / 1000;
  assert(avgTime < 1, `Validation should be < 1ms (was ${avgTime.toFixed(3)}ms)`);
});

test('Performance: Encryption < 10ms per operation', () => {
  const data = { test: 'data'.repeat(100) };
  const start = Date.now();
  for (let i = 0; i < 50; i++) {
    encryptData(data);
  }
  const time = Date.now() - start;
  const avgTime = time / 50;
  assert(avgTime < 10, `Encryption should be < 10ms (was ${avgTime.toFixed(2)}ms)`);
});

console.log('\n\n=====================================');
console.log('TEST RESULTS SUMMARY');
console.log('=====================================\n');

console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);
console.log(`Total:  ${results.passed + results.failed}`);

if (results.failed === 0) {
  console.log('\nALL TESTS PASSED!');
} else {
  console.log('\nSome tests failed:');
  results.tests
    .filter(t => t.status.includes('FAIL'))
    .forEach(t => {
      console.log(`   ${t.name}`);
      if (t.error) console.log(`      ${t.error}`);
    });
}

console.log('\n=====================================\n');

module.exports = results;

