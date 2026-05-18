# Backend Documentation

## Overview
The backend handles all API routes, authentication, data persistence, and integration with the AI engine.

## Structure

- **gateway/** - API gateway, authentication, middleware
  - `auth/` - JWT and OAuth implementations
  - `middleware/` - Rate limiting, validation, sanitization
  - `apiGateway.js` - Main gateway routes

- **ingestion/** - Data collection from multiple sources
  - `browserExtension/` - Browser plugin data ingestion
  - `emailPlugin/` - Email client plugin data ingestion
  - `fileScanner/` - File upload scanning
  - `ingestionRoutes.js` - Ingestion API endpoints

- **database/** - Database connections and queries
  - `mongodb.js` - MongoDB connection and models
  - `redis.js` - Redis cache layer
  - `postgres.js` - PostgreSQL connection

- **logging/** - Event tracking and audit trails
  - `auditTrail.js` - User action logging
  - `hashChainLogger.js` - Immutable event chain
  - `incidentHistory.js` - Security incident history

## Key Responsibilities

- [ ] Create API routes for all ingestion sources
- [ ] Implement database models for users, emails, threats, incidents
- [ ] Set up authentication flows (JWT + OAuth)
- [ ] Create audit logging for all security events
- [ ] Implement rate limiting and request validation
- [ ] Error handling and logging middleware
- [ ] API documentation with endpoints

## Integration with AI Engine

After ingestion, pass data to AI engine:

```javascript
const nlpDetector = require('../ai-engine/phishingDetector/nlpDetector');
const result = nlpDetector.analyzeText(email.body);
```

## Environment Variables (for backend)

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/phishguard
REDIS_URL=redis://localhost:6379
POSTGRES_URL=postgres://user:password@localhost:5432/phishguard
JWT_SECRET=your-secret-key
```

## Testing Endpoints

```bash
# Health check
curl http://localhost:4000/

# Ingestion endpoints
curl -X POST http://localhost:4000/api/ingestion/email -H "Content-Type: application/json" -d '{"from":"sender@example.com"}'
```

## Notes for Backend Developer

- Keep routes modular and organized
- Always validate input before processing
- Log all authentication attempts
- Use consistent error response format
- Document new routes in comments
