// server/routes/auth.js
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const db = require('../config/db');
const auth = require('../middleware/auth');

// Initialize Resend
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.EMAIL_FROM || 'Rise <onboarding@resend.dev>';

// Helper to hash OTP with server salt
function hashOtp(otp) {
  const salt = process.env.JWT_SECRET || 'rise_secure_salt_2026';
  return crypto.createHash('sha256').update(`${otp}:${salt}`).digest('hex');
}

// Helper to send transactional email
async function sendOtpEmail(email, otp) {
  const subject = 'Your Rise verification code';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Rise Verification Code</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #0b1f44; }
        .wrapper { max-width: 460px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 16px rgba(11,31,68,0.06); }
        .logo-wrap { text-align: center; margin-bottom: 24px; }
        .logo { font-size: 26px; font-weight: 800; color: #2563eb; letter-spacing: -0.04em; }
        h1 { font-size: 20px; font-weight: 700; color: #0b1f44; margin: 0 0 10px; text-align: center; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px; text-align: center; }
        .code-container { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; text-align: center; margin: 0 0 24px; }
        .code { font-size: 34px; font-weight: 800; letter-spacing: 0.28em; color: #2563eb; font-family: ui-monospace, Menlo, Monaco, 'Courier New', monospace; margin-left: 0.28em; }
        .expiry { font-size: 13px; color: #64748b; text-align: center; margin-bottom: 24px; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="logo-wrap">
          <span class="logo">RISE</span>
        </div>
        <h1>Verify your email address</h1>
        <p>Welcome to Rise! Please use the following 6-digit verification code to complete your account registration.</p>
        <div class="code-container">
          <span class="code">${otp}</span>
        </div>
        <div class="expiry">This code will expire in <strong>10 minutes</strong>.</div>
        <p class="footer">If you did not request this verification code, please ignore this email.<br>© ${new Date().getFullYear()} Rise Technologies, Inc. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
  const text = `Your Rise verification code is: ${otp}\n\nThis code will expire in 10 minutes.\nIf you did not request this code, you can safely ignore this email.\n\n© ${new Date().getFullYear()} Rise Technologies, Inc.`;

  if (resend) {
    try {
      const response = await resend.emails.send({
        from: fromEmail,
        to: email,
        subject,
        html,
        text
      });
      if (response.error) {
        console.warn('⚠️ Resend email returned response error:', response.error);
        if (process.env.NODE_ENV !== 'production') {
          console.log(`\n[DEV OTP FALLBACK] Code for ${email}: ${otp}\n`);
        }
      }
      return { success: true, id: response.data?.id };
    } catch (err) {
      console.warn('⚠️ Resend API exception:', err.message);
      if (process.env.NODE_ENV !== 'production') {
        console.log(`\n[DEV OTP FALLBACK] Code for ${email}: ${otp}\n`);
      }
      return { success: false, error: err.message };
    }
  } else {
    // When RESEND_API_KEY is not configured, log to server console for local testing
    console.log(`\n========================================\n[DEV OTP] Verification code for ${email}: ${otp}\n========================================\n`);
    return { success: true, simulated: true };
  }
}

/**
 * POST /api/auth/signup/request-otp
 * Step 1: Validate credentials, check uniqueness, generate & hash OTP, send email.
 */
router.post('/signup/request-otp', async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'A valid email address is required.' });
  }
  const cleanEmail = email.trim().toLowerCase();
  if (!/\S+@\S+\.\S+/.test(cleanEmail)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Password is required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }

  try {
    // Check if user already exists
    const [existingUsers] = await db.execute(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'An account with this email address already exists. Please log in.' });
    }

    // Check rate limit / cooldown from existing pending signup
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
          cooldownRemaining: remaining
        });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate secure 6-digit OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in signup_otps
    await db.execute(
      `INSERT INTO signup_otps (email, password_hash, otp_hash, expires_at, attempts, last_sent_at)
       VALUES (?, ?, ?, ?, 0, NOW())
       ON DUPLICATE KEY UPDATE
         password_hash = VALUES(password_hash),
         otp_hash = VALUES(otp_hash),
         expires_at = VALUES(expires_at),
         attempts = 0,
         last_sent_at = NOW()`,
      [cleanEmail, passwordHash, otpHash, expiresAt]
    );

    // Dispatch email
    await sendOtpEmail(cleanEmail, rawOtp);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email.',
      email: cleanEmail,
      cooldown: 30
    });
  } catch (err) {
    console.error('request-otp error:', err);
    return res.status(500).json({ message: 'Unable to process sign up request. Please try again.' });
  }
});

