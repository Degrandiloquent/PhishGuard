const credentialRisk = require('./credentialRisk');
const fraudRisk = require('./fraudRisk');
const insiderThreat = require('./insiderThreat');

module.exports = {
  evaluate(context) {
    return {
      credentialRisk: credentialRisk.assess(context.credentials),
      fraudRisk: fraudRisk.assess(context.activity),
      insiderThreat: insiderThreat.assess(context.userActivity),
    };
  },
};
