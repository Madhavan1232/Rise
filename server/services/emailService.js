// server/services/emailService.js
/**
 * Direct Gmail SMTP Email Service via Nodemailer
 */
const nodemailer = require('nodemailer');

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT) || 465;
const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const emailFrom = process.env.EMAIL_FROM || (smtpUser ? `Rise Learning <${smtpUser}>` : 'Rise Learning <noreply@rise.dev>');

// Check if credentials are validly supplied (and not placeholder text)
const isConfigured = Boolean(
  smtpUser &&
  smtpPass &&
  smtpPass !== 'your_16_character_app_password' &&
  smtpPass.trim() !== ''
);

// Instantiate reusable Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: isConfigured
    ? {
        user: smtpUser,
        pass: smtpPass,
      }
    : undefined,
});

/**
 * Verify transporter connection on startup
 * @returns {Promise<boolean>}
 */
async function verifyTransporter() {
  if (!isConfigured) {
    console.warn('\n⚠️  [SMTP Warning] SMTP_USER or SMTP_PASS is missing or using placeholder in .env.');
    console.warn('   Emails will be logged to server console (Simulation Mode).');
    console.warn('   To send real emails, generate a 16-character Google App Password and add it to server/.env.\n');
    return false;
  }

  try {
    await transporter.verify();
    console.log(`✅ [SMTP Ready] Connected to Gmail SMTP as ${smtpUser}`);
    return true;
  } catch (err) {
    console.error(`❌ [SMTP Error] Failed to connect to Gmail SMTP:`, err.message);
    return false;
  }
}

/**
 * Core function to send an email via Nodemailer
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text fallback
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string, simulated?: boolean }>}
 */
