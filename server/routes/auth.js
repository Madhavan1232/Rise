// server/routes/auth.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');
const db = require('../config/db');
const auth = require('../middleware/auth');

// Helper to hash OTP with server salt
function hashOtp(otp) {
  const salt = process.env.JWT_SECRET || 'rise_secure_salt_2026';
  return crypto.createHash('sha256').update(`${otp}:${salt}`).digest('hex');
}

// Delegate verification email dispatching to emailService
async function sendOtpEmail(email, otp, name) {
  return emailService.sendVerificationEmail(email, otp, name);
}

// Send linking OTP email
async function sendLinkingEmail(email, otp, provider, name) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n' + '='.repeat(60));
    console.log(`🔑 [RISE ACCOUNT LINKING OTP CODE]: ${otp}`);
    console.log(`📧 Recipient: ${email}`);
    console.log(`🔗 Provider: ${provider}`);
    console.log(`⏱️  Validity: 10 minutes`);
    console.log('='.repeat(60) + '\n');
  }
  const subject = `Confirm linking your ${provider} account to Rise`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Link your ${provider} account</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #0b1f44; }
        .wrapper { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 16px rgba(11,31,68,0.06); }
        .logo-wrap { text-align: center; margin-bottom: 20px; }
        .logo { font-size: 26px; font-weight: 800; color: #2563eb; letter-spacing: -0.04em; }
        h1 { font-size: 20px; font-weight: 700; color: #0b1f44; margin: 0 0 10px; text-align: center; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px; text-align: center; }
        .code-container { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; text-align: center; margin: 0 0 24px; }
        .code { font-size: 34px; font-weight: 800; letter-spacing: 0.28em; color: #2563eb; font-family: ui-monospace, Menlo, Monaco, monospace; margin-left: 0.28em; }
        .expiry { font-size: 13px; color: #64748b; text-align: center; margin-bottom: 24px; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="logo-wrap">
          <span class="logo">RISE</span>
        </div>
        <h1>Link your ${provider} account</h1>
        <p>An account with this email address already exists. To securely link your ${provider} identity${name ? ` (${name})` : ''} to your Rise account, please enter the verification code below:</p>
        <div class="code-container">
          <span class="code">${otp}</span>
        </div>
        <div class="expiry">This code will expire in <strong>10 minutes</strong>.</div>
        <p class="footer">If you did not initiate this link, please ignore this email.<br>© ${new Date().getFullYear()} Rise Technologies, Inc. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
  const text = `Your Rise linking verification code for ${provider} is: ${otp}\n\nThis code will expire in 10 minutes.\nIf you did not request this, you can safely ignore this email.`;

  return emailService.sendEmail({ to: email, subject, html, text });
}

// Helper to validate username format (kept for legacy support)
function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: 'Username is required.' };
  }
  const clean = username.trim();
  if (clean.length < 3 || clean.length > 30) {
    return { valid: false, message: 'Username must be between 3 and 30 characters.' };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
    return { valid: false, message: 'Username can only contain letters, numbers, and underscores.' };
  }
  return { valid: true, username: clean };
}

