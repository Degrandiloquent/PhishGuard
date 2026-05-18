const express = require('express');
const router = express.Router();

router.post('/browser', (req, res) => {
  res.json({ message: 'Browser extension ingestion received', payload: req.body });
});

router.post('/email', (req, res) => {
  res.json({ message: 'Email plugin ingestion received', payload: req.body });
});

router.post('/file', (req, res) => {
  res.json({ message: 'File scanner ingestion received', payload: req.body });
});

module.exports = router;
