# Frontend Documentation

## Overview
The frontend is the web-based user interface where users interact with PhishGuard to view alerts, analytics, dashboard, and manage security settings.

## Technology Stack (Recommended)
- **Framework**: React.js or Vue.js
- **State Management**: Redux / Vuex / Context API
- **UI Library**: Material-UI, Tailwind CSS, or Bootstrap
- **HTTP Client**: Axios or Fetch API
- **Build Tool**: Webpack, Vite, or Create React App

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Dashboard/
│   │   ├── Alerts/
│   │   ├── Analytics/
│   │   ├── UserRisk/
│   │   └── Layout/
│   ├── pages/
│   ├── services/
│   │   └── api.js          # API calls to backend
│   ├── store/              # State management
│   ├── styles/
│   ├── App.js
│   └── index.js
├── package.json
└── .env.example
```

## Key Responsibilities

- [ ] Create responsive dashboard UI
- [ ] Display real-time alerts and notifications
- [ ] Build analytics visualization (charts, graphs)
- [ ] Implement user risk profile page
- [ ] Create admin control panel
- [ ] Add authentication UI (login, logout)
- [ ] Implement settings and preferences
- [ ] Add email/phishing report submission form
- [ ] Create user management interface
- [ ] Handle error states and loading states
- [ ] Implement navigation and routing

## API Integration

All backend calls should go through a service layer:

```javascript
// src/services/api.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export const dashboardAPI = {
  getAlerts: () => fetch(`${API_BASE}/dashboard/alerts`).then(r => r.json()),
  getAnalytics: () => fetch(`${API_BASE}/dashboard/analytics`).then(r => r.json()),
  getUserRisk: (userId) => fetch(`${API_BASE}/dashboard/user-risk/${userId}`).then(r => r.json()),
};

export const ingestionAPI = {
  submitEmail: (data) => fetch(`${API_BASE}/ingestion/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),
};
```

## Backend API Endpoints

```
GET    /api/dashboard/alerts       - Get security alerts
GET    /api/dashboard/analytics    - Get analytics data
GET    /api/dashboard/user-risk    - Get user risk profile
POST   /api/ingestion/email        - Submit email for scanning
POST   /api/ingestion/file         - Submit file for scanning
POST   /api/gateway/login          - User authentication
GET    /api/gateway/user           - Get current user info
```

## Environment Variables

```
REACT_APP_API_URL=http://localhost:4000
REACT_APP_ENV=development
```

## Components Example

```javascript
// src/components/Dashboard/Dashboard.js
import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../services/api';
import Alerts from './Alerts';
import Analytics from './Analytics';

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getAlerts().then(data => {
      setAlerts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="dashboard">
      <h1>PhishGuard Dashboard</h1>
      {loading ? <p>Loading...</p> : <Alerts alerts={alerts} />}
    </div>
  );
}
```

## Key Pages

1. **Dashboard** - Overview of alerts and threats
2. **Alerts** - Detailed list of security alerts
3. **Analytics** - Threat trends and statistics
4. **User Risk** - Individual user risk profiles
5. **Settings** - Application preferences
6. **Admin Panel** - User management and configurations

## Authentication

Implement JWT token handling:

```javascript
// src/services/auth.js
export const setToken = (token) => localStorage.setItem('token', token);
export const getToken = () => localStorage.getItem('token');
export const clearToken = () => localStorage.removeItem('token');

// Add to API headers
const headers = {
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json'
};
```

## State Management Example

```javascript
// Alerts state
const [alerts, setAlerts] = useState([]);
const [filterLevel, setFilterLevel] = useState('all'); // all, high, medium, low
const filteredAlerts = filterLevel === 'all' 
  ? alerts 
  : alerts.filter(a => a.level === filterLevel);
```

## Testing

```bash
npm test                    # Run tests
npm run build              # Build for production
npm start                  # Start dev server
```

## Notes for Frontend Developer

- Keep components modular and reusable
- Use loading and error states for all API calls
- Implement proper error handling and user feedback
- Make UI responsive (mobile, tablet, desktop)
- Follow accessibility standards (a11y)
- Implement proper security (XSS, CSRF protection)
- Document component props and usage
- Use consistent styling and design system
