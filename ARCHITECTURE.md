# Architecture Overview

PhishGuard operates across 6 key layers:

## User & Endpoint Layer
 Browser extension, email plugin, file scanner

## API Gateway
Secure ingestion, authentication, rate limiting

## AI Detection Engine
-NLP phishing detection
-URL/domain analysis
-Attachment scanning
-Behavioral risk modeling

## Decision & Response Engine
-Risk-based automated actions

## Risk Escalation Layer
-Links cyber events to real-world threats

## Secure Logging Layer
-Tamper-proof audit trail (hash chaining concept)

## 🔄 System Flow

```
┌─────────────────────┐
│  User receives      │
│  phishing email     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  User clicks        │
│  malicious link     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  PhishGuard         │
│  intercepts request │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  AI engine analyzes:│
│  • Content          │
│  • Behavior         │
│  • URL patterns     │
│  • Metadata         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Risk score         │
│  generated          │
│  Low/Med/High       │
└──────────┬──────────┘
           │
      ┌────┴─────┬──────────┐
      │           │          │
      ▼           ▼          ▼
   LOW      MEDIUM       HIGH
   │           │          │
   ▼           ▼          ▼
 ALERT    ISOLATE    BLOCK & REVOKE
           VERIFY
           ALERT

           │
           │ (All paths)
           ▼
┌─────────────────────┐
│  Event logged &     │
│  escalated          │
│  (Audit trail)      │
└─────────────────────┘
```

##  Key Features

-✅ Real-time phishing detection
-✅ Automated threat response
-✅ AI-driven risk scoring
-✅ Behavioral user profiling
-✅ Tamper-proof logging
-✅ Cyber → physical risk mapping
