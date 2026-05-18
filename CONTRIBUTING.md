# Contributing to PhishGuard

## Team Structure

- **Backend Developer**: Handles core API, routes, middleware, database connections, and service logic
- **AI/ML Engineer**: Handles AI detection engines, risk scoring, NLP, and pattern analysis
- **Frontend Developer**: Builds web UI, dashboard, and user interfaces
- **App Developer**: Builds mobile apps (iOS/Android) and browser extensions
- **Full Stack/DevOps**: Configuration, deployment, security, and infrastructure

## Before You Start

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd PhishGuard
   ```

2. Set up your environment:
   ```bash
   npm install
   cp .env.example .env
   cp config/geminiConfig.example.js config/geminiConfig.js
   cp config/securityConfig.example.js config/securityConfig.js
   ```

3. Add your credentials to the copied files (they won't be tracked by git).

## Development Guidelines

### Backend Team
- **Location**: `gateway/`, `database/`, `ingestion/`, `logging/`
- **Responsibilities**:
  - API routes and middleware
  - Authentication and authorization
  - Database schema and queries
  - Error handling and logging
  - Rate limiting and security policies
- **File Naming**: `camelCase` for files (e.g., `jwtAuth.js`)
- **Code Style**: Follow Express.js best practices

### AI/ML Team
- **Location**: `ai-engine/`, `response-engine/`, `escalation/`
- **Responsibilities**:
  - Phishing detection algorithms
  - NLP and email classification
  - URL and attachment scanning
  - Risk scoring and behavior models
  - Response decision logic and escalation rules
- **File Naming**: Descriptive names (e.g., `nlpDetector.js`, `emailClassifier.js`)
- **Export Format**: Each module should export an object with clear method names

### Integration Points

**Backend → AI-Engine**:
```javascript
const nlpDetector = require('../ai-engine/phishingDetector/nlpDetector');
const result = nlpDetector.analyzeText(emailBody);
```

**AI-Engine → Response-Engine**:
```javascript
const { decide } = require('../response-engine/decisionEngine');
const action = decide(riskContext);
```

## Commit Message Format

```
[BACKEND] Add JWT middleware
[AI] Implement NLP phishing detector
[CONFIG] Update security policies
```

## Code Review Process

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Commit with descriptive messages
4. Push to your branch: `git push origin feature/your-feature-name`
5. Create a Pull Request with:
   - Clear description of changes
   - Testing details
   - Any new dependencies
   - Breaking changes (if any)

## Testing

- Write tests in a `tests/` folder (create if needed)
- Test your module in isolation before integration
- Document expected inputs/outputs

## Dependency Management

If you need new packages:
1. Install locally: `npm install package-name`
2. Document in PR why it's needed
3. Ensure it doesn't conflict with existing packages
4. Update `package.json` (this will be tracked)

## Module Structure Example

Each module should export clear interfaces:

```javascript
// ai-engine/phishingDetector/nlpDetector.js
module.exports = {
  analyzeText(text) {
    return {
      phishingScore: 0.0-1.0,
      flagged: boolean,
      confidence: 0.0-1.0,
      reasons: [string],
    };
  },
};
```

## Questions or Conflicts?

Open an issue in the repository or discuss in team channels before making major changes.
