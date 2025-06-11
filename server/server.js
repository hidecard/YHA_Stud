const express = require('express');
const cors = require('cors');
const authRoutes = require('./api/routes/auth');
const examRoutes = require('./api/routes/exams');
const assignmentRoutes = require('./api/routes/assignments');
const approvalRoutes = require('./api/routes/approvals');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/approvals', approvalRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;