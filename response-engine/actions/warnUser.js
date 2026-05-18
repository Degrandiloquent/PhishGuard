module.exports = {
  execute(user, details) {
    return {
      action: 'warnUser',
      user,
      details,
    };
  },
};
