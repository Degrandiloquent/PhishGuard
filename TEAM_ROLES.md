# PhishGuard Team Roles & Responsibilities

## 1. Technical Product Lead / Security Architecture

### Primary Responsibilities
- **Gateway Layer** (`gateway/`)
  - API Gateway design and implementation
  - Authentication flows (JWT, OAuth)
  - Request validation and sanitization middleware
  - Rate limiting and request throttling
  
- **Security Architecture**
  - Security policies and configurations
  - Encryption standards and key management
  - SSL/TLS setup and HTTPS enforcement
  - CORS policies and security headers
  
- **System Architecture**
  - Overall system design and data flow
  - Integration points between modules
  - Database schema design and relationships
  - API contract definitions
  
- **AI Engine Integration**
  - Coordinate between Backend and AI teams
  - Define risk scoring interfaces
  - Response action triggering
  - Escalation workflows

### Key Files/Folders
- `gateway/` (auth, middleware, apiGateway.js)
- `config/securityConfig.js`
- `escalation/` (escalationManager.js)
- `response-engine/decisionEngine.js`

### Team Interface
- **Connects Backend ↔ AI**: Ensures smooth data flow and integration
- **Owns**: Security decisions, authentication, request validation
- **Approves**: Major architectural changes, security policies

---

## 2. Backend Engineer

### Primary Responsibilities
- **Routes & API Endpoints**
  - Create and maintain all REST API routes
  - Implement CRUD operations
  - Handle HTTP methods (GET, POST, PUT, DELETE)
  
- **Database Layer**
  - Database schema design
  - Create models and relationships
  - Implement queries and transactions
  - Database migrations
  
- **Controllers & Business Logic**
  - Process incoming requests
  - Implement business logic
  - Format and return responses
  - Error handling

### Key Files/Folders
- `ingestion/ingestionRoutes.js`
- `dashboard/dashboardRoutes.js`
- `database/` (mongodb.js, redis.js, postgres.js)
- `logging/` (auditTrail.js, incidentHistory.js)
- All route handlers and controllers

### Responsibilities
- [ ] Create ingestion routes for browser, email, file sources
- [ ] Implement user and threat data models
- [ ] Build audit logging system
- [ ] Handle data persistence
- [ ] Create dashboard data endpoints
- [ ] Implement error handling and validation

### Team Interface
- **Consumes**: AI risk scores from AI Engineer
- **Provides**: Data endpoints for Frontend
- **Coordinates with**: Tech Lead on security, App Dev on integration

---

## 3. AI Engineer

### Primary Responsibilities
- **AI Detection Engines** (`ai-engine/phishingDetector/`)
  - NLP-based phishing detection
  - Email classification algorithms
  
- **URL Analysis** (`ai-engine/urlAnalyzer/`)
  - Domain reputation checking
  - URL risk scoring
  
- **Attachment Scanning** (`ai-engine/attachmentScanner/`)
  - PDF analysis
  - Malware pattern detection
  
- **Risk Scoring** (`ai-engine/riskScoring/`)
  - Calculate overall risk scores
  - Aggregate threat indicators
  
- **Behavior Models** (`ai-engine/behaviorModel/`)
  - User risk profiling
  - Anomaly detection

### Key Files/Folders
- `ai-engine/phishingDetector/`
- `ai-engine/urlAnalyzer/`
- `ai-engine/attachmentScanner/`
- `ai-engine/riskScoring/calculateRisk.js`
- `ai-engine/behaviorModel/userRiskModel.js`

### Responsibilities
- [ ] Implement NLP detection algorithms
- [ ] Build email classification model
- [ ] Create domain reputation checker
- [ ] Implement URL risk scanner
- [ ] Build attachment analysis tools
- [ ] Create comprehensive risk scoring system
- [ ] Develop user behavior models
- [ ] Document all detection logic and thresholds

### Output Format (Standard Interface)
```javascript
{
  score: 0-100,           // Risk score
  flagged: boolean,       // Is threat detected
  confidence: 0-1,        // Confidence level
  reasons: [string],      // Why flagged
  details: object         // Additional info
}
```

### Team Interface
- **Provides**: Risk scores to Backend/Response Engine
- **Consumes**: Threat data from Backend
- **Coordinates with**: Tech Lead on integration, Response Engine decisions

---

## 4. App Developer

### Primary Responsibilities
- **Plugin Integration**
  - Browser extension integration (Chrome, Firefox)
  - Email client plugin (Gmail, Outlook)
  
- **Client-Side Integration**
  - SDK/API client for mobile and web
  - Real-time threat scanning
  - User alert notifications
  
- **Utility Functions**
  - Helper functions for threat analysis
  - Local data encryption
  - Offline functionality
  - Error handling utilities
  