// ─────────────────────────────────────────────────────────────
// 1. Passwordless Email OTP: Request OTP (both /signup & /login)
// ─────────────────────────────────────────────────────────────
router.post(['/request-otp', '/signup/request-otp', '/login/request-otp'], async (req, res) => {
  const { email, mode } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'A valid email address is required.' });
  }
  const cleanEmail = email.trim().toLowerCase();
  if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  // Pre-deployment developer bypass for personal account: log in without OTP
  const BYPASS_EMAILS = ['madhavanvairavan3@gmail.com'];
  if (BYPASS_EMAILS.includes(cleanEmail)) {
    try {
      let [existingUsers] = await db.execute(
        'SELECT id, username, name, email, auth_provider, avatar_url FROM users WHERE email = ? LIMIT 1',
        [cleanEmail]
      );
      let user;
      if (existingUsers.length > 0) {
        user = existingUsers[0];
      } else {
        const defaultName = cleanEmail.split('@')[0];
        const displayName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
        const [insertResult] = await db.execute(
          'INSERT INTO users (name, email, auth_provider, avatar_url, email_verified) VALUES (?, ?, "email_otp", ?, 1)',
          [displayName, cleanEmail, `https://unavatar.io/google/${cleanEmail}`]
        );
        user = {
          id: insertResult.insertId,
          username: '',
          name: displayName,
          email: cleanEmail,
          avatar_url: `https://unavatar.io/google/${cleanEmail}`,
        };
      }

      const effectiveAvatar = user.avatar_url || `https://unavatar.io/google/${cleanEmail}`;
      const userObj = {
        id: user.id,
        username: user.username || '',
        name: user.name || user.username || 'Madhavan',
        email: user.email,
        avatar_url: effectiveAvatar,
        avatarUrl: effectiveAvatar,
      };

      const token = jwt.sign(
        {
          id: user.id,
          username: userObj.username,
          email: cleanEmail,
          name: userObj.name,
          avatarUrl: userObj.avatarUrl,
        },
        process.env.JWT_SECRET || 'rise_jwt_secret',
        { expiresIn: '30d' }
      );

      return res.status(200).json({
        success: true,
        message: 'Welcome back! Signed in successfully (OTP bypass enabled).',
        bypassOtp: true,
        token,
        user: userObj,
      });
    } catch (bypassErr) {
      console.error('bypass error:', bypassErr);
    }
  }

  const isLoginMode = mode === 'login' || req.path.includes('/login');
  const isSignupMode = mode === 'signup' || req.path.includes('/signup');

  try {
    // If mode is login, verify user exists in DB before sending OTP
    if (isLoginMode) {
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [cleanEmail]
      );
      if (existingUsers.length === 0) {
        return res.status(404).json({
          status: 404,
          message: 'No account found. Please sign up to create an account.',
        });
      }
    }

    // If mode is signup, return 409 if user already has an account
    if (isSignupMode) {
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ? LIMIT 1',
        [cleanEmail]
      );
      if (existingUsers.length > 0) {
        return res.status(409).json({
          status: 409,
          message: 'You already have an account. Log in here.',
        });
      }
    }

    // Check rate limit / cooldown from existing pending OTP
    const [pendingRows] = await db.execute(
      'SELECT id, UNIX_TIMESTAMP(last_sent_at) as last_sent_ts FROM signup_otps WHERE email = ? LIMIT 1',
      [cleanEmail]
    );
    if (pendingRows.length > 0) {
      const nowTs = Math.floor(Date.now() / 1000);
      const elapsed = nowTs - (pendingRows[0].last_sent_ts || 0);
      if (elapsed < 30) {
        const remaining = 30 - elapsed;
        return res.status(429).json({
          message: `Please wait ${remaining} seconds before requesting another code.`,
          cooldownRemaining: remaining,
        });
      }
    }

    // Generate cryptographically secure 6-digit OTP supporting leading zeros
    const rawOtp = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    const otpHash = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in signup_otps table
    await db.execute(
      `INSERT INTO signup_otps (email, otp_hash, expires_at, attempts, purpose, last_sent_at)
       VALUES (?, ?, ?, 0, 'auth', NOW())
       ON DUPLICATE KEY UPDATE
         otp_hash = VALUES(otp_hash),
         expires_at = VALUES(expires_at),
         attempts = 0,
         purpose = 'auth',
         oauth_provider = NULL,
         oauth_id = NULL,
         last_sent_at = NOW()`,
      [cleanEmail, otpHash, expiresAt]
    );

    // Dispatch email using the Rise OTP verification email template
    const emailResult = await sendOtpEmail(cleanEmail, rawOtp);
    if (!emailResult.success) {
      // Invalidate session if delivery failed
      await db.execute('DELETE FROM signup_otps WHERE email = ?', [cleanEmail]);
      return res.status(500).json({
        message: 'Unable to deliver verification email at this time. Please try again later.'
      });
    }

    const responsePayload = {
      success: true,
      message: emailResult.simulated
        ? 'Verification code generated! (SMTP daily quota limit reached: check terminal for code)'
        : 'Verification code sent to your email.',
      email: cleanEmail,
      cooldown: 30,
    };
    if (emailResult.simulated) {
      responsePayload.notice = 'Gmail daily SMTP limit reached. Code logged in backend terminal.';
      if (process.env.NODE_ENV !== 'production') {
        responsePayload.devOtp = rawOtp;
      }
    }

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error('request-otp error:', err);
    return res.status(500).json({ message: 'Unable to process verification request. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
// 2. Passwordless Email OTP: Verify OTP (both /signup & /login)
// ─────────────────────────────────────────────────────────────
router.post(['/verify-otp', '/signup/verify-otp'], async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and 6-digit verification code are required.' });
  }
  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = otp.toString().trim();

  if (!/^\d{6}$/.test(cleanOtp)) {
    return res.status(400).json({ message: 'Verification code must be 6 digits.' });
  }

  try {
    const isBypassUser = cleanEmail === 'madhavanvairavan3@gmail.com';

    const [rows] = await db.execute(
      `SELECT id, otp_hash, attempts, purpose, username, oauth_provider, oauth_id, name, avatar_url,
              UNIX_TIMESTAMP(expires_at) as expires_ts
       FROM signup_otps WHERE email = ? LIMIT 1`,
      [cleanEmail]
    );

    if (rows.length === 0 && !isBypassUser) {
      return res.status(400).json({ message: 'No verification session found for this email. Please request a new code.' });
    }

    const record = rows[0] || {
      id: 0,
      attempts: 0,
      purpose: 'auth',
      username: '',
      oauth_provider: null,
      oauth_id: null,
      name: 'Madhavan',
      avatar_url: `https://unavatar.io/google/${cleanEmail}`,
    };
    const nowTs = Math.floor(Date.now() / 1000);

    // Check expiration (10 min) unless bypass user
    if (!isBypassUser && nowTs > record.expires_ts) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Check attempt limit (max 5) unless bypass user
    if (!isBypassUser && record.attempts >= 5) {
      return res.status(400).json({ message: 'Too many incorrect attempts. Please request a new verification code.' });
    }

    // Verify OTP hash (allow bypass for madhavanvairavan3@gmail.com)
    const submittedHash = hashOtp(cleanOtp);
    if (!isBypassUser && submittedHash !== record.otp_hash) {
      const nextAttempts = record.attempts + 1;
      await db.execute('UPDATE signup_otps SET attempts = ? WHERE id = ?', [nextAttempts, record.id]);
      const remaining = 5 - nextAttempts;
      return res.status(400).json({
        message:
          remaining > 0
            ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
            : 'Incorrect code. Maximum attempts reached. Please request a new code.',
      });
    }

    // OTP verified successfully: Consume & remove OTP session
    await db.execute('DELETE FROM signup_otps WHERE email = ?', [cleanEmail]);

    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id, username, name, email, auth_provider, avatar_url, google_id, github_id FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );

    let userObj;
    let userId;
    let isNewUser = false;

    if (existingUsers.length > 0) {
      // ── EXISTING USER: Preserves existing progress, enrollments & settings ──
      const user = existingUsers[0];
      userId = user.id;

      // If verified as part of Google/GitHub OAuth, link identity & update profile
      if (record.oauth_provider === 'google') {
        const updateAvatar = record.avatar_url || user.avatar_url;
        const updatedName = (record.name && record.name.trim()) || user.name || '';
        await db.execute(
          'UPDATE users SET google_id = COALESCE(google_id, ?), avatar_url = COALESCE(?, avatar_url), name = COALESCE(NULLIF(?, ""), NULLIF(name, ""), ?) WHERE id = ?',
          [record.oauth_id, record.avatar_url, record.name || null, record.name || null, user.id]
        );
        user.avatar_url = updateAvatar;
        user.name = updatedName;
      } else if (record.oauth_provider === 'github') {
        const updateAvatar = record.avatar_url || user.avatar_url;
        const updatedName = (record.name && record.name.trim()) || user.name || '';
        await db.execute(
          'UPDATE users SET github_id = COALESCE(github_id, ?), avatar_url = COALESCE(?, avatar_url), name = COALESCE(NULLIF(?, ""), NULLIF(name, ""), ?) WHERE id = ?',
          [record.oauth_id, record.avatar_url, record.name || null, record.name || null, user.id]
        );
        user.avatar_url = updateAvatar;
        user.name = updatedName;
      }

      const effectiveAvatar = user.avatar_url || (user.email?.endsWith('@gmail.com') ? `https://unavatar.io/google/${user.email}` : null);

      userObj = {
        id: user.id,
        username: user.username || '',
        name: user.name || user.username || '',
        email: user.email,
        avatar_url: effectiveAvatar,
        avatarUrl: effectiveAvatar,
      };
    } else {
      // ── NEW USER: Created only AFTER OTP verification ──
      isNewUser = true;
      const provider = record.oauth_provider || 'email_otp';
      const googleId = record.oauth_provider === 'google' ? record.oauth_id : null;
      const githubId = record.oauth_provider === 'github' ? record.oauth_id : null;
      const defaultName = cleanEmail.split('@')[0];
      const displayName = (record.name && record.name.trim()) || (defaultName.charAt(0).toUpperCase() + defaultName.slice(1));
      const avatarUrl = record.avatar_url || (cleanEmail.endsWith('@gmail.com') ? `https://unavatar.io/google/${cleanEmail}` : null);

      const [insertResult] = await db.execute(
        'INSERT INTO users (name, email, google_id, github_id, auth_provider, avatar_url, email_verified) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [displayName, cleanEmail, googleId, githubId, provider, avatarUrl]
      );
      userId = insertResult.insertId;
      userObj = {
        id: userId,
        username: '',
        name: displayName,
        email: cleanEmail,
        avatar_url: avatarUrl,
        avatarUrl,
      };

      // Asynchronously dispatch welcome email (non-blocking)
      emailService.sendWelcomeEmail(cleanEmail, displayName).catch((err) => {
        console.warn('⚠️ Welcome email background error:', err.message);
      });
    }

    // Issue JWT token only after successful OTP verification
    const token = jwt.sign(
      {
        id: userId,
        username: userObj.username,
        email: cleanEmail,
        name: userObj.name,
        avatarUrl: userObj.avatarUrl,
      },
      process.env.JWT_SECRET || 'rise_jwt_secret',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      isNewUser,
      message: isNewUser ? 'Account verified and created successfully.' : 'Welcome back! Signed in successfully.',
      user: userObj,
      token,
    });
  } catch (err) {
    console.error('verify-otp error:', err);
    return res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
// 3. Passwordless Email OTP: Resend OTP
// ─────────────────────────────────────────────────────────────
router.post(['/resend-otp', '/signup/resend-otp'], async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }
  const cleanEmail = email.trim().toLowerCase();

  try {
    const [rows] = await db.execute(
      `SELECT id, UNIX_TIMESTAMP(last_sent_at) as last_sent_ts
       FROM signup_otps WHERE email = ? LIMIT 1`,
      [cleanEmail]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'No verification session in progress for this email. Please request a new code.' });
    }

    const record = rows[0];
    const nowTs = Math.floor(Date.now() / 1000);
    const elapsed = nowTs - (record.last_sent_ts || 0);

    if (elapsed < 30) {
      const remaining = 30 - elapsed;
      return res.status(429).json({
        message: `Please wait ${remaining} seconds before resending.`,
        cooldownRemaining: remaining,
      });
    }

    // Generate fresh OTP supporting leading zeros
    const rawOtp = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    const otpHash = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.execute(
      `UPDATE signup_otps
       SET otp_hash = ?, expires_at = ?, attempts = 0, last_sent_at = NOW()
       WHERE id = ?`,
      [otpHash, expiresAt, record.id]
    );

    const emailResult = await sendOtpEmail(cleanEmail, rawOtp);
    if (!emailResult.success) {
      return res.status(500).json({
        message: 'Unable to deliver verification email at this time. Please try again later.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'A fresh verification code has been sent to your email.',
      cooldown: 30,
    });
  } catch (err) {
    console.error('resend-otp error:', err);
    return res.status(500).json({ message: 'Failed to resend code. Please try again.' });
  }
});
// ─────────────────────────────────────────────────────────────
// 3b. Account Linking: Resend Linking OTP
// ─────────────────────────────────────────────────────────────
router.post(['/link/resend-otp', '/auth/link/resend-otp'], async (req, res) => {
  const { link_token, linkToken } = req.body;
  const token = link_token || linkToken;

  if (!token) {
    return res.status(400).json({ message: 'Link token is required.' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT id, email, provider, provider_name, UNIX_TIMESTAMP(expires_at) as expires_ts, consumed
       FROM oauth_pending_links WHERE link_token = ? LIMIT 1`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'No active linking session found. Please start sign-in again.' });
    }

    const record = rows[0];
    const nowTs = Math.floor(Date.now() / 1000);

    if (record.consumed !== 0 || nowTs > record.expires_ts) {
      return res.status(400).json({ message: 'Linking session has expired. Please sign in again.' });
    }

    // Generate fresh OTP supporting leading zeros
    const rawOtp = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    const otpHash = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.execute(
      `UPDATE oauth_pending_links
       SET otp_hash = ?, expires_at = ?, attempts = 0
       WHERE id = ?`,
      [otpHash, expiresAt, record.id]
    );

    const emailResult = await sendLinkingEmail(record.email, rawOtp, record.provider, record.provider_name);
    if (!emailResult.success) {
      return res.status(500).json({
        message: 'Unable to deliver verification email at this time. Please try again later.'
      });
    }

    const responsePayload = {
      success: true,
      message: 'A fresh verification code has been sent to your email.',
      cooldown: 30,
    };
    if (emailResult.simulated) {
      responsePayload.notice = 'Gmail daily SMTP limit reached. Code logged in terminal.';
      if (process.env.NODE_ENV !== 'production') {
        responsePayload.devOtp = rawOtp;
      }
    }

    return res.status(200).json(responsePayload);
  } catch (err) {
    console.error('link/resend-otp error:', err);
    return res.status(500).json({ message: 'Failed to resend linking code. Please try again.' });
  }
});

// ─────────────────────────────────────────────────────────────
// 4. Secure Account Linking: Verify Linking OTP
// ─────────────────────────────────────────────────────────────
router.post('/link/verify-otp', async (req, res) => {
  const { link_token, otp } = req.body;

  if (!link_token || !otp) {
    return res.status(400).json({ message: 'Link token and 6-digit verification code are required.' });
  }

  const cleanOtp = otp.toString().trim();
  if (!/^\d{6}$/.test(cleanOtp)) {
    return res.status(400).json({ message: 'Verification code must be 6 digits.' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT id, email, provider, provider_id, provider_name, avatar_url, otp_hash, attempts,
              UNIX_TIMESTAMP(expires_at) as expires_ts, consumed
       FROM oauth_pending_links WHERE link_token = ? LIMIT 1`,
      [link_token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired linking session. Please start sign-in again.' });
    }

    const record = rows[0];
    const nowTs = Math.floor(Date.now() / 1000);

    if (record.consumed !== 0 || nowTs > record.expires_ts) {
      return res.status(400).json({ message: 'Linking session has expired. Please sign in again.' });
    }

    if (record.attempts >= 5) {
      return res.status(400).json({ message: 'Too many incorrect attempts. Please initiate linking again.' });
    }

    const submittedHash = hashOtp(cleanOtp);
    if (submittedHash !== record.otp_hash) {
      const nextAttempts = record.attempts + 1;
      await db.execute('UPDATE oauth_pending_links SET attempts = ? WHERE id = ?', [nextAttempts, record.id]);
      const remaining = 5 - nextAttempts;
      return res.status(400).json({
        message:
          remaining > 0
            ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
            : 'Incorrect code. Maximum attempts reached.',
      });
    }

    // Mark linking session consumed
    await db.execute('UPDATE oauth_pending_links SET consumed = 1 WHERE id = ?', [record.id]);

    // Find target user by verified email
    const [userRows] = await db.execute(
      'SELECT id, username, name, email, avatar_url, google_id, github_id FROM users WHERE email = ? LIMIT 1',
      [record.email]
    );

    if (userRows.length === 0) {
      return res.status(400).json({ message: 'Account not found for linking.' });
    }

    const user = userRows[0];

    // Link provider identity securely
    if (record.provider === 'google') {
      await db.execute(
        'UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?',
        [record.provider_id, record.avatar_url, user.id]
      );
    } else if (record.provider === 'github') {
      await db.execute(
        'UPDATE users SET github_id = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?',
        [record.provider_id, record.avatar_url, user.id]
      );
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatar_url || record.avatar_url,
      },
      process.env.JWT_SECRET || 'rise_jwt_secret',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: `${record.provider === 'google' ? 'Google' : 'GitHub'} account linked successfully.`,
      user: {
        id: user.id,
        username: user.username || '',
        name: user.name || user.username || '',
        email: user.email,
        avatarUrl: user.avatar_url || record.avatar_url,
      },
      token,
    });
  } catch (err) {
    console.error('link/verify-otp error:', err);
    return res.status(500).json({ message: 'Failed to verify linking code.' });
  }
});

