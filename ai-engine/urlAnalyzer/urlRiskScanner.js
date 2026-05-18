module.exports = {
  scan(url) {
    return {
      url,
      riskScore: 12,
      warnings: [],
    };
  },
};
