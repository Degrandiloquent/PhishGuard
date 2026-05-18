module.exports = {
  getUserRisk(userId) {
    return { userId, riskLevel: 'low', recommendations: [] };
  },
};
