const express = require('express');
const cors    = require('cors');
require('dotenv').config({ override: true });
const db = require('./config/db');

const authRouter   = require('./routes/auth');
const enrollRouter = require('./routes/enroll');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Minimal health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Auth & Enrollment routes
app.use('/api/auth', authRouter);
app.use('/api/enroll', enrollRouter);

// Start server and verify DB connection
const startServer = async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Database connected successfully');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NULL,
        auth_provider VARCHAR(32) DEFAULT 'local',
        avatar_url VARCHAR(512) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    try { await connection.execute('ALTER TABLE users MODIFY COLUMN password_hash VARCHAR(255) NULL'); } catch (_) {}
    try { await connection.execute("ALTER TABLE users ADD COLUMN auth_provider VARCHAR(32) DEFAULT 'local'"); } catch (_) {}
    try { await connection.execute('ALTER TABLE users ADD COLUMN avatar_url VARCHAR(512) NULL'); } catch (_) {}
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS signup_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        attempts INT DEFAULT 0,
        last_sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        course_slug VARCHAR(128) NOT NULL,
        enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_user_course (user_id, course_slug)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    connection.release();
  } catch (err) {
    console.error('❌ Database connection failed on startup:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
  });
};

startServer();
