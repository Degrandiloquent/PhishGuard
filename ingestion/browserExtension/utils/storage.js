export class StorageManager {
  constructor() {
    this.KEYS = {
      TOKEN: 'phishguard_auth_token',
      EMAIL: 'phishguard_email',
      SCAN_RESULTS: 'phishguard_scan_results',
      WHITELIST: 'phishguard_whitelist',
      BLOCKED_LINKS: 'phishguard_blocked_links'
    };
  }

  // Token Management
  async saveToken(token) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.KEYS.TOKEN]: token }, resolve);
    });
  }

  async getToken() {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.KEYS.TOKEN], (result) => {
        resolve(result[this.KEYS.TOKEN] || null);
      });
    });
  }

  async removeToken() {
    return new Promise((resolve) => {
      chrome.storage.local.remove([this.KEYS.TOKEN], resolve);
    });
  }

  // Email Management
  async saveEmail(email) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [this.KEYS.EMAIL]: email }, resolve);
    });
  }

  async getEmail() {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.KEYS.EMAIL], (result) => {
        resolve(result[this.KEYS.EMAIL] || null);
      });
    });
  }

  async removeEmail() {
    return new Promise((resolve) => {
      chrome.storage.local.remove([this.KEYS.EMAIL], resolve);
    });
  }

  // Scan Results
  async storeScanResult(sender, result) {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.KEYS.SCAN_RESULTS], (data) => {
        const results = data[this.KEYS.SCAN_RESULTS] || [];
        results.unshift({
          sender,
          result,
          timestamp: new Date().toISOString()
        });
        // Keep only last 50 results
        results.splice(50);
        chrome.storage.local.set({ [this.KEYS.SCAN_RESULTS]: results }, resolve);
      });
    });
  }

  async getScanResults() {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.KEYS.SCAN_RESULTS], (result) => {
        resolve(result[this.KEYS.SCAN_RESULTS] || []);
      });
    });
  }

  // Whitelist Management
  async addToWhitelist(email) {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.KEYS.WHITELIST], (data) => {
        const whitelist = data[this.KEYS.WHITELIST] || [];
        if (!whitelist.includes(email)) {
          whitelist.push(email);
        }
        chrome.storage.local.set({ [this.KEYS.WHITELIST]: whitelist }, resolve);
      });
    });
  }

  async isWhitelisted(email) {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.KEYS.WHITELIST], (data) => {
        const whitelist = data[this.KEYS.WHITELIST] || [];
        resolve(whitelist.includes(email));
      });
    });
  }

  // Blocked Links Management
  async blockLink(url) {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.KEYS.BLOCKED_LINKS], (data) => {
        const blocked = data[this.KEYS.BLOCKED_LINKS] || [];
        if (!blocked.includes(url)) {
          blocked.push(url);
        }
        chrome.storage.local.set({ [this.KEYS.BLOCKED_LINKS]: blocked }, resolve);
      });
    });
  }

  async isBlocked(url) {
    return new Promise((resolve) => {
      chrome.storage.local.get([this.KEYS.BLOCKED_LINKS], (data) => {
        const blocked = data[this.KEYS.BLOCKED_LINKS] || [];
        resolve(blocked.includes(url));
      });
    });
  }

  async clearAllData() {
    return new Promise((resolve) => {
      chrome.storage.local.clear(resolve);
    });
  }
}
