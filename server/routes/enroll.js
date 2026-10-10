// server/routes/enroll.js
const express = require('express');
const router  = express.Router();
const db      = require('../config/db');
const auth    = require('../middleware/auth');

/**
 * POST /api/enroll
 * Enroll the authenticated user in a course.
 * Body: { courseSlug: string }
 * Ignores duplicate enrolments (INSERT IGNORE).
 */
router.post('/', auth, async (req, res) => {
  const { courseSlug } = req.body;
  if (!courseSlug) {
    return res.status(400).json({ message: 'courseSlug is required.' });
  }
  try {
    await db.execute(
      'INSERT IGNORE INTO enrollments (user_id, course_slug) VALUES (?, ?)',
      [req.user.id, courseSlug]
    );
    res.status(200).json({ enrolled: true, courseSlug });
  } catch (err) {
    console.error('Enroll error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

/**
 * GET /api/enroll/me
 * Returns the list of course slugs the authenticated user is enrolled in.
 */
router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT course_slug FROM enrollments WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ courses: rows.map((r) => r.course_slug) });
  } catch (err) {
    console.error('Enroll/me error:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
