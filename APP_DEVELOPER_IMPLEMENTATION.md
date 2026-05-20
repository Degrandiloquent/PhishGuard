# PhishGuard App Developer Implementation Guide

## ✅ Completed Deliverables

This document outlines all components **created and ready for implementation** as the App Developer for PhishGuard.

---

## 📦 Component 1: Browser Extension

### What It Does
- **Real-time Gmail/Outlook scanning** - Detects phishing emails as they arrive
- **Link analysis** - Warns users before clicking suspicious URLs
- **Threat alerts** - Visual notifications for detected threats
- **Whitelist management** - Save trusted senders

### Files Created
```
ingestion/browserExtension/
├── manifest.json                 # Chrome extension config
├── services/api.js              # API client for backend
├── background/backgroundScript.js # Core scanning logic
├── content/contentScript.js      # Gmail/Outlook integration
├── popup/popup.html              # Extension UI
├── popup/popup.js                # Popup functionality
└── utils/storage.js              # Local data management
```

### Setup & Installation

1. **Load Extension in Chrome:**
   ```bash
   # Navigate to chrome://extensions/
   # Enable "Developer mode"
   # Click "Load unpacked"
   # Select the browserExtension folder
   ```

2. **Features Implemented:**
   - ✅ User authentication (login/logout)
   - ✅ Real-time email scanning
   - ✅ Risk profile display
   - ✅ Alert history (last 10 alerts)
   - ✅ Link warning popups
   - ✅ Local data encryption
   - ✅ Offline support

3. **Key API Endpoints Used:**
   - `POST /ingestion/email` - Send email for analysis
   - `POST /threat/check-url` - Check URL safety
   - `POST /threat/report` - Report phishing
   - `GET /user/risk-profile` - Get user risk profile
   - `GET /alerts` - Fetch recent alerts

---

## 📦 Component 2: Email Plugin Manager

### What It Does
- **Gmail integration** - Scan emails in Gmail web interface
- **Outlook integration** - Scan emails in Outlook web interface
- **DOM observation** - Auto-detect new emails
- **Automatic banners** - Show warnings in email readers
- **Sender whitelist** - Trust specific senders
- **Report phishing** - Submit suspicious emails to backend

### Files Created
```
ingestion/emailPlugin/
└── manager.js  # Complete Gmail/Outlook plugin integration
```

### Implementation Example

```javascript
// In your email client plugin
import { EmailPluginManager } from './ingestion/emailPlugin/manager.js';

const plugin = new EmailPluginManager(authToken);

// Auto-scan Gmail
await plugin.initGmailPlugin();

// Auto-scan Outlook
await plugin.initOutlookPlugin();

// Report email as phishing
await plugin.reportAsPhishing({
  from: 'attacker@phishing.com',
  subject: 'Urgent Action Required',
  body: 'Click here...',
  links: ['http://malicious.com']
});

// Whitelist trusted sender
await plugin.whitelistSender('boss@company.com');
```

### Features
- ✅ Real-time DOM monitoring
- ✅ Automatic message extraction
- ✅ Threat highlighting with banners
- ✅ Sender whitelist functionality
- ✅ Link safety checking
- ✅ Phishing report submission
- ✅ Safe link proxy handling (Gmail/Outlook)

---

## 📦 Component 3: Mobile SDK

### What It Does
- **Cross-platform SDK** - Works with React Native, Flutter, Native apps
- **Email scanning API** - Analyze emails for threats
- **URL checking** - Real-time link safety checks
- **File scanning** - Detect malware in attachments
- **Risk profiling** - Get user security status
- **Real-time alerts** - WebSocket stream for live threats
- **Offline support** - Local caching for offline mode

### Files Created
```
ingestion/SDK/
└── PhishGuardSDK.js  # Complete mobile SDK implementation
```

### Installation in React Native

```bash
npm install phishguard-sdk
# or
yarn add phishguard-sdk
```

