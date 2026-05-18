// Copy this file to securityConfig.js and customize for your environment
module.exports = {
  passwordPolicy: {
    minLength: 12,
    requireNumbers: true,
    requireSymbols: true,
    requireUppercase: true,
    requireLowercase: true,
  },
  cors: {
    origin: ['http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
  jwt: {
    expiresIn: '1h',
  },
};