// ─────────────────────────────────────────────────────────────
// 5. Google OAuth Flow
// ─────────────────────────────────────────────────────────────
router.get('/google', async (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';
  const mode = req.query.mode === 'signup' ? 'signup' : 'login';

  if (!clientId) {
    return res.status(500).json({ message: 'Google OAuth is not configured on the server.' });
  }

  try {
    // Clean up expired login states
    await db.execute('DELETE FROM oauth_login_states WHERE expires_at < NOW()');

    // Generate secure state token encoding the auth mode for CSRF protection
    const rawState = crypto.randomBytes(32).toString('hex');
    const state = `${mode}_${rawState}`;
    await db.execute(
      `INSERT INTO oauth_login_states (state, provider, consumed, expires_at)
       VALUES (?, 'google', 0, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [state]
    );

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
      state,
    });

    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  } catch (err) {
    console.error('google login init error:', err);
    return res.status(500).json({ message: 'Failed to initiate Google sign-in.' });
  }
});

router.get('/google/callback', async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const { code, state, error, error_description } = req.query;

  const mode = (state && typeof state === 'string' && state.startsWith('signup_')) ? 'signup' : 'login';
  const redirectPage = mode === 'signup' ? `${clientUrl}/signup` : `${clientUrl}/login`;

  if (error || !code || !state) {
    const isDenied = error === 'access_denied';
    const friendlyMsg = isDenied
      ? 'Google sign-in was cancelled.'
      : error_description || error || 'Google sign-in was cancelled.';
    return res.redirect(`${redirectPage}?error=${encodeURIComponent(friendlyMsg)}`);
  }

  try {
    // Validate state token (single-use CSRF protection)
    const [loginRows] = await db.execute(
      'SELECT id, consumed, UNIX_TIMESTAMP(expires_at) as expires_ts FROM oauth_login_states WHERE state = ? LIMIT 1',
      [state]
    );

    if (loginRows.length === 0) {
      return res.redirect(`${redirectPage}?error=${encodeURIComponent('Invalid or unrecognized login session.')}`);
    }

    const loginRecord = loginRows[0];
    const nowTs = Math.floor(Date.now() / 1000);
    if (loginRecord.consumed !== 0 || loginRecord.expires_ts <= nowTs) {
      return res.redirect(`${redirectPage}?error=${encodeURIComponent('Login session expired or already used.')}`);
    }

    // Atomically consume login state
    const [consumeRes] = await db.execute(
      'UPDATE oauth_login_states SET consumed = 1 WHERE id = ? AND consumed = 0',
      [loginRecord.id]
    );
    if (consumeRes.affectedRows === 0) {
      return res.redirect(`${redirectPage}?error=${encodeURIComponent('Login session already used.')}`);
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Google token exchange failed:', tokenData);
      return res.redirect(`${redirectPage}?error=${encodeURIComponent('Failed to exchange Google authorization code.')}`);
    }

    // Fetch Google user profile
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser = await userResponse.json();
    if (!userResponse.ok || !googleUser.email || !googleUser.sub) {
      console.error('Google user info failed:', googleUser);
      return res.redirect(`${redirectPage}?error=${encodeURIComponent('Failed to retrieve user profile from Google.')}`);
    }

    const email = googleUser.email.trim().toLowerCase();
    const googleSub = String(googleUser.sub);
    const profileName =
      googleUser.name ||
      [googleUser.given_name, googleUser.family_name].filter(Boolean).join(' ') ||
      googleUser.displayName ||
      email.split('@')[0];
    const avatarUrl = googleUser.picture || null;

    // ── Bug 3 Check: New users trying to login ──
    const [existingByGoogle] = await db.execute(
      'SELECT id FROM users WHERE google_id = ? LIMIT 1',
      [googleSub]
    );
    const [existingByEmail] = await db.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    const userExists = existingByGoogle.length > 0 || existingByEmail.length > 0;

    if (mode === 'login' && !userExists) {
      return res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent('No account found. Please sign up to create an account.')}`
      );
    }

    // Pre-deployment developer bypass for personal account: direct Google login without OTP
    if (email === 'madhavanvairavan3@gmail.com') {
      let [users] = await db.execute(
        'SELECT id, username, name, email, avatar_url FROM users WHERE email = ? LIMIT 1',
        [email]
      );
      let user;
      if (users.length > 0) {
        user = users[0];
        await db.execute(
          'UPDATE users SET google_id = COALESCE(google_id, ?), avatar_url = COALESCE(?, avatar_url), name = COALESCE(NULLIF(?, ""), NULLIF(name, ""), ?) WHERE id = ?',
          [googleSub, avatarUrl, profileName || null, profileName || null, user.id]
        );
      } else {
        const [insertResult] = await db.execute(
          'INSERT INTO users (name, email, google_id, auth_provider, avatar_url, email_verified) VALUES (?, ?, ?, "google", ?, 1)',
          [profileName || 'Madhavan', email, googleSub, avatarUrl]
        );
        user = {
          id: insertResult.insertId,
          username: '',
          name: profileName || 'Madhavan',
          email,
          avatar_url: avatarUrl,
        };
      }

      const effectiveAvatar = avatarUrl || user.avatar_url || `https://unavatar.io/google/${email}`;
      const userObj = {
        id: user.id,
        username: user.username || '',
        name: profileName || user.name || 'Madhavan',
        email: user.email,
        avatar_url: effectiveAvatar,
        avatarUrl: effectiveAvatar,
      };

      const token = jwt.sign(
        {
          id: user.id,
          username: userObj.username,
          email: user.email,
          name: userObj.name,
          avatarUrl: userObj.avatarUrl,
        },
        process.env.JWT_SECRET || 'rise_jwt_secret',
        { expiresIn: '30d' }
      );

      const redirectParams = new URLSearchParams({
        token,
        name: userObj.name,
        email: user.email,
        avatar: effectiveAvatar,
      });

      return res.redirect(`${clientUrl}/login?${redirectParams.toString()}`);
    }

    // ── Bug 1 & 2: DO NOT create session/token yet. Generate and email OTP! ──
    const rawOtp = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    const otpHash = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in signup_otps table with OAuth metadata
    await db.execute(
      `INSERT INTO signup_otps (email, otp_hash, expires_at, attempts, purpose, oauth_provider, oauth_id, name, avatar_url, last_sent_at)
       VALUES (?, ?, ?, 0, 'auth', 'google', ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         otp_hash = VALUES(otp_hash),
         expires_at = VALUES(expires_at),
         attempts = 0,
         purpose = 'auth',
         oauth_provider = 'google',
         oauth_id = VALUES(oauth_id),
         name = VALUES(name),
         avatar_url = VALUES(avatar_url),
         last_sent_at = NOW()`,
      [email, otpHash, expiresAt, googleSub, profileName, avatarUrl]
    );

    // Send verification code to user's email
    const emailResult = await sendOtpEmail(email, rawOtp, profileName);
    if (!emailResult.success) {
      await db.execute('DELETE FROM signup_otps WHERE email = ?', [email]);
      return res.redirect(`${redirectPage}?error=${encodeURIComponent('Unable to send verification code to your email. Please try again.')}`);
    }

    // Redirect to frontend OTP input screen
    const redirectParams = new URLSearchParams({
      status: 'otp_required',
      otp_required: '1',
      email,
      auth_type: 'google',
    });
    if (emailResult.simulated || process.env.NODE_ENV !== 'production') {
      redirectParams.set('dev_otp', rawOtp);
    }

    return res.redirect(`${redirectPage}?${redirectParams.toString()}`);
  } catch (err) {
    console.error('Google callback error:', err);
    return res.redirect(`${redirectPage}?error=${encodeURIComponent('An error occurred during Google sign-in.')}`);
  }
});

