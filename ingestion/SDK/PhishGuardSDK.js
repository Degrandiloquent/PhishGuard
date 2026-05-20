/**
 * PhishGuard Mobile SDK
 * React Native / Flutter / Native implementation
 * Provides threat detection APIs for mobile apps
 */

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export class PhishGuardSDK {
  constructor(apiKey, options = {}) {
    this.apiKey = apiKey;
    this.token = null;
    this.baseURL = options.baseURL || API_BASE;
    this.timeout = options.timeout || 10000;
    this.offlineMode = false;
    this.localCache = {};
  }

  /**
   * Initialize SDK - authenticate with API key
   */
  async initialize() {
    try {
      const response = await this.request('/auth/sdk-init', {
        method: 'POST',
        headers: { 'X-API-Key': this.apiKey }
      });

      this.token = response.token;
      return { success: true, token: this.token };
    } catch (error) {
      console.error('SDK initialization failed:', error);
      this.offlineMode = true;
      return { success: false, error: error.message, offlineMode: true };
    }
  }

  /**
   * Make authenticated HTTP request
   */
  async request(endpoint, options = {}) {
    const url = this.baseURL + endpoint;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      ...options.headers
    };

    try {
      const response = await fetch(url, {
        timeout: this.timeout,
        ...options,
        headers
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (this.offlineMode) {
        return this.getOfflineData(endpoint);
      }
      throw error;
    }
  }

  /**
   * Scan email for phishing threats
   * @param {Object} emailData - {from, subject, body, links, attachments}
   * @returns {Object} - {flagged, score, reasons, confidence}
   */
  async scanEmail(emailData) {
    try {
      const result = await this.request('/threat/scan-email', {
        method: 'POST',
        body: JSON.stringify({
          from: emailData.from,
          subject: emailData.subject,
          body: emailData.body?.substring(0, 10000),
          links: emailData.links?.slice(0, 20),
          attachments: emailData.attachments || [],
          source: 'mobile_sdk'
        })
      });

      // Cache result for offline access
      this.cacheResult(`email:${emailData.from}`, result);

      return result;
    } catch (error) {
      console.error('Email scan failed:', error);
      throw error;
    }
  }

  /**
   * Check if a URL is malicious
   * @param {string} url - URL to check
   * @returns {Object} - {flagged, score, reason, reputation}
   */
  async checkURL(url) {
    try {
      // Check cache first
      const cached = this.getCache(`url:${url}`);
      if (cached) return cached;

      const result = await this.request('/threat/check-url', {
        method: 'POST',
        body: JSON.stringify({ url })
      });

      this.cacheResult(`url:${url}`, result, 3600); // Cache for 1 hour

      return result;
    } catch (error) {
      console.error('URL check failed:', error);
      throw error;
    }
  }

  /**
   * Scan attachment/file for malware
   * @param {File|Blob} file - File to scan
   * @returns {Object} - {flagged, fileType, threats, score}
   */
  async scanAttachment(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(this.baseURL + '/threat/scan-file', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.token}` },
        body: formData,
        timeout: this.timeout
      });

      if (!response.ok) {
        throw new Error(`File scan failed: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('File scan failed:', error);
      throw error;
    }
  }

  /**
   * Get user risk profile
   * @returns {Object} - {riskScore, incidents, alerts, lastUpdated}
   */
  async getRiskProfile() {
    try {
      const result = await this.request('/user/risk-profile');
      this.cacheResult('risk:profile', result, 300); // Cache for 5 minutes
      return result;
    } catch (error) {
      console.error('Failed to get risk profile:', error);
      throw error;
    }
  }

  /**
   * Get recent security alerts
   * @param {number} limit - Number of alerts to return
   * @returns {Array} - Array of alerts
   */
  async getAlerts(limit = 10) {
    try {
      const alerts = await this.request(`/alerts?limit=${limit}`);
      this.cacheResult(`alerts:list:${limit}`, alerts, 60); // Cache for 1 minute
      return alerts;
    } catch (error) {
      console.error('Failed to get alerts:', error);
      return [];
    }
  }

  /**
   * Report suspicious email/content
   * @param {Object} report - {type, url, email, reason}
   * @returns {Object} - {success, reportId}
   */
  async reportThreat(report) {
    try {
      const result = await this.request('/threat/report', {
        method: 'POST',
        body: JSON.stringify({
          ...report,
          source: 'mobile_sdk',
          timestamp: new Date().toISOString()
        })
      });

      return result;
    } catch (error) {
      console.error('Failed to report threat:', error);
      throw error;
    }
  }

  /**
   * Get real-time risk score for specific indicators
   * @param {Array} indicators - [{type, value}]
   * @returns {Object} - {riskScore, flagged, indicators}
   */
  async calculateRisk(indicators) {
    try {
      const result = await this.request('/threat/calculate-risk', {
        method: 'POST',
        body: JSON.stringify({ indicators })
      });

      return result;
    } catch (error) {
      console.error('Risk calculation failed:', error);
      throw error;
    }
  }

  /**
   * Real-time threat stream for live updates
   * @param {Function} onThreat - Callback for threats
   * @returns {WebSocket} - Connection instance
   */
  connectThreatStream(onThreat) {
    const wsURL = this.baseURL.replace(/^http/, 'ws') + '/threat/stream';
    
    const ws = new WebSocket(wsURL);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({ token: this.token }));
    };

    ws.onmessage = (event) => {
      const threat = JSON.parse(event.data);
      onThreat(threat);
    };

    ws.onerror = (error) => {
      console.error('Threat stream error:', error);
    };

    return ws;
  }

  /**
   * Local caching utilities
   */
  cacheResult(key, data, ttl = 3600) {
    this.localCache[key] = {
      data,
      expiry: Date.now() + ttl * 1000
    };
  }

  getCache(key) {
    const cached = this.localCache[key];
    if (!cached) return null;

    if (cached.expiry < Date.now()) {
      delete this.localCache[key];
      return null;
    }

    return cached.data;
  }

  /**
   * Offline fallback data
   */
  getOfflineData(endpoint) {
    const offlineData = {
      '/user/risk-profile': {
        score: 0,
        incidents: 0,
        alerts: [],
        lastUpdated: new Date().toISOString()
      },
      '/alerts': []
    };

    return offlineData[endpoint] || { error: 'Offline - data unavailable' };
  }

  /**
   * Enable offline mode
   */
  setOfflineMode(enabled) {
    this.offlineMode = enabled;
  }

  /**
   * Clear all local cache
   */
  clearCache() {
    this.localCache = {};
  }

  /**
   * Logout and clear credentials
   */
  logout() {
    this.token = null;
    this.localCache = {};
  }
}

// Export for use in React Native / Native apps
export default PhishGuardSDK;
