// server/scripts/migrate_passwordless.js
const db = require('../config/db');

async function migrate() {
  const c = await db.getConnection();
  console.log('🔄 Running passwordless database schema migration...');
  try {
    // 1. Add google_id column to users
    try {
      await c.execute('ALTER TABLE users ADD COLUMN google_id VARCHAR(128) NULL UNIQUE');
      console.log('✅ Added users.google_id');
    } catch (e) {
      if (!e.message.includes('Duplicate column')) console.log('users.google_id:', e.message);
    }

    // 2. Add email_verified column to users
    try {
      await c.execute('ALTER TABLE users ADD COLUMN email_verified TINYINT(1) DEFAULT 1');
      console.log('✅ Added users.email_verified');
    } catch (e) {
      if (!e.message.includes('Duplicate column')) console.log('users.email_verified:', e.message);
    }

    // 3. Add username column to users if missing
    try {
      await c.execute('ALTER TABLE users ADD COLUMN username VARCHAR(64) NULL');
      console.log('✅ Added users.username');
    } catch (e) {
      if (!e.message.includes('Duplicate column')) console.log('users.username:', e.message);
    }

    // 4. Safely drop obsolete password_hash column from users
    try {
      await c.execute('ALTER TABLE users DROP COLUMN password_hash');
      console.log('✅ Dropped obsolete users.password_hash column');
    } catch (e) {
      if (!e.message.includes("check that column/key exists")) console.log('users.password_hash cleanup:', e.message);
    }

    // 5. Safely drop obsolete password_hash column from signup_otps
    try {
      await c.execute('ALTER TABLE signup_otps DROP COLUMN password_hash');
      console.log('✅ Dropped obsolete signup_otps.password_hash column');
    } catch (e) {
      if (!e.message.includes("check that column/key exists")) console.log('signup_otps.password_hash cleanup:', e.message);
    }

    // 6. Ensure signup_otps purpose column exists
    try {
      await c.execute("ALTER TABLE signup_otps ADD COLUMN purpose VARCHAR(32) DEFAULT 'auth'");
      console.log('✅ Added signup_otps.purpose');
    } catch (e) {
      if (!e.message.includes('Duplicate column')) console.log('signup_otps.purpose:', e.message);
    }

    // 7. Ensure oauth_pending_links table exists
    await c.execute(`
      CREATE TABLE IF NOT EXISTS oauth_pending_links (
        id INT AUTO_INCREMENT PRIMARY KEY,
        link_token VARCHAR(128) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        provider VARCHAR(32) NOT NULL,
        provider_id VARCHAR(128) NOT NULL,
        provider_name VARCHAR(255) NULL,
        avatar_url VARCHAR(512) NULL,
        otp_hash VARCHAR(255) NOT NULL,
        attempts INT DEFAULT 0,
        expires_at TIMESTAMP NOT NULL,
        consumed TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Verified oauth_pending_links table');

    // 8. Ensure oauth_login_states table exists
    await c.execute(`
      CREATE TABLE IF NOT EXISTS oauth_login_states (
        id INT AUTO_INCREMENT PRIMARY KEY,
        state VARCHAR(128) NOT NULL UNIQUE,
        provider VARCHAR(32) NOT NULL DEFAULT 'google',
        consumed TINYINT(1) DEFAULT 0,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Verified oauth_login_states table');

    console.log('🎉 Passwordless database migration completed successfully!');
  } finally {
    c.release();
  }
}

migrate()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
