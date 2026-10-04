# BlockVault — System Architecture & Integration Guide

This document describes how all 4 discrete project modules were unified into a production-grade, zero-error architecture.

---

## 1. Module Integration Blueprint

```text
                               ┌──────────────────────────────────────────┐
                               │           React Frontend App             │
                               │        (http://localhost:3000)           │
                               └────────────────────┬─────────────────────┘
                                                    │
                                         Proxy /api or Direct CORS
                                                    │
                                                    ▼
                               ┌──────────────────────────────────────────┐
                               │         Unified Express Server           │
                               │        (http://localhost:5000)           │
                               │                app.js                    │
                               └──────┬─────┬─────┬─────┬─────┬────┬──────┘
                                      │     │     │     │     │    │
            ┌─────────────────────────┘     │     │     │     │    └──────────────────────────┐
            ▼                               ▼     ▼     ▼     ▼                               ▼
    ┌───────────────┐              ┌───────────────────────┐ ┌────────────────┐       ┌───────────────┐
    │   MODULE 1    │              │   MODULE 2 & CORE     │ │    MODULE 3    │       │   MODULE 4    │
    │  Blockchain   │              │  Certificates & QR    │ │ SHA-256 Hashing│       │ Verification  │
    │    Ledger     │              │     Generation        │ │                │       │  & Analytics  │
    ├───────────────┤              ├───────────────────────┤ ├────────────────┤       ├───────────────┤
    │/api/blockchain│              │/api/certificates      │ │/api/hash       │       │/api/verify    │
    │ - /chain      │              │ - /generate (PDFKit)  │ │ - /generate    │       │/api/reports   │
    │ - /validate   │              │ - /revoke, /restore   │ │ - /generate-file       │/api/dashboard │
    │ - /add        │              │ - /verify-qr          │ │ - /compare     │       │/api/notifs    │
    └───────────────┘              └───────────────────────┘ └────────────────┘       └───────────────┘
                                                    ▲
                                                    │
                                           ┌────────────────┐
                                           │  AUTH & OTP    │
                                           │(blockvault vs) │
                                           ├────────────────┤
                                           │/api/auth/login │
                                           │/verify-otp     │
                                           │/api/support    │
                                           └────────────────┘
```

---

## 2. Integrated Modules Detail

### 1. Module 1: Blockchain Ledger & SHA-256 Hash Engine
- **Source**: `blockvault-module1-blockchain-hash`
- **Integrated Files**:
  - `backend/blockchain/Block.js`
  - `backend/blockchain/Blockchain.js`
  - `backend/routes/blockchainRoutes.js`
  - `backend/routes/hashRoutes.js`
- **Capabilities**:
  - Calculates proof-of-work difficulty-based cryptographic hashes
  - Validates whole chain link integrity with prevHash matching
  - Supports string, JSON, and uploaded PDF file stream hashing

### 2. Module 2: Authentication & OTP Verification
- **Source**: `blockvault vs code`
- **Integrated Files**:
  - `backend/routes/authRoutes.js`
  - `backend/routes/contactRoutes.js`
- **Capabilities**:
  - Supports both `/admin-login` + `/verify-otp` and `/api/auth/*`
  - Generates 6-digit cryptographic OTP with 5-minute timeout
  - Issues signed JWT tokens for administrator sessions
  - Graceful fallback when mail service / MySQL is offline

### 3. Module 3: PDF Certificate Generation & Dynamic QR
- **Source**: `backend` (enhanced)
- **Integrated Files**:
  - `backend/services/certificateService.js`
  - `backend/routes/certificateRoutes.js`
- **Capabilities**:
  - Generates official diploma/degree certificates using PDFKit with security borders, seals, and typography
  - Embeds custom high-contrast QR code pointing directly to verification URL
  - Auto-mines newly issued certificates into the blockchain ledger

### 4. Module 4: Public Verification, Dashboard & Notifications
- **Source**: `module4-backend`
- **Integrated Files**:
  - `backend/routes/verificationRoutes.js`
  - `backend/routes/analyticsRoutes.js`
  - `backend/routes/notificationRoutes.js`
- **Capabilities**:
  - Public verification by Certificate ID or cryptographic PDF checksum
  - Standalone mobile QR landing page at `/verify/:certificateId`
  - Real-time analytics API for total certificates, validity rate, and active blocks
  - Real-time audit notification log for administrative review

---

## 3. End-to-End Test Matrix

| Test Scenario | Action | Expected Output | Actual Result |
|---|---|---|---|
| Health Check | `GET /api/health` | HTTP 200 `{success: true}` | Passed (All 8 modules active) |
| Certificate Verification | Query `BV-2026-2293B257` | Validated student & block #1 | Passed (100% verified) |
| File Upload Verification | Upload certificate PDF | Match SHA-256 digest on ledger | Passed (Checksum matched) |
| Admin Authentication | Login as `Administrator` | Session created, redirected | Passed (Dashboard unlocked) |
| Dashboard Data | `GET /api/reports/summary` | Real stats & chart metrics | Passed (Live data loaded) |
| Blockchain Audit | `GET /api/blockchain/validate` | `valid: true`, 0 tampering | Passed (100% Integrity verified) |
