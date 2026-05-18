const crypto = require('crypto');

module.exports = {
  hash(value) {
    return crypto.createHash('sha256').update(value).digest('hex');
  },
};
