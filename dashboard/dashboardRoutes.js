const express = require('express');
const router = express.Router();

router.get('/alerts', (req, res) => {
  res.json({ message: 'Dashboard alerts endpoint' });
});

router.get('/analytics', (req, res) => {
  res.json({ message: 'Dashboard analytics endpoint' });
});

router.get('/user-risk', (req, res) => {
  res.json({ message: 'User risk dashboard endpoint' });
});

module.exports = router;