async function sendEmail({ to, subject, html, text }) {
  const plainText = text || html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

  // If SMTP is not yet configured with real app password, fallback gracefully to simulation
  if (!isConfigured) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n📧 [DEV EMAIL SIMULATOR]`);
      console.log(`   To: ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Status: Simulated (Set SMTP_PASS in .env to send real emails via Gmail SMTP)\n`);
    }
    return {
      success: true,
      simulated: true,
      messageId: `sim_${Date.now()}`,
    };
  }

  try {
    const info = await transporter.sendMail({
      from: emailFrom,
      to,
      subject,
      html,
      text: plainText,
    });

    console.log(`✉️  [Email Sent] Message ID: ${info.messageId} | To: ${to}`);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (err) {
    console.error(`❌ [Email Error] Failed to send email to ${to}:`, err.message);
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`⚠️  [DEV Fallback] Simulating delivery due to SMTP error in development: ${err.message}`);
      return {
        success: true,
        simulated: true,
        messageId: `sim_dev_${Date.now()}`,
      };
    }
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Send Verification OTP Email
 * @param {string} to - Recipient email
 * @param {string} otp - 6-digit OTP code
 */
async function sendVerificationEmail(to, otp) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n' + '='.repeat(60));
    console.log(`🔑 [RISE OTP VERIFICATION CODE]: ${otp}`);
    console.log(`📧 Recipient: ${to}`);
    console.log(`⏱️  Validity: 10 minutes`);
    console.log('='.repeat(60) + '\n');
  }

  const subject = "Rise Login's the 6-digit verification code you requested";

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rise Verification Code</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #ffffff;
      margin: 0;
      padding: 32px 16px;
      color: #0b1f44;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 40px 36px;
      box-shadow: 0 4px 20px rgba(11, 31, 68, 0.05);
    }
    .brand {
      margin-bottom: 24px;
    }
    .brand-name {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.03em;
      color: #2563eb;
    }
    .message-text {
      font-size: 15px;
      line-height: 1.6;
      color: #334155;
      margin: 0 0 20px;
    }
    .code-box {
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 24px 0;
    }
    .code-label {
      font-size: 13px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 8px;
    }
    .code-value {
      font-size: 36px;
      font-weight: 800;
      letter-spacing: 0.28em;
      color: #2563eb;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      margin-left: 0.28em;
      line-height: 1.2;
    }
    .signoff {
      font-size: 14px;
      line-height: 1.6;
      color: #334155;
      margin: 28px 0 0;
    }
    .footer {
      border-top: 1px solid #f1f5f9;
      padding-top: 20px;
      margin-top: 28px;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="brand">
      <span class="brand-name">RISE</span>
    </div>

    <p class="message-text">Hi,</p>

    <p class="message-text">Here's the 6-digit verification code you requested to sign in to your Rise account.</p>

    <div class="code-box">
      <div class="code-label"><strong>Your verification code:</strong></div>
      <div class="code-value">${otp}</div>
    </div>

    <p class="message-text">This code expires in 10 minutes and can only be used once. For your security, please do not share this code with anyone.</p>

    <p class="message-text">If you didn't request this code, you can safely ignore this email.</p>

    <p class="signoff">
      Thanks,<br>
      The Rise Team<br>
      Learn. Grow. Rise.
    </p>

    <div class="footer">
      The Rise Team &mdash; Learn. Grow. Rise.
    </div>
  </div>
</body>
</html>`;

  const text = `Hi,

Here's the 6-digit verification code you requested to sign in to your Rise account.

Your verification code: ${otp}

This code expires in 10 minutes and can only be used once. For your security, please do not share this code with anyone.

If you didn't request this code, you can safely ignore this email.

Thanks,  
The Rise Team  
Learn. Grow. Rise.`;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send Daily Streak Reminder Email
 * @param {string} to - Recipient email
 * @param {number} streakDays - Streak count
 * @param {string} [name] - User name
 */
async function sendStreakReminder(to, streakDays, name = '') {
  const subject = `🔥 Keep your ${streakDays}-day streak alive on Rise!`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #0b1f44; }
        .wrapper { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 16px rgba(11,31,68,0.06); }
        .logo-wrap { text-align: center; margin-bottom: 20px; }
        .logo { font-size: 26px; font-weight: 800; color: #2563eb; letter-spacing: -0.04em; }
        .badge { display: inline-block; background: #fff7ed; border: 1px solid #fed7aa; color: #ea580c; font-size: 14px; font-weight: 700; padding: 6px 14px; border-radius: 9999px; margin-bottom: 16px; }
        h1 { font-size: 20px; font-weight: 700; color: #0b1f44; margin: 0 0 10px; text-align: center; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px; text-align: center; }
        .btn-wrap { text-align: center; margin-bottom: 24px; }
        .btn, a.btn, .btn span { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="logo-wrap"><span class="logo">RISE</span></div>
        <div style="text-align: center;">
          <span class="badge">🔥 ${streakDays} DAY STREAK</span>
        </div>
        <h1>Don't break your momentum!</h1>
        <p>Great job on building your learning habit${name ? `, ${name}` : ''}. Complete today's lesson or quiz to keep your streak going.</p>
        <div class="btn-wrap">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="btn" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;"><span style="color: #ffffff !important; text-decoration: none;">Continue Learning</span></a>
        </div>
        <p class="footer">© ${new Date().getFullYear()} Rise Technologies, Inc. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `Don't break your ${streakDays}-day streak! Continue your lessons today at Rise: ${process.env.CLIENT_URL || 'http://localhost:5173'}`;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

/**
 * Send Welcome Email
 * @param {string} to - Recipient email
 * @param {string} [name] - User name
 */
async function sendWelcomeEmail(to, name = '') {
  const subject = 'Welcome to Rise — Level Up Your Skills';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 16px; color: #0b1f44; }
        .wrapper { max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 36px 32px; box-shadow: 0 4px 16px rgba(11,31,68,0.06); }
        .logo-wrap { text-align: center; margin-bottom: 20px; }
        .logo { font-size: 26px; font-weight: 800; color: #2563eb; letter-spacing: -0.04em; }
        h1 { font-size: 20px; font-weight: 700; color: #0b1f44; margin: 0 0 10px; text-align: center; }
        p { font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 24px; text-align: center; }
        .btn-wrap { text-align: center; margin-bottom: 24px; }
        .btn, a.btn, .btn span { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; }
        .footer { font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 20px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <div class="logo-wrap"><span class="logo">RISE</span></div>
        <h1>Welcome to Rise, ${name || 'Learner'}! 🎉</h1>
        <p>Your account has been created. Explore our interactive modules, hands-on coding environments, and start mastering high-demand tech skills today.</p>
        <div class="btn-wrap">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}" class="btn" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px;"><span style="color: #ffffff !important; text-decoration: none;">Start Learning</span></a>
        </div>
        <p class="footer">© ${new Date().getFullYear()} Rise Technologies, Inc. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;

  const text = `Welcome to Rise! Your account is ready. Start learning today at ${process.env.CLIENT_URL || 'http://localhost:5173'}`;

  return sendEmail({
    to,
    subject,
    html,
    text,
  });
}

module.exports = {
  transporter,
  verifyTransporter,
  sendEmail,
  sendVerificationEmail,
  sendStreakReminder,
  sendWelcomeEmail,
};
