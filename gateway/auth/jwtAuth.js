const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/env');

module.exports = {
  signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  },
  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  },
};