/**
 * POST /api/auth/signup/verify-otp
 * Step 2: Validate 6-digit OTP, create user account, delete pending OTP, issue session.
 */
router.post('/signup/verify-otp', async (req, res) => {
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
    const [rows] = await db.execute(
      `SELECT id, password_hash, otp_hash, attempts,
              UNIX_TIMESTAMP(expires_at) as expires_ts
       FROM signup_otps WHERE email = ? LIMIT 1`,
      [cleanEmail]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'No verification session found for this email. Please start over.' });
    }

    const record = rows[0];
    const nowTs = Math.floor(Date.now() / 1000);

    // Check expiration (10 min)
    if (nowTs > record.expires_ts) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Check attempt limit (max 5)
    if (record.attempts >= 5) {
      return res.status(400).json({ message: 'Too many incorrect attempts. Please request a new verification code.' });
    }

    // Verify OTP hash
    const submittedHash = hashOtp(cleanOtp);
    if (submittedHash !== record.otp_hash) {
      const nextAttempts = record.attempts + 1;
      await db.execute(
        'UPDATE signup_otps SET attempts = ? WHERE id = ?',
        [nextAttempts, record.id]
      );
      const remaining = 5 - nextAttempts;
      return res.status(400).json({
        message: remaining > 0
          ? `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
          : 'Incorrect code. Maximum attempts reached. Please request a new code.'
      });
    }

    // Create user securely in users table
    const defaultName = cleanEmail.split('@')[0];
    const [insertResult] = await db.execute(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [defaultName, cleanEmail, record.password_hash]
    );
    const userId = insertResult.insertId;

    // Consume & remove OTP session
    await db.execute('DELETE FROM signup_otps WHERE email = ?', [cleanEmail]);

    // Issue JWT token
    const token = jwt.sign(
      { id: userId, email: cleanEmail, name: defaultName },
      process.env.JWT_SECRET || 'rise_jwt_secret',
      { expiresIn: '7d' }
    );

    const userObj = {
      id: userId,
      email: cleanEmail,
      name: defaultName
    };

    return res.status(200).json({
      success: true,
      message: 'Account verified and created successfully.',
      user: userObj,
      token
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'An account with this email already exists.' });
    }
    console.error('verify-otp error:', err);
    return res.status(500).json({ message: 'Failed to verify code. Please try again.' });
  }
});

/**
 * POST /api/auth/signup/resend-otp
 * Step 3: Resend OTP with server-side 30-second cooldown enforcement.
 */
router.post('/signup/resend-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email address is required.' });
  }
  const cleanEmail = email.trim().toLowerCase();

  try {
    const [rows] = await db.execute(
      `SELECT id, password_hash,
              UNIX_TIMESTAMP(last_sent_at) as last_sent_ts
       FROM signup_otps WHERE email = ? LIMIT 1`,
      [cleanEmail]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: 'No signup in progress for this email. Please start over.' });
    }

    const record = rows[0];
    const nowTs = Math.floor(Date.now() / 1000);
    const elapsed = nowTs - (record.last_sent_ts || 0);

    if (elapsed < 30) {
      const remaining = 30 - elapsed;
      return res.status(429).json({
        message: `Please wait ${remaining} seconds before resending.`,
        cooldownRemaining: remaining
      });
    }

    // Generate fresh OTP
    const rawOtp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.execute(
      `UPDATE signup_otps
       SET otp_hash = ?, expires_at = ?, attempts = 0, last_sent_at = NOW()
       WHERE id = ?`,
      [otpHash, expiresAt, record.id]
    );

    await sendOtpEmail(cleanEmail, rawOtp);

    return res.status(200).json({
      success: true,
      message: 'A fresh verification code has been sent to your email.',
      cooldown: 30
    });
  } catch (err) {
    console.error('resend-otp error:', err);
    return res.status(500).json({ message: 'Failed to resend code. Please try again.' });
  }
});

/**
 * POST /api/auth/login
 * Standard login endpoint for existing users.
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }
  const cleanEmail = email.trim().toLowerCase();

  try {
    const [users] = await db.execute(
      'SELECT id, name, email, password_hash, auth_provider, avatar_url FROM users WHERE email = ? LIMIT 1',
      [cleanEmail]
    );
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const user = users[0];

    // Check if account was registered via OAuth
    if (!user.password_hash) {
      const provider = user.auth_provider === 'github' ? 'GitHub' : 'Google';
      return res.status(400).json({
        message: `This account was registered with ${provider}. Please sign in with ${provider}.`
      });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatar_url },
      process.env.JWT_SECRET || 'rise_jwt_secret',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email, avatarUrl: user.avatar_url },
      token
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

/**
 * GET /api/auth/me
 * Returns currently authenticated user details
 */
router.get('/me', auth, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, name, email, auth_provider, avatar_url, created_at FROM users WHERE id = ? LIMIT 1',
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

/**
 * GET /api/auth/google
 * Redirects user to Google OAuth 2.0 Consent Screen
 */
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

  if (!clientId) {
    return res.status(500).json({ message: 'Google OAuth is not configured on the server.' });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account'
  });

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

/**
 * GET /api/auth/google/callback
 * Handles Google OAuth callback, exchanges authorization code for token, and authenticates user.
 */
router.get('/google/callback', async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const { code, error, error_description } = req.query;

  if (error || !code) {
    const msg = encodeURIComponent(error_description || error || 'Google sign-in was cancelled.');
    return res.redirect(`${clientUrl}/login?error=${msg}`);
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Google token exchange failed:', tokenData);
      const msg = encodeURIComponent(tokenData.error_description || 'Failed to exchange Google authorization code.');
      return res.redirect(`${clientUrl}/login?error=${msg}`);
    }

    // 2. Fetch Google user profile
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const googleUser = await userResponse.json();
    if (!userResponse.ok || !googleUser.email) {
      console.error('Google user info failed:', googleUser);
      const msg = encodeURIComponent('Failed to retrieve user profile from Google.');
      return res.redirect(`${clientUrl}/login?error=${msg}`);
    }

    const email = googleUser.email.trim().toLowerCase();
    const name = googleUser.name || googleUser.given_name || email.split('@')[0];
    const avatarUrl = googleUser.picture || null;

    // 3. Find or create user in database
    let userId;
    const [existing] = await db.execute(
      'SELECT id, name, email, avatar_url FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (existing.length > 0) {
      userId = existing[0].id;
      if (!existing[0].avatar_url && avatarUrl) {
        await db.execute('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, userId]);
      }
    } else {
      const [insertResult] = await db.execute(
        'INSERT INTO users (name, email, password_hash, auth_provider, avatar_url) VALUES (?, ?, NULL, "google", ?)',
        [name, email, avatarUrl]
      );
      userId = insertResult.insertId;
    }

    // 4. Issue Rise JWT
    const token = jwt.sign(
      { id: userId, email, name, avatarUrl },
      process.env.JWT_SECRET || 'rise_jwt_secret',
      { expiresIn: '7d' }
    );

    const redirectParams = new URLSearchParams({
      token,
      name,
      email,
      avatar: avatarUrl || '',
    });

    return res.redirect(`${clientUrl}/login?${redirectParams.toString()}`);
  } catch (err) {
    console.error('Google callback error:', err);
    const msg = encodeURIComponent('An error occurred during Google sign-in. Please try again.');
    return res.redirect(`${clientUrl}/login?error=${msg}`);
  }
});

/**
 * GET /api/auth/github
 * Redirects user to GitHub OAuth authorization page
 */
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback';

  if (!clientId) {
    return res.status(500).json({ message: 'GitHub OAuth is not configured on the server.' });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'read:user user:email'
  });

  return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

/**
 * GET /api/auth/github/callback
 * Handles GitHub OAuth callback, exchanges authorization code for token, and authenticates user.
 */
router.get('/github/callback', async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const { code, error, error_description } = req.query;

  if (error || !code) {
    const msg = encodeURIComponent(error_description || error || 'GitHub sign-in was cancelled.');
    return res.redirect(`${clientUrl}/login?error=${msg}`);
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_CALLBACK_URL || 'http://localhost:5000/api/auth/github/callback'
      })
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('GitHub token exchange failed:', tokenData);
      const msg = encodeURIComponent(tokenData.error_description || 'Failed to exchange GitHub authorization code.');
      return res.redirect(`${clientUrl}/login?error=${msg}`);
    }

    // 2. Fetch GitHub user profile
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'Rise-App'
      }
    });

    const githubUser = await userResponse.json();
    if (!userResponse.ok || !githubUser.id) {
      console.error('GitHub user profile failed:', githubUser);
      const msg = encodeURIComponent('Failed to retrieve user profile from GitHub.');
      return res.redirect(`${clientUrl}/login?error=${msg}`);
    }

    // 3. Extract email (fetch /user/emails if primary email is private)
    let email = githubUser.email;
    if (!email) {
      try {
        const emailsResponse = await fetch('https://api.github.com/user/emails', {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
            'User-Agent': 'Rise-App'
          }
        });
        const emails = await emailsResponse.json();
        if (Array.isArray(emails)) {
          const primary = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified) || emails[0];
          if (primary) email = primary.email;
        }
      } catch (err) {
        console.warn('Could not fetch secondary GitHub emails:', err);
      }
    }

    if (!email) {
      email = `${githubUser.login}@users.noreply.github.com`;
    }

    email = email.trim().toLowerCase();
    const name = githubUser.name || githubUser.login || 'GitHub User';
    const avatarUrl = githubUser.avatar_url || null;

    // 4. Find or create user in database
    let userId;
    const [existing] = await db.execute(
      'SELECT id, name, email, avatar_url FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (existing.length > 0) {
      userId = existing[0].id;
      if (!existing[0].avatar_url && avatarUrl) {
        await db.execute('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, userId]);
      }
    } else {
      const [insertResult] = await db.execute(
        'INSERT INTO users (name, email, password_hash, auth_provider, avatar_url) VALUES (?, ?, NULL, "github", ?)',
        [name, email, avatarUrl]
      );
      userId = insertResult.insertId;
    }

    // 5. Issue Rise JWT
    const token = jwt.sign(
      { id: userId, email, name, avatarUrl },
      process.env.JWT_SECRET || 'rise_jwt_secret',
      { expiresIn: '7d' }
    );

    const redirectParams = new URLSearchParams({
      token,
      name,
      email,
      avatar: avatarUrl || '',
    });

    return res.redirect(`${clientUrl}/login?${redirectParams.toString()}`);
  } catch (err) {
    console.error('GitHub callback error:', err);
    const msg = encodeURIComponent('An error occurred during GitHub sign-in. Please try again.');
    return res.redirect(`${clientUrl}/login?error=${msg}`);
  }
});

module.exports = router;
