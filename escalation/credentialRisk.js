module.exports = {
  assess(credentials) {
    return {
      score: 10,
      issue: 'password reuse',
    };
  },
};