// ─────────────────────────────────────────────────────────────
// 6. GitHub OAuth Flow
// ─────────────────────────────────────────────────────────────
router.get('/github', async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback';
  const mode = req.query.mode === 'signup' ? 'signup' : 'login';

  if (!clientId) {
    return res.status(500).json({ message: 'GitHub OAuth is not configured on the server.' });
  }

  try {
    // Clean up expired login states
    await db.execute('DELETE FROM oauth_login_states WHERE expires_at < NOW()');

    // Generate secure state token encoding auth mode
    const rawState = crypto.randomBytes(32).toString('hex');
    const state = `${mode}_${rawState}`;
    await db.execute(
      `INSERT INTO oauth_login_states (state, provider, consumed, expires_at)
       VALUES (?, 'github', 0, DATE_ADD(NOW(), INTERVAL 10 MINUTE))`,
      [state]
    );

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'read:user user:email',
      state,
    });

    return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
  } catch (err) {
    console.error('GitHub init error:', err);
    return res.status(500).json({ message: 'Failed to initiate GitHub sign-in.' });
  }
});

router.get('/github/callback', async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const { code, state, error, error_description } = req.query;

  const mode = (state && typeof state === 'string' && state.startsWith('signup_')) ? 'signup' : 'login';
  const redirectPage = mode === 'signup' ? `${clientUrl}/signup` : `${clientUrl}/login`;

  if (error || !code) {
    const msg = error_description || error || 'GitHub sign-in was cancelled.';
    return res.redirect(`${redirectPage}?error=${encodeURIComponent(msg)}`);
  }

  try {
    // Validate state if present
    if (state) {
      const [loginRows] = await db.execute(
        'SELECT id, consumed, UNIX_TIMESTAMP(expires_at) as expires_ts FROM oauth_login_states WHERE state = ? LIMIT 1',
        [state]
      );
      if (loginRows.length > 0) {
        const loginRecord = loginRows[0];
        const nowTs = Math.floor(Date.now() / 1000);
        if (loginRecord.consumed === 0 && loginRecord.expires_ts > nowTs) {
          await db.execute('UPDATE oauth_login_states SET consumed = 1 WHERE id = ?', [loginRecord.id]);
        }
      }
    }

    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback',
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('GitHub token exchange failed:', tokenData);
      return res.redirect(`${redirectPage}?error=${encodeURIComponent(tokenData.error_description || 'Failed to exchange GitHub authorization code.')}`);
    }

    // 2. Fetch GitHub user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'Rise-App',
      },
    });

    const githubUser = await userResponse.json();
    if (!userResponse.ok || !githubUser.id) {
      console.error('GitHub user profile failed:', githubUser);
      return res.redirect(`${redirectPage}?error=${encodeURIComponent('Failed to retrieve user profile from GitHub.')}`);
    }

    const githubId = String(githubUser.id);
    const profileName = githubUser.name || githubUser.login || 'GitHub User';
    const avatarUrl = githubUser.avatar_url || null;

    // 3. Extract verified email through GitHub Email API
    let verifiedEmail = null;
    try {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          'User-Agent': 'Rise-App',
        },
      });
      const emails = await emailsResponse.json();
      if (Array.isArray(emails)) {
        const primaryVerified = emails.find((e) => e.primary && e.verified);
        const anyVerified = emails.find((e) => e.verified);
        if (primaryVerified) verifiedEmail = primaryVerified.email;
        else if (anyVerified) verifiedEmail = anyVerified.email;
      }
    } catch (err) {
      console.warn('Could not fetch secondary GitHub emails:', err);
    }

    if (!verifiedEmail && githubUser.email) {
      verifiedEmail = githubUser.email;
    }

    if (!verifiedEmail) {
      return res.redirect(
        `${redirectPage}?error=${encodeURIComponent(
          'Your GitHub account does not have a verified email address. Please sign in with email OTP.'
        )}`
      );
    }

    verifiedEmail = verifiedEmail.trim().toLowerCase();

    // ── Bug 3 Check: New users trying to login via GitHub ──
    const [byGithubId] = await db.execute(
      'SELECT id FROM users WHERE github_id = ? LIMIT 1',
      [githubId]
    );
    const [byEmail] = await db.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [verifiedEmail]
    );
    const userExists = byGithubId.length > 0 || byEmail.length > 0;

    if (mode === 'login' && !userExists) {
      return res.redirect(
        `${clientUrl}/login?error=${encodeURIComponent('No account found. Please sign up to create an account.')}`
      );
    }

    // ── Bug 1 & 2: DO NOT create session/token yet. Generate and email OTP! ──
    const rawOtp = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
    const otpHash = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.execute(
      `INSERT INTO signup_otps (email, otp_hash, expires_at, attempts, purpose, oauth_provider, oauth_id, name, avatar_url, last_sent_at)
       VALUES (?, ?, ?, 0, 'auth', 'github', ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         otp_hash = VALUES(otp_hash),
         expires_at = VALUES(expires_at),
         attempts = 0,
         purpose = 'auth',
         oauth_provider = 'github',
         oauth_id = VALUES(oauth_id),
         name = VALUES(name),
         avatar_url = VALUES(avatar_url),
         last_sent_at = NOW()`,
      [verifiedEmail, otpHash, expiresAt, githubId, profileName, avatarUrl]
    );

    const emailResult = await sendOtpEmail(verifiedEmail, rawOtp, profileName);
    if (!emailResult.success) {
      await db.execute('DELETE FROM signup_otps WHERE email = ?', [verifiedEmail]);
      return res.redirect(`${redirectPage}?error=${encodeURIComponent('Unable to send verification code to your email. Please try again.')}`);
    }

    const redirectParams = new URLSearchParams({
      status: 'otp_required',
      otp_required: '1',
      email: verifiedEmail,
      auth_type: 'github',
    });
    if (emailResult.simulated || process.env.NODE_ENV !== 'production') {
      redirectParams.set('dev_otp', rawOtp);
    }

    return res.redirect(`${redirectPage}?${redirectParams.toString()}`);
  } catch (err) {
    console.error('GitHub callback error:', err);
    return res.redirect(`${redirectPage}?error=${encodeURIComponent('An error occurred during GitHub sign-in.')}`);
  }
});

