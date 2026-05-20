import { browserExtensionAPI, setAuthToken } from './services/api.js';
import { StorageManager } from './utils/storage.js';

const storage = new StorageManager();

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender, sendResponse);
  return true; // Will respond asynchronously
});

async function handleMessage(message, sender, sendResponse) {
  const token = await storage.getToken();
  if (token) {
    setAuthToken(token);
  }

  try {
    switch (message.type) {
      case 'SCAN_EMAIL':
        await scanEmail(message.data, sender, sendResponse);
        break;
      case 'CHECK_LINK':
        await checkLink(message.url, sendResponse);
        break;
      case 'REPORT_PHISHING':
        await reportPhishing(message.data, sendResponse);
        break;
      case 'GET_ALERTS':
        await getAlerts(sendResponse);
        break;
      case 'LOGIN':
        await login(message.email, message.password, sendResponse);
        break;
      default:
        sendResponse({ error: 'Unknown message type' });
    }
  } catch (error) {
    console.error('Error handling message:', error);
    sendResponse({ error: error.message });
  }
}

async function scanEmail(emailData, sender, sendResponse) {
  try {
    console.log('Scanning email from:', emailData.from);
    
    // Extract links from email body
    const links = extractLinks(emailData.body);
    emailData.links = links;

    const result = await browserExtensionAPI.scanEmail(emailData);
    
    // Store scan result
    await storage.storeScanResult(emailData.from, result);

    // If flagged, notify user
    if (result.flagged) {
      notifyThreat(result, sender.tab.id);
    }

    sendResponse({ success: true, result });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

async function checkLink(url, sendResponse) {
  try {
    console.log('Checking link:', url);
    const result = await browserExtensionAPI.checkLink(url);

    if (result.flagged) {
      // Alert user immediately
      chrome.tabs.query({ active: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'SHOW_WARNING',
          url,
          reason: result.reasons[0]
        });
      });
    }

    sendResponse({ success: true, result });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

async function reportPhishing(reportData, sendResponse) {
  try {
    const result = await browserExtensionAPI.reportPhishing(reportData);
    sendResponse({ success: true, result });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

async function getAlerts(sendResponse) {
  try {
    const alerts = await browserExtensionAPI.getAlerts(10);
    sendResponse({ success: true, alerts });
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

async function login(email, password, sendResponse) {
  try {
    const result = await browserExtensionAPI.login(email, password);
    
    if (result.token) {
      await storage.saveToken(result.token);
      setAuthToken(result.token);
      sendResponse({ success: true, token: result.token });
    } else {
      sendResponse({ error: result.error || 'Login failed' });
    }
  } catch (error) {
    sendResponse({ error: error.message });
  }
}

function notifyThreat(result, tabId) {
  const message = {
    type: 'SHOW_ALERT',
    title: '⚠️ Phishing Alert',
    reason: result.reasons[0],
    severity: result.score > 80 ? 'critical' : result.score > 60 ? 'high' : 'medium'
  };

  chrome.tabs.sendMessage(tabId, message).catch(() => {
    // Tab may not have content script loaded
  });
}

function extractLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return (text.match(urlRegex) || []).slice(0, 10); // Limit to 10 links
}

// Listen for tab updates to auto-scan Gmail/Outlook
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    if (tab.url.includes('gmail.com') || tab.url.includes('outlook.com')) {
      chrome.tabs.sendMessage(tabId, { type: 'INJECT_SCANNER' }).catch(() => {
        // Extension may not have content script on this page
      });
    }
  }
});

// Auto-remove token on logout
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.authToken && !changes.authToken.newValue) {
    setAuthToken(null);
  }
});
