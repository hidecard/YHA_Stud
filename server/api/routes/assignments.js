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
  database: process.env.DB_NAME
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

const upload = multer({ dest: '/tmp/uploads' });

router.get('/list', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.assignment_id, a.title, a.description, a.due_date, s.subject_name
      FROM assignments a
      JOIN subjects s ON a.subject_id = s.subject_id
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/submit/:assignmentId', authMiddleware, upload.single('file'), async (req, res) => {
  const { assignmentId } = req.params;
  let filePath = null;

  try {
    if (req.file) {
      const fileContent = require('fs').readFileSync(req.file.path);
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: `assignment-submissions/${Date.now()}-${req.file.originalname}`,
        Body: fileContent
      };
      const command = new PutObjectCommand(params);
      const result = await s3Client.send(command);
      filePath = `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
    }

    await pool.query(`
      INSERT INTO assignment_submissions (assignment_id, student_id, file_path)
      VALUES (?, ?, ?)
    `, [assignmentId, req.user.id, filePath]);
    res.json({ message: 'Assignment submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;