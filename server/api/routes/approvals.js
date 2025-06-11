const express = require('express');
const mysql = require('mysql2/promise');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

router.post('/approve', authMiddleware, async (req, res) => {
  if (req.user.type !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  const { studentId, subjectId } = req.body;
  try {
    await pool.query(`
      INSERT INTO exam_permissions (student_id, subject_id, teacher_id)
      VALUES (?, ?, ?)
    `, [studentId, subjectId, req.user.id]);
    res.json({ message: 'Exam access approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/students', authMiddleware, async (req, res) => {
  if (req.user.type !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  try {
    const [rows] = await pool.query('SELECT student_id, name, student_code_no FROM students');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/subjects', authMiddleware, async (req, res) => {
  if (req.user.type !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  try {
    const [rows] = await pool.query('SELECT subject_id, subject_name FROM subjects');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;