const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const browserExtensionAPI = {
  scanEmail: (emailData) => 
    fetch(`${API_BASE}/ingestion/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        from: emailData.from,
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.body,
        links: emailData.links,
        attachments: emailData.attachments,
        source: 'browser_extension'
      })
    }).then(r => r.json()),

  checkLink: (url) =>
    fetch(`${API_BASE}/threat/check-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ url })
    }).then(r => r.json()),

  checkAttachment: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE}/threat/check-file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      body: formData
    }).then(r => r.json());
  },

  reportPhishing: (report) =>
    fetch(`${API_BASE}/threat/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        type: 'phishing',
        ...report,
        source: 'browser_extension'
      })
    }).then(r => r.json()),

  login: (email, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(r => r.json()),

  getRiskProfile: () =>
    fetch(`${API_BASE}/user/risk-profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    }).then(r => r.json()),

  getAlerts: (limit = 10) =>
    fetch(`${API_BASE}/alerts?limit=${limit}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    }).then(r => r.json()),

  dismissAlert: (alertId) =>
    fetch(`${API_BASE}/alerts/${alertId}/dismiss`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${authToken}` }
    }).then(r => r.json())
};