### Usage Example

```javascript
import PhishGuardSDK from 'phishguard-sdk';

// Initialize SDK
const sdk = new PhishGuardSDK('YOUR_API_KEY');
await sdk.initialize();

// Scan email
const emailResult = await sdk.scanEmail({
  from: 'sender@example.com',
  subject: 'Check this out',
  body: 'Click here for details...',
  links: ['https://example.com/details']
});

if (emailResult.flagged) {
  Alert.alert('⚠️ Warning', `Phishing detected: ${emailResult.reasons[0]}`);
}

// Check URL
const urlResult = await sdk.checkURL('https://suspicious-site.com');

// Get user risk profile
const profile = await sdk.getRiskProfile();
console.log(`Current Risk Score: ${profile.riskScore}/100`);

// Get recent alerts
const alerts = await sdk.getAlerts(10);

// Report threat
await sdk.reportThreat({
  type: 'phishing',
  email: 'attacker@phishing.com',
  reason: 'Fake login page'
});

// Real-time threat updates
const ws = sdk.connectThreatStream((threat) => {
  console.log('New threat detected:', threat);
});
```

### Features Implemented
- ✅ Async/await API calls
- ✅ Local caching for offline access
- ✅ Request timeout handling
- ✅ File upload for scanning
- ✅ WebSocket threat streaming
- ✅ Batch threat reporting
- ✅ Risk calculation engine
- ✅ Offline mode fallback

---

## 📦 Component 4: API Client Services

### Browser Extension API Client
**File:** `ingestion/browserExtension/services/api.js`

Provides methods:
- `scanEmail(emailData)` - Send email for analysis
- `checkLink(url)` - Check URL safety
- `checkAttachment(file)` - Scan file for malware
- `reportPhishing(report)` - Submit phishing report
- `login(email, password)` - User authentication
- `getRiskProfile()` - Get user risk profile
- `getAlerts(limit)` - Fetch recent alerts
- `dismissAlert(alertId)` - Mark alert as seen

---

## 🚀 Quick Start Checklist

### 1. Browser Extension Setup
- [ ] Copy `browserExtension` folder to your project
- [ ] Create `icons/` folder with 16x16, 48x48, 128x128 PNG icons
- [ ] Update `manifest.json` with your backend URL in API client
- [ ] Load in `chrome://extensions/` as unpacked extension
- [ ] Test with Gmail/Outlook

### 2. Email Plugin Setup
- [ ] Import `EmailPluginManager` from `emailPlugin/manager.js`
- [ ] Call `initGmailPlugin()` for Gmail support
- [ ] Call `initOutlookPlugin()` for Outlook support
- [ ] Test email scanning and warnings

### 3. Mobile SDK Setup
- [ ] Copy `SDK/PhishGuardSDK.js` to your mobile project
- [ ] Initialize SDK with API key
- [ ] Integrate email scanning in compose screens
- [ ] Add URL checking before navigation
- [ ] Display alerts with `Alert.alert()`

### 4. Backend Configuration
- [ ] Ensure backend is running on configured URL
- [ ] Create `/ingestion/email` endpoint
- [ ] Create `/threat/check-url` endpoint
- [ ] Create `/threat/scan-file` endpoint
- [ ] Create `/threat/report` endpoint
- [ ] Create `/user/risk-profile` endpoint
- [ ] Create `/alerts` endpoint

---

## 🔧 Environment Configuration

### Browser Extension `.env`
```env
REACT_APP_API_URL=http://localhost:4000/api
```

### Mobile App `.env`
```env
REACT_APP_API_URL=http://localhost:4000/api
API_KEY=your_sdk_key_here
```

---

## 🧪 Testing Deliverables

### 1. Browser Extension Testing
```javascript
// Manual Test: Email Scanning
1. Open Gmail/Outlook
2. Create test email with suspicious link
3. Verify orange warning banner appears
4. Click link to see warning popup
5. Check extension popup for alerts
```

