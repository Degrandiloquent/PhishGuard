module.exports = {
  evaluateUser(user) {
    return {
      userId: user.id || null,
      riskLevel: 'low',
      recommendations: [],
    };
  },
};
