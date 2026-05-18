const { calculateScore } = require('../ai-engine/riskScoring/calculateRisk');

module.exports = {
  decide(context) {
    const risk = calculateScore(context);
    return {
      decision: risk.overallRisk > 20 ? 'escalate' : 'monitor',
      risk,
    };
  },
};
