module.exports = {
  calculateScore(inputs) {
    return {
      overallRisk: 15,
      categoryScores: {
        email: 5,
        url: 5,
        attachment: 5,
      },
    };
  },
};
