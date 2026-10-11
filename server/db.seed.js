// server/db.seed.js
const mysql = require('mysql2/promise');
require('dotenv').config({ override: true });

async function seedDatabase() {
  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'rise_user';
  const password = process.env.DB_PASSWORD || 'rise_secure_pass123';
  const database = process.env.DB_NAME || 'rise_db';

  console.log('🔄 Connecting to MySQL database:', `${user}@${host}/${database}`);

  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
      multipleStatements: true,
    });

    console.log('✅ Database connected.');

    // 1. Disable foreign keys temporarily
    console.log('🗑️  Dropping existing tables...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');
    await connection.query('DROP TABLE IF EXISTS enrollments;');
    await connection.query('DROP TABLE IF EXISTS signup_otps;');
    await connection.query('DROP TABLE IF EXISTS oauth_pending_links;');
    await connection.query('DROP TABLE IF EXISTS oauth_login_states;');
    await connection.query('DROP TABLE IF EXISTS users;');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✅ Existing tables dropped.');

    // 2. Re-create users table (Passwordless)
    console.log('🔨 Creating passwordless tables...');
    await connection.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NULL,
        username VARCHAR(64) NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        auth_provider VARCHAR(32) DEFAULT 'email_otp',
        avatar_url VARCHAR(512) NULL,
        google_id VARCHAR(128) NULL UNIQUE,
        github_id VARCHAR(128) NULL UNIQUE,
        email_verified TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Re-create signup_otps table (Passwordless)
    await connection.query(`
      CREATE TABLE signup_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        otp_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        attempts INT DEFAULT 0,
        purpose VARCHAR(32) DEFAULT 'auth',
        oauth_provider VARCHAR(32) NULL,
        oauth_id VARCHAR(128) NULL,
        name VARCHAR(255) NULL,
        avatar_url VARCHAR(512) NULL,
        last_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        username VARCHAR(64) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Re-create oauth_pending_links table
    await connection.query(`
      CREATE TABLE oauth_pending_links (
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

    // 5. Re-create oauth_login_states table
    await connection.query(`
      CREATE TABLE oauth_login_states (
        id INT AUTO_INCREMENT PRIMARY KEY,
        state VARCHAR(128) NOT NULL UNIQUE,
        provider VARCHAR(32) NOT NULL DEFAULT 'google',
        consumed TINYINT(1) DEFAULT 0,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 6. Re-create enrollments table
    await connection.query(`
      CREATE TABLE enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_slug VARCHAR(128) NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_course (user_id, course_slug),
        CONSTRAINT fk_enrollments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ Schema created successfully (users, signup_otps, oauth_pending_links, oauth_login_states, enrollments).');

    // 7. Seed initial passwordless user data
    console.log('🌱 Seeding sample passwordless accounts and course enrollments...');
    const seedUsers = [
      {
        name: 'Demo Learner',
        username: 'demo',
        email: 'demo@rise.dev',
        auth_provider: 'email_otp',
        avatar_url: null,
      },
    ];

    for (const u of seedUsers) {
      const [res] = await connection.query(
        'INSERT INTO users (name, username, email, auth_provider, avatar_url, email_verified) VALUES (?, ?, ?, ?, ?, 1)',
        [u.name, u.username, u.email, u.auth_provider, u.avatar_url]
      );
      const userId = res.insertId;

      // Seed default course enrollments for test accounts
      await connection.query(
        'INSERT IGNORE INTO enrollments (user_id, course_slug) VALUES (?, ?), (?, ?)',
        [userId, 'python-for-it-pros', userId, 'full-stack-web-dev']
      );
    }

    console.log('✅ Seed data inserted successfully:');
    console.log('   👤 demo@rise.dev (Passwordless: Email OTP)');
    console.log('\n🎉 Database reset & seeding completed successfully!');
  } catch (err) {
    console.error('❌ Database seeding failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

seedDatabase();
