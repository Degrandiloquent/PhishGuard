module.exports = {
  execute(threat) {
    return {
      action: 'blockThreat',
      threat,
    };
  },
};
