# 🚀 App Developer Quick Setup Guide

## What You've Just Received

You've been provided with **complete, production-ready code** for all App Developer deliverables:

1. ✅ **Browser Extension** - Real-time Gmail/Outlook scanning
2. ✅ **Email Plugin Manager** - Automatic email threat detection  
3. ✅ **Mobile SDK** - Cross-platform threat detection library
4. ✅ **React Native Example** - Full mobile app implementation
5. ✅ **API Clients** - Backend integration ready

---

## 📂 File Structure

```
PhishGuard/
├── ingestion/
│   ├── browserExtension/
│   │   ├── manifest.json                    # Chrome extension config
│   │   ├── package.json                     # Dependencies
│   │   ├── services/api.js                  # Backend API client
│   │   ├── background/backgroundScript.js   # Core logic
│   │   ├── content/contentScript.js         # Gmail/Outlook injection
│   │   ├── popup/                           # Extension UI
│   │   │   ├── popup.html
│   │   │   └── popup.js
│   │   └── utils/storage.js                 # Local storage
│   │
│   ├── emailPlugin/
│   │   └── manager.js                       # Gmail/Outlook integration
│   │
│   ├── SDK/
│   │   └── PhishGuardSDK.js                 # Mobile SDK
│   │
│   └── mobileApp/
│       └── screens/
│           └── HomeScreen.jsx               # React Native example
│
└── APP_DEVELOPER_IMPLEMENTATION.md          # Complete guide
```

---

## ⚡ 5-Minute Quick Start

### 1. Browser Extension (Testing in 2 minutes)

```bash
# Step 1: Copy the browserExtension folder to your project
cp -r ingestion/browserExtension ./my-phishguard-extension

# Step 2: Update API URL in services/api.js
# Change: const API_BASE = 'http://localhost:4000/api'

# Step 3: Load in Chrome
# - Go to chrome://extensions/
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select the browserExtension folder

# Step 4: Open Gmail/Outlook and login
```

**✅ Your extension is now running!**

### 2. Mobile SDK (Testing in 3 minutes)

```javascript
// Step 1: Import SDK
import PhishGuardSDK from './ingestion/SDK/PhishGuardSDK';

// Step 2: Initialize
const sdk = new PhishGuardSDK('YOUR_API_KEY');
await sdk.initialize();

// Step 3: Use it
const result = await sdk.scanEmail({
  from: 'sender@example.com',
  subject: 'Check this',
  body: 'Click here',
  links: ['http://example.com']
});

if (result.flagged) {
  console.log('⚠️ Threat detected!', result.reasons);
}
```

---

## 🔧 Detailed Setup Instructions

### Browser Extension Setup

**Prerequisites:**
- Chrome/Firefox browser
- Backend running on http://localhost:4000
- Node.js (optional, for development)

**Installation:**

1. **Copy files:**
   ```bash
   cp -r ingestion/browserExtension ./src/extensions/phishguard
   ```

2. **Create `.env` file:**
   ```env
   REACT_APP_API_URL=http://localhost:4000/api
   ```

3. **Create icons folder:**
   ```bash
   mkdir ingestion/browserExtension/icons
   # Add 16x16.png, 48x48.png, 128x128.png
   ```

4. **Load in browser:**
   - Chrome: `chrome://extensions/` → "Load unpacked"
   - Firefox: `about:debugging` → "Load Temporary Add-on"

5. **Test:**
   - Open Gmail or Outlook
   - Click extension icon
   - Login with your account
   - Verify alerts appear

### Mobile App Setup

**Prerequisites:**
- React Native environment setup
- Android emulator or iOS simulator
- Node.js and npm/yarn

**Installation:**

1. **Create React Native project:**
   ```bash
   npx react-native init PhishGuardApp
   cd PhishGuardApp
   ```

2. **Install dependencies:**
   ```bash
   npm install @react-native-async-storage/async-storage
   npm install react-native-gesture-handler react-navigation
   ```

3. **Copy SDK:**
   ```bash
   cp ingestion/SDK/PhishGuardSDK.js ./src/lib/
   ```

4. **Copy example screen:**
   ```bash
   cp ingestion/mobileApp/screens/HomeScreen.jsx ./src/screens/
   ```

5. **Set up navigation:**
   ```javascript
   // App.js
   import PhishGuardApp from './src/screens/HomeScreen';
   
   export default PhishGuardApp;
   ```

6. **Create `.env`:**
   ```env
   REACT_APP_API_URL=http://localhost:4000/api
   REACT_APP_SDK_KEY=your_sdk_key
   ```

7. **Run:**
   ```bash
   npx react-native run-android  # Android
   npx react-native run-ios       # iOS
   ```

### Email Plugin Setup

**Installation:**

1. **Import manager:**
   ```javascript
   import { EmailPluginManager } from 'ingestion/emailPlugin/manager.js';
   ```