### 2. Mobile SDK Testing
```javascript
// Automated Test Example
const sdk = new PhishGuardSDK('test_key');
await sdk.initialize();

const result = await sdk.scanEmail({
  from: 'test@phishing.com',
  subject: 'Test',
  body: 'Click here',
  links: ['http://malicious.com']
});

console.assert(result.flagged === true, 'Should flag phishing');
```

### 3. API Integration Testing
```bash
# Test email scanning endpoint
curl -X POST http://localhost:4000/api/ingestion/email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "sender@example.com",
    "subject": "Test",
    "body": "Click here",
    "links": ["http://example.com"]
  }'
```

---

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│           USER INTERFACES (App Developer)            │
├─────────────────────────────────────────────────────┤
│  Browser Extension  │  Mobile App  │  Email Plugin   │
│  (Chrome/Firefox)   │  (iOS/Android)│ (Gmail/Outlook) │
├─────────────────────────────────────────────────────┤
│              API CLIENT LAYER                       │
│  API.js  │  PhishGuardSDK.js  │  EmailPluginManager │
├─────────────────────────────────────────────────────┤
│              BACKEND API LAYER                      │
│  /ingestion/email  │  /threat/check-url             │
│  /threat/report    │  /user/risk-profile            │
│  /alerts           │  /threat/scan-file             │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Your Responsibilities (App Developer)

✅ **COMPLETED & PROVIDED:**
1. Browser extension scaffold with popup UI
2. Email plugin manager for Gmail/Outlook integration
3. Mobile SDK with all threat detection APIs
4. Background scripts for real-time scanning
5. Content scripts for DOM manipulation
6. Storage utilities for local data
7. API clients for all endpoints
8. Authentication flows
9. Alert management
10. Risk profile display

⏳ **YOU NEED TO:**
1. Customize icons and branding
2. Deploy extension to Chrome Web Store
3. Build mobile app UI (screens, navigation)
4. Integrate SDK into mobile app
5. Handle platform-specific permissions
6. Test on real devices
7. Submit to app stores
8. Gather user feedback
9. Iterate based on security team's feedback
10. Monitor performance and optimize

---

## 📞 Integration Support

### Backend Requirements
Ensure your backend team has created these endpoints:
- POST `/ingestion/email` - Analyzes email content
- POST `/threat/check-url` - Checks URL reputation
- POST `/threat/scan-file` - Analyzes file attachments
- POST `/threat/report` - Accepts user reports
- GET `/user/risk-profile` - Returns user risk metrics
- GET `/alerts` - Returns recent security alerts
- POST `/auth/login` - User authentication
- POST `/auth/sdk-init` - SDK initialization

### AI Engine Integration
The SDK expects responses in format:
```javascript
{
  flagged: boolean,           // Is threat detected?
  score: 0-100,              // Risk score
  confidence: 0-1,           // Confidence level
  reasons: [string],         // Why it was flagged
  details: {                 // Additional details
    threat_type: string,
    risk_level: string,
    indicators: [string]
  }
}
```

---

## ✨ Next Steps

1. **Test Browser Extension**
   - Load in Chrome
   - Login with test account
   - Verify Gmail/Outlook scanning

2. **Build Mobile App UI**
   - Create authentication screens
   - Build alert dashboard
   - Add settings screen

3. **Integrate Mobile SDK**
   - Import PhishGuardSDK
   - Setup email scanning
   - Add real-time alerts

4. **Test on Devices**
   - iOS simulator/device
   - Android emulator/device
   - Test with real email accounts

5. **Deploy & Monitor**
   - Submit extension to Web Store
   - Build and submit mobile apps
   - Monitor user feedback
   - Optimize based on metrics

---

**Status:** ✅ All App Developer components complete and ready for integration!

**Questions?** Refer to the individual component documentation in each folder or consult with the Technical Product Lead.
