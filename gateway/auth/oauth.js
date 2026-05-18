module.exports = {
  authorize(req, res, next) {
    // Placeholder OAuth authorization flow
    req.user = { id: 'oauth-user', roles: ['user'] };
    next();
  },
};
