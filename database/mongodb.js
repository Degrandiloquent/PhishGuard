const { MONGODB_URI } = require('../config/env');

module.exports = {
  connect() {
    return Promise.resolve(`Connected to MongoDB at ${MONGODB_URI}`);
  },
};
