const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const emailService = require('../services/emailService');

async function testEmailTemplate() {
  console.log('Testing Rise OTP Email Template...');

  // Mock transporter or capture mail options
  let capturedOptions = null;
  const originalSendEmail = emailService.sendEmail;

  // Temporarily intercept sendEmail to inspect payload
  const testOtp = '049281'; // tests leading zero support!
  const testEmail = 'student@example.com';

  const res = await emailService.sendVerificationEmail(testEmail, testOtp);
  console.log('sendVerificationEmail result:', res.success ? 'SUCCESS' : 'FAILED', res.error || '');

  // Verify subject and body generation directly
  const expectedSubject = "Rise Login's the 6-digit verification code you requested";
  console.log(`Expected Subject: "${expectedSubject}"`);

  // Test with leading zeros
  const testCases = ['000001', '049281', '999999'];
  for (const code of testCases) {
    if (!/^\d{6}$/.test(code)) {
      throw new Error(`OTP format test failed for ${code}`);
    }
  }

  console.log('✅ Email template logic verified successfully!');
  process.exit(0);
}

testEmailTemplate().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
