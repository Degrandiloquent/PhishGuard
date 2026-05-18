module.exports = {
  execute(sessionId) {
    return {
      action: 'isolateSession',
      sessionId,
    };
  },
};
