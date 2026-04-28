# Architecture Overview

## Security Architecture

┌──────────────────────────────────────────────┐
│            USER / ENDPOINT LAYER            │
│----------------------------------------------│
│  • Browser Extension                         │
│  • Email Plugin (Outlook/Gmail)              │
│  • File/Download Scanner                     │
│                                              │
│  → Captures links, emails, attachments       │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│         API GATEWAY / INGESTION LAYER       │
│----------------------------------------------│
│  • Authentication (OAuth/API Keys)           │
│  • Rate Limiting                             │
│  • Request Validation                        │
│                                              │
│  → Secure routing to AI Engine               │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│             AI DETECTION ENGINE             │
│----------------------------------------------│
│  • NLP Phishing Detector (email text)        │
│  • URL & Domain Analyzer                     │
│  • Attachment Scanner (PDFs/docs)            │
│  • User Behavior Risk Model                  │
│                                              │
│  → Outputs Risk Score (Low/Med/High)         │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│         DECISION & RESPONSE ENGINE          │
│----------------------------------------------│
│  IF Low    → Warn User                       │
│  IF Medium → Block + Alert                   │
│  IF High   → Isolate + Escalate              │
│                                              │
│  Actions:                                    │
│  • Block malicious links                     │
│  • Quarantine files                          │
│  • Revoke sessions                           │
│  • Force password reset                      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│      RISK ESCALATION (DIGITAL → REAL)       │
│----------------------------------------------│
│  • Credential compromise → Identity risk     │
│  • Finance phishing → Fraud risk             │
│  • Repeated clicks → Insider vulnerability   │
│                                              │
│  → Alerts security / triggers escalation     │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│      SECURE LOGGING & INTEGRITY LAYER       │
│----------------------------------------------│
│  • Tamper-proof logs (hash chaining)         │
│  • Audit trail                              │
│  • Incident history                          │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│        DASHBOARD & ADMIN CONSOLE          │
│----------------------------------------------│
│  • Real-time alerts                          │
│  • User risk scores                          │
│  • Incident timeline                         │
│  • Threat analytics                          │
└──────────────────────────────────────────────┘

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