2. **Initialize:**
   ```javascript
   const plugin = new EmailPluginManager(authToken);
   await plugin.initGmailPlugin();
   await plugin.initOutlookPlugin();
   ```

3. **Test:**
   - Open Gmail/Outlook in browser
   - Emails should auto-scan
   - Suspicious emails show orange banners

---

## 🧪 Testing Checklist

### Browser Extension Tests

- [ ] Extension loads without errors
- [ ] Login/logout works
- [ ] Gmail emails are scanned
- [ ] Outlook emails are scanned
- [ ] Alert popup shows for threats
- [ ] Link warnings display
- [ ] Settings persist in storage
- [ ] Offline mode works

### Mobile App Tests

- [ ] App launches
- [ ] Login works
- [ ] Dashboard displays risk score
- [ ] Email scan works
- [ ] URL check works
- [ ] Alerts load
- [ ] Report phishing works
- [ ] Refresh updates data
- [ ] Logout clears data

### API Integration Tests

```bash
# Test email scanning
curl -X POST http://localhost:4000/api/ingestion/email \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test@example.com",
    "subject": "Test",
    "body": "Test body",
    "links": ["http://test.com"]
  }'

# Expected response:
# {
#   "flagged": false,
#   "score": 15,
#   "confidence": 0.95,
#   "reasons": []
# }
```

---

## 📋 Common Issues & Fixes

### Issue: Extension not showing alerts
**Fix:** Ensure backend is running and token is valid
```bash
# Check backend
curl http://localhost:4000/health

# Check token in extension storage
chrome://extensions/ → PhishGuard → Inspect → Application → Storage
```

### Issue: Mobile SDK can't connect
**Fix:** Check API URL and network
```javascript
// Verify endpoint
const sdk = new PhishGuardSDK(key, {
  baseURL: 'http://YOUR_IP:4000/api' // Use IP for mobile emulator
});
```

### Issue: Gmail plugin not detecting emails
**Fix:** Ensure content script is injected
```javascript
// In content script
console.log('Content script loaded');
injectScanner();
```

---

## 🎯 Next Steps

### Immediate (Today)
1. ✅ Copy Browser Extension to your project
2. ✅ Load in Chrome and test
3. ✅ Create mobile app project
4. ✅ Integrate SDK

### Short-term (This Week)
1. Customize branding and icons
2. Add company logo to extension
3. Update color scheme (currently purple)
4. Test with real email accounts

### Medium-term (Next 2 Weeks)
1. Build additional mobile screens
2. Add settings/preferences screen
3. Implement push notifications
4. Add email template scanner

### Long-term (Next Month)
1. Deploy extension to Chrome Web Store
2. Submit mobile apps to App Store/Play Store
3. Gather user feedback
4. Optimize based on usage metrics
5. Add additional features based on security team

---

## 📞 Support & Resources

### Documentation Files
- **APP_DEVELOPER_IMPLEMENTATION.md** - Complete implementation guide
- **APP.md** - Role-specific responsibilities
- **TEAM_ROLES.md** - Team structure and interfaces
- **ARCHITECTURE.md** - System architecture overview

### Backend API Documentation
Contact Backend Engineer for endpoint details:
- POST `/ingestion/email` - Email analysis
- POST `/threat/check-url` - URL checking
- GET `/user/risk-profile` - User risk data
- GET `/alerts` - Recent alerts

### Debugging Tools
```javascript
// Enable debug logging in extension
localStorage.debug = 'phishguard:*';

// Check network requests in DevTools
// Applications → Network → Filter by API calls
```

---

## ✨ Key Features Summary

| Feature | Status | Location |
|---------|--------|----------|
| Browser Extension | ✅ Complete | `ingestion/browserExtension/` |
| Gmail Integration | ✅ Complete | `content/contentScript.js` |
| Outlook Integration | ✅ Complete | `content/contentScript.js` |
| Email Scanning | ✅ Complete | `background/backgroundScript.js` |
| Link Checking | ✅ Complete | `services/api.js` |
| Mobile SDK | ✅ Complete | `ingestion/SDK/` |
| React Native App | ✅ Complete | `ingestion/mobileApp/` |
| Local Storage | ✅ Complete | `utils/storage.js` |
| Authentication | ✅ Complete | All components |
| Offline Mode | ✅ Complete | SDK + Extension |
| Real-time Alerts | ✅ Complete | WebSocket support |

---

## 🚀 You're Ready to Go!

All the code you need is in place. Your job is to:
1. ✅ Integrate components into your apps
2. ✅ Test on real devices
3. ✅ Deploy to app stores
4. ✅ Gather user feedback
5. ✅ Iterate based on metrics

**Start with:** Load the browser extension in Chrome and test with a Gmail account.

**Questions?** Refer to individual component documentation or contact the Technical Product Lead.

---

**Status:** ✅ App Developer components complete and production-ready!

**Last Updated:** 2024
**Version:** 1.0.0
