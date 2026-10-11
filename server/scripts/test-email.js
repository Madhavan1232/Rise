// server/scripts/test-email.js
require('dotenv').config({ override: true });
const {
  verifyTransporter,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendStreakReminder,
} = require('../services/emailService');

async function runTest() {
  const targetEmail = process.argv[2] || process.env.SMTP_USER || 'madhavanvairavan3@gmail.com';

  console.log('====================================================');
  console.log('🧪 Testing Gmail SMTP Email Service (Nodemailer)');
  console.log('====================================================');
  console.log('SMTP Host:    ', process.env.SMTP_HOST || 'smtp.gmail.com');
  console.log('SMTP Port:    ', process.env.SMTP_PORT || 465);
  console.log('SMTP User:    ', process.env.SMTP_USER || '(not set)');
  console.log('SMTP Pass:    ', process.env.SMTP_PASS ? (process.env.SMTP_PASS === 'your_16_character_app_password' ? '⚠️ (placeholder text)' : '••••••••••••••••') : '❌ (empty)');
  console.log('Recipient:    ', targetEmail);
  console.log('====================================================\n');

  console.log('1️⃣ Checking transporter verification...');
  const isReady = await verifyTransporter();

  if (!isReady) {
    console.log('\nℹ️  Notice: Real emails require a Google 16-character App Password.');
    console.log('   Steps to generate one:');
    console.log('   1. Go to https://myaccount.google.com/security');
    console.log('   2. Ensure 2-Step Verification is turned ON.');
    console.log('   3. Search for "App passwords" (or go to https://myaccount.google.com/apppasswords).');
    console.log('   4. Create an app named "Rise Learning" and copy the 16-character code.');
    console.log('   5. Paste it into server/.env: SMTP_PASS="your_16_char_password"');
    console.log('\nRunning in Simulation Mode to demonstrate payload formatting:\n');
  }

  console.log('2️⃣ Sending sample verification OTP email...');
  const sampleOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const result = await sendVerificationEmail(targetEmail, sampleOtp, 'Madhavan');

  console.log('\n📊 Result:', JSON.stringify(result, null, 2));

  if (result.success) {
    if (result.simulated) {
      console.log('\n✅ Verification OTP template rendered and simulated successfully!');
    } else {
      console.log(`\n🎉 Verification email delivered to ${targetEmail} via Gmail SMTP!`);
    }
  } else {
    console.error('\n❌ Email failed:', result.error);
  }

  process.exit(0);
}

runTest();
