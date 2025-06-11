const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const router = express.Router();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true
  }
});

router.post('/login', async (req, res) => {
  try {
    console.log('Login request:', req.body);
    const { student_code_no, password } = req.body;
    if (!student_code_no || !password) {
      return res.status(400).json({ error: 'Student Code No and password required' });
    }

    const [rows] = await pool.query('SELECT * FROM students WHERE student_code_no = ?', [student_code_no]);
    console.log('Query result:', rows);
    if (!rows.length) {
      return res.status(400).json({ error: 'Invalid Student Code No' });
    }

    const student = rows[0];
    const isMatch = await bcrypt.compare(password, student.password);
    console.log('Password match:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: student.student_id, type: 'student' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, student: { id: student.student_id, name: student.name, student_code_no: student.student_code_no } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

router.post('/teacher/login', async (req, res) => {
  try {
    console.log('Teacher login request:', req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const [rows] = await pool.query('SELECT * FROM teachers WHERE email = ?', [email]);
    console.log('Teacher query result:', rows);
    if (!rows.length) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    const teacher = rows[0];
    const isMatch = await bcrypt.compare(password, teacher.password);
    console.log('Teacher password match:', isMatch);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: teacher.teacher_id, type: 'teacher' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, teacher: { id: teacher.teacher_id, name: teacher.name, email: teacher.email } });
  } catch (err) {
    console.error('Teacher login error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;