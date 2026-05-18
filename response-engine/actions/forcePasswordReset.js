module.exports = {
  execute(userId) {
    return {
      action: 'forcePasswordReset',
      userId,
    };
  },
};
