const express = require('express');
const mysql = require('mysql2/promise');
const authMiddleware = require('../middleware/auth');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
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

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

const upload = multer({ dest: '/tmp/uploads' });

router.get('/allowed', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.subject_id, s.subject_name
      FROM exam_permissions ep
      JOIN subjects s ON ep.subject_id = s.subject_id
      WHERE ep.student_id = ?
    `, [req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/questions/:subjectId', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT question_id, question_text, question_type, pdf_path
      FROM exam_questions
      WHERE subject_id = ?
    `, [req.params.subjectId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/submit/:questionId', authMiddleware, upload.single('file'), async (req, res) => {
  const { questionId } = req.params;
  const { answerText, subjectId } = req.body;
  let filePath = null;

  try {
    if (req.file) {
      const fileContent = require('fs').readFileSync(req.file.path);
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: `exam-submissions/${Date.now()}-${req.file.originalname}`,
        Body: fileContent
      };
      const command = new PutObjectCommand(params);
      const result = await s3Client.send(command);
      filePath = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    }

    await pool.query(`
      INSERT INTO exam_submissions (student_id, question_id, subject_id, answer_text, file_path)
      VALUES (?, ?, ?, ?, ?)
    `, [req.user.id, questionId, subjectId, answerText, filePath]);
    res.json({ message: 'Exam submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;