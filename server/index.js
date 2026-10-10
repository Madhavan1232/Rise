const express = require('express');
const cors    = require('cors');
require('dotenv').config();
const db = require('./config/db');

const enrollRouter = require('./routes/enroll');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Minimal health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Enrollment routes
app.use('/api/enroll', enrollRouter);

// Start server and verify DB connection
const startServer = async () => {
  try {
    const connection = await db.getConnection();
    console.log('✅ Database connected successfully');
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
