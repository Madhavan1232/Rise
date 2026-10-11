// server/scripts/test_passwordless_flow.js
const express = require('express');
const db = require('../config/db');
const authRouter = require('../routes/auth');

async function runTests() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);

  const server = app.listen(5099);
  const baseUrl = 'http://127.0.0.1:5099/api/auth';

  try {
    const testEmail = `test_pwless_${Date.now()}@example.com`;
    console.log(`\n--- Test 1: Request OTP for new email (${testEmail}) ---`);
    let res = await fetch(`${baseUrl}/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    let data = await res.json();
    console.log('Status:', res.status, data);
    if (res.status !== 200 || !data.success) throw new Error('Test 1 failed');

    console.log('\n--- Test 2: Cooldown rate limit check ---');
    res = await fetch(`${baseUrl}/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    data = await res.json();
    console.log('Status (expected 429):', res.status, data.message);
    if (res.status !== 429) throw new Error('Test 2 failed: cooldown not enforced');

    console.log('\n--- Test 3: Fetch stored OTP hash from DB and test wrong OTP ---');
    const [otpRows] = await db.execute('SELECT id, otp_hash FROM signup_otps WHERE email = ?', [testEmail]);
    if (otpRows.length === 0) throw new Error('No OTP in DB');

    res = await fetch(`${baseUrl}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: '000000' }),
    });
    data = await res.json();
    console.log('Status (expected 400 wrong code):', res.status, data.message);
    if (res.status !== 400) throw new Error('Test 3 failed');

    console.log('\n--- Test 4: Verify with correct OTP for new user ---');
    // We can simulate OTP by updating DB with known hash or reading devOtp if returned
    // In dev mode, data from test 1 has devOtp!
    // Wait, let's check:
    const [devRecord] = await db.execute('SELECT otp_hash FROM signup_otps WHERE email = ?', [testEmail]);
    // Let's set a known OTP hash for testing
    const crypto = require('crypto');
    const salt = process.env.JWT_SECRET || 'rise_secure_salt_2026';
    const knownOtp = '123456';
    const knownHash = crypto.createHash('sha256').update(`${knownOtp}:${salt}`).digest('hex');
    await db.execute('UPDATE signup_otps SET otp_hash = ?, attempts = 0 WHERE email = ?', [knownHash, testEmail]);

    res = await fetch(`${baseUrl}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: knownOtp }),
    });
    data = await res.json();
    console.log('Status (expected 200 new user):', res.status, data);
    if (res.status !== 200 || !data.isNewUser || !data.token) throw new Error('Test 4 failed');
    const token = data.token;

    console.log('\n--- Test 5: Verify auth/me with new user token ---');
    res = await fetch(`${baseUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    data = await res.json();
    console.log('auth/me user:', data.user);
    if (res.status !== 200 || data.user.email !== testEmail) throw new Error('Test 5 failed');

    console.log('\n--- Test 6: Existing user request OTP & verify ---');
    // Clear cooldown in DB for immediate test
    await db.execute('DELETE FROM signup_otps WHERE email = ?', [testEmail]);
    res = await fetch(`${baseUrl}/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    data = await res.json();
    console.log('Existing user request OTP status:', res.status, data);

    await db.execute('UPDATE signup_otps SET otp_hash = ? WHERE email = ?', [knownHash, testEmail]);
    res = await fetch(`${baseUrl}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, otp: knownOtp }),
    });
    data = await res.json();
    console.log('Existing user verify status (expected isNewUser: false):', res.status, data);
    if (res.status !== 200 || data.isNewUser !== false) throw new Error('Test 6 failed');

    // Clean up test user
    await db.execute('DELETE FROM users WHERE email = ?', [testEmail]);
    await db.execute('DELETE FROM signup_otps WHERE email = ?', [testEmail]);

    console.log('\n✅ ALL BACKEND PASSWORDLESS TESTS PASSED CLEANLY!\n');
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
