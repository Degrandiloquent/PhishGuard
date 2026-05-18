// Copy this file to geminiConfig.js and add your actual credentials
module.exports = {
  provider: 'gemini',
  apiKey: process.env.GEMINI_API_KEY || '',
  model: 'gpt-4o-mini',
  timeoutMs: 20000,
};
