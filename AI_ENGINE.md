# AI Engine Documentation

## Overview
The AI engine is responsible for threat detection, risk analysis, and intelligent decision-making based on multiple detection mechanisms.

## Structure

- **phishingDetector/** - Email and text-based phishing detection
  - `nlpDetector.js` - Natural language processing for phishing indicators
  - `emailClassifier.js` - Email classification and categorization

- **urlAnalyzer/** - URL and domain threat analysis
  - `domainChecker.js` - Domain reputation checking
  - `urlRiskScanner.js` - URL scanning for malicious indicators

- **attachmentScanner/** - File and attachment analysis
  - `pdfScanner.js` - PDF document scanning
  - `malwarePatternCheck.js` - Malware pattern detection

- **behaviorModel/** - User behavior analysis
  - `userRiskModel.js` - User risk profile evaluation

- **riskScoring/** - Risk calculation and aggregation
  - `calculateRisk.js` - Overall risk score computation

## Key Responsibilities

- [ ] Implement NLP-based phishing detection
- [ ] Build email classification system
- [ ] Create domain reputation checker (integrate with external APIs if needed)
- [ ] Implement URL risk scanning
- [ ] Add PDF and attachment analysis
- [ ] Build user behavior risk model
- [ ] Create comprehensive risk scoring algorithm
- [ ] Document all detection logic

## Detection Output Format

All detectors should return consistent structure:

```javascript
{
  score: 0-100,           // Risk score
  flagged: boolean,       // Is threat detected
  confidence: 0-1,        // Confidence level
  reasons: [string],      // Why this was flagged
  details: object         // Additional detection details
}
```

## Integration with Backend

Backend ingestion calls your detection:

```javascript
// Backend calls this
const result = require('../ai-engine/phishingDetector/nlpDetector').analyzeText(text);

// Expected response
{
  phishingScore: 0.75,
  flagged: true,
  confidence: 0.85,
  reasons: ['Urgent action required', 'Suspicious domain', 'Grammar issues']
}
```

## Integration with Response Engine

Your risk scores feed into decision logic:

```javascript
// response-engine/decisionEngine.js uses this
const riskScore = require('../ai-engine/riskScoring/calculateRisk').calculateScore(inputs);
```

## Environment Variables (for AI)

```
GEMINI_API_KEY=your-api-key           # If using Gemini
LOG_LEVEL=info
```

## Testing Your Detectors

```javascript
// Example test
const nlpDetector = require('./ai-engine/phishingDetector/nlpDetector');

const result = nlpDetector.analyzeText('Urgent! Verify your account immediately');
console.log(result);
// Expected: { phishingScore: 0.8, flagged: true, confidence: 0.85 }
```

## Model Files

If using ML models, store them in:
```
ai-engine/models/
├── phishing-classifier.pkl
├── url-risk-model.pkl
└── behavior-model.pkl
```

## Notes for AI Engineer

- Keep detectors independent and testable
- Document algorithm approach and thresholds
- Return consistent data structures
- Log confidence scores for analysis
- Ensure performance for real-time detection
- Implement versioning for models