- **Plugin Features**
  - Scan emails before opening
  - Analyze links before clicking
  - Show warning popups
  - Report suspicious content

### Key Files/Folders
- `ingestion/browserExtension/`
- `ingestion/emailPlugin/`
- `utils/` (helpers.js, encryption.js)

### Responsibilities
- [ ] Create browser extension scaffold
- [ ] Build email plugin integration
- [ ] Implement real-time link scanning
- [ ] Create threat warning UI
- [ ] Build notification system
- [ ] Add whitelist/report features
- [ ] Implement offline caching
- [ ] Handle secure token storage

### Team Interface
- **Sends**: User data and threat reports to Backend (ingestion endpoints)
- **Consumes**: Risk scores from Backend
- **Coordinates with**: Frontend on UX, Backend on ingestion APIs

---

## 5. Frontend Developer

### Primary Responsibilities
- **Dashboard UI**
  - Main dashboard layout
  - Real-time alert display
  - User-friendly threat visualization
  
- **Alerts Interface**
  - Alert list view
  - Alert detail pages
  - Alert filtering and search
  - Alert dismissal/actions
  
- **Analytics & Reporting**
  - Threat charts and graphs
  - Trend analysis visualizations
  - Risk reports
  
- **User Risk Profile**
  - User risk dashboard
  - Risk recommendations
  - Security suggestions

### Key Sections to Build
- Dashboard home page
- Alerts management page
- Analytics dashboard
- User risk profile page
- Settings page
- User authentication flows

### API Endpoints to Consume
```
GET    /api/dashboard/alerts       → Display on Alerts page
GET    /api/dashboard/analytics    → Display on Analytics
GET    /api/dashboard/user-risk    → Display User Risk page
POST   /api/ingestion/email        → Report email form
POST   /api/ingestion/file         → File submission form
POST   /api/gateway/login          → Authentication
GET    /api/gateway/user           → User profile data
```

### Responsibilities
- [ ] Create responsive dashboard
- [ ] Build real-time alerts display
- [ ] Implement analytics visualizations
- [ ] Create user risk profile page
- [ ] Add authentication UI
- [ ] Implement settings panel
- [ ] Add threat reporting forms
- [ ] Build user management interface
- [ ] Handle loading and error states

### Team Interface
- **Consumes**: Data from Backend via API endpoints
- **Sends**: User actions (reports, settings) to Backend
- **Coordinates with**: Backend on API contracts, App Dev on mobile parity

---

## Module Ownership Matrix

| Module | Owner | Collaborators |
|--------|-------|---|
| `gateway/` | Tech Lead | Backend (uses routes) |
| `config/` | Tech Lead | All (uses configs) |
| `ingestion/` | Backend + App Dev | Backend (routes), App Dev (plugins) |
| `database/` | Backend | All (data source) |
| `logging/` | Backend | Tech Lead (security), AI (incident logging) |
| `ai-engine/` | AI Engineer | Tech Lead (integration), Backend (consumes) |
| `response-engine/` | Tech Lead | AI (input), Backend (execution) |
| `escalation/` | Tech Lead | AI (triggers), Backend (executes) |
| `dashboard/` | Frontend | Backend (data), All (design review) |
| `utils/` | App Dev | All (utilities) |

---

## Code Review & Integration Points

### Before Starting
- Check CONTRIBUTING.md for branch naming
- Review existing code in your module
- Check for blockers in other teams

### During Development
- Keep modules independent and testable
- Use consistent interfaces/exports
- Document your changes in comments
- Test integration with dependent modules

### Before Pushing
1. Code compiles without errors
2. No hardcoded credentials
3. Proper error handling
4. Clear commit messages
5. Comments on complex logic

### Pull Request Process
1. Create feature branch: `git checkout -b feature/description`
2. Push to branch: `git push origin feature/description`
3. Create PR with:
   - Clear description
   - Dependencies on other PRs
   - Testing details
   - Breaking changes (if any)
4. Tag relevant team members for review
5. Address review comments
6. Merge after approval

---

## Communication Points

### Daily Standup Topics
- Blocker status
- Integration progress
- Help needed from other teams

### Weekly Sync
- Architectural decisions
- Cross-team dependencies
- Risk assessment updates

### Before Major Changes
- Discuss with Tech Lead
- Review impact on other modules
- Plan integration timeline

---

## Getting Started

1. **Setup**
   ```bash
   git clone <repo>
   cd PhishGuard
   npm install
   cp .env.example .env
   ```

2. **Your Module**: Start with files/folders listed under your role
3. **Read**: Check the documentation file for your role (BACKEND.md, AI_ENGINE.md, etc.)
4. **Coordinate**: Talk to Tech Lead about integration timeline

