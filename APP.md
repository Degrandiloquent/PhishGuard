# App Developer Documentation

## Overview
App Developer handles mobile applications and browser extensions that enable PhishGuard protection across different platforms and devices.

## Platforms & Technologies

### Mobile App (iOS & Android)
- **Framework**: React Native, Flutter, or Native
- **State Management**: Redux, Provider, or GetX
- **HTTP Client**: Axios or built-in HTTP libraries
- **Local Storage**: AsyncStorage, SharedPreferences, or CoreData
- **Notifications**: Firebase Cloud Messaging (FCM) or APNs

### Browser Extension
- **Manifest**: Chrome/Firefox extension manifest v3
- **Framework**: React, Vue, or vanilla JS
- **Communication**: Content scripts, background scripts, popup UI

## Project Structure

### Mobile App
```
mobile-app/
├── android/
├── ios/
├── src/
│   ├── screens/
│   │   ├── Home/
│   │   ├── Alerts/
│   │   ├── Settings/
│   │   └── Login/
│   ├── components/
│   ├── services/
│   │   └── api.js
│   ├── store/           # State management
│   ├── navigation/
│   ├── utils/
│   └── App.js
├── package.json
└── .env.example
```

### Browser Extension
```
browser-extension/
├── manifest.json
├── src/
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── content/
│   │   └── contentScript.js
│   ├── background/
│   │   └── backgroundScript.js
│   ├── icons/
│   └── services/
│       └── api.js
├── package.json
└── .env.example
```

## Key Responsibilities

### Mobile App
- [ ] Create user authentication flow
- [ ] Display real-time alerts and notifications
- [ ] Implement email/link scanning from mobile
- [ ] Show user risk profile
- [ ] Add settings and preferences
- [ ] Handle push notifications
- [ ] Implement offline functionality
- [ ] Add app updates and versioning
- [ ] Create secure local data storage

### Browser Extension
- [ ] Scan emails in web clients (Gmail, Outlook, etc.)
- [ ] Analyze links before user clicks
- [ ] Warn user of suspicious content
- [ ] Real-time URL/email checking
- [ ] Display threat indicators
- [ ] Report phishing/suspicious emails
- [ ] Add to contacts/whitelist features
- [ ] Show popup alert UI
- [ ] Background threat scanning

## API Integration

```javascript
// Mobile: src/services/api.js
const API_BASE = 'http://your-backend.com/api';

export const mobileAPI = {
  scanEmail: (data) => 
    fetch(`${API_BASE}/ingestion/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(data)
    }),
  
  scanURL: (url) => 
    fetch(`${API_BASE}/scan/url`, {
      method: 'POST',
      body: JSON.stringify({ url })
    }),
  
  getUserAlerts: () => 
    fetch(`${API_BASE}/alerts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }),
};
```

```javascript
// Browser Extension: src/services/api.js
export const extensionAPI = {
  checkEmail: (emailData) => 
    chrome.runtime.sendMessage({
      action: 'scanEmail',
      data: emailData
    }),
  
  checkLink: (url) => 
    fetch('http://localhost:4000/api/scan/url', {
      method: 'POST',
      body: JSON.stringify({ url })
    }),
};
```

## Content Script Example (Browser Extension)

```javascript
// src/content/contentScript.js
// Runs on every page

// Intercept links
document.querySelectorAll('a').forEach(link => {
  link.addEventListener('mouseenter', async () => {
    const result = await extensionAPI.checkLink(link.href);
    if (result.malicious) {
      link.style.borderBottom = '2px solid red';
    }
  });
});

// Scan emails in Gmail
const emailElements = document.querySelectorAll('[role="document"]');
emailElements.forEach(email => {
  const text = email.innerText;
  extensionAPI.checkEmail({ content: text });
});
```

## Popup UI Example (Browser Extension)

```html
<!-- src/popup/popup.html -->
<html>
<head>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div class="popup-container">
    <h2>PhishGuard</h2>
    <div id="status">Loading...</div>
    <button id="scanBtn">Scan Current Page</button>
    <button id="settingsBtn">Settings</button>
  </div>
  <script src="popup.js"></script>
</body>
</html>
```

## Push Notifications (Mobile)

```javascript
// Listen for push notifications
messaging.onMessage((payload) => {
  console.log('Notification received:', payload);
  
  // Show in-app alert
  if (payload.data.type === 'threat') {
    showThreatAlert(payload.data);
  }
});
```

## Environment Variables

```
# Mobile
REACT_APP_API_URL=http://your-backend.com
REACT_APP_ENV=development

# Browser Extension
API_URL=http://your-backend.com
DEBUG=true
```

## Authentication Handling

```javascript
// Store token securely
export const saveToken = (token) => {
  // Mobile: AsyncStorage
  // Extension: chrome.storage.local
};

export const getToken = () => {
  // Retrieve from secure storage
};
```

## Testing

### Mobile
```bash
npm test                    # Unit tests
npm run android            # Run on Android
npm run ios                # Run on iOS
```

### Browser Extension
```bash
npm run build              # Build extension
# Load unpacked extension in Chrome/Firefox dev mode
```

## Deployment

### Mobile
- iOS: Submit to Apple App Store
- Android: Submit to Google Play Store
- Use app versioning and update management

### Browser Extension
- Chrome: Submit to Chrome Web Store
- Firefox: Submit to Firefox Add-ons
- Auto-update capabilities

## Notes for App Developer

- Handle network errors gracefully
- Implement offline functionality
- Store tokens securely (not in localStorage on extensions)
- Request proper permissions (camera, storage, etc.)
- Implement rate limiting on client side
- Add proper error handling and user feedback
- Test across different devices and OS versions
- Follow mobile UX best practices
- Implement analytics and crash reporting
- Keep sensitive data encrypted
