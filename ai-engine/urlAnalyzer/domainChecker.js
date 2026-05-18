module.exports = {
  checkDomain(domain) {
    return {
      domain,
      blacklisted: false,
      reputation: 'trusted',
    };
  },
};