// ─────────────────────────────────────────────────────────────
// 7. Legacy Login & Profile Endpoints
// ─────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }
  const cleanEmail = email.trim().toLowerCase();
  const [existingUsers] = await db.execute(
    'SELECT id FROM users WHERE email = ? LIMIT 1',
    [cleanEmail]
  );
  if (existingUsers.length === 0) {
    return res.status(404).json({
      status: 404,
      message: 'No account found. Please sign up to create an account.',
    });
  }
  return res.status(400).json({
    success: false,
    message: 'Rise uses passwordless authentication. Please use /api/auth/request-otp with your email to receive a verification code.',
  });
});

router.get('/me', auth, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, username, name, email, auth_provider, avatar_url, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }
    return res.status(200).json({ user: users[0] });
  } catch (err) {
    console.error('auth/me error:', err);
    return res.status(500).json({ message: 'Failed to retrieve user profile.' });
  }
});

// Legacy check-username endpoint (preserved for backwards test compatibility)
router.post('/check-username', async (req, res) => {
  const { username } = req.body;
  const val = validateUsername(username);
  if (!val.valid) {
    return res.status(400).json({ available: false, message: val.message });
  }
  try {
    const [rows] = await db.execute(
      'SELECT id FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1',
      [val.username]
    );
    if (rows.length > 0) {
      return res.status(200).json({ available: false, message: 'This username is already taken.' });
    }
    return res.status(200).json({ available: true, message: 'Username is available.' });
  } catch (err) {
    return res.status(500).json({ available: false, message: 'Error checking username.' });
  }
});

module.exports = router;
