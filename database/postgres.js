const { POSTGRES_URL } = require('../config/env');

module.exports = {
  connect() {
    return Promise.resolve(`Connected to Postgres at ${POSTGRES_URL}`);
  },
};
