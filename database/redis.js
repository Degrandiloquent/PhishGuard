const { REDIS_URL } = require('../config/env');

module.exports = {
  connect() {
    return Promise.resolve(`Connected to Redis at ${REDIS_URL}`);
  },
};
