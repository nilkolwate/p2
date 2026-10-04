# BlockVault — Blockchain Academic Certificate Verification System

An enterprise-grade, decentralized academic credential issuance and verification ecosystem powered by Node.js, Express, cryptographic SHA-256 ledgers, and React.

---

## 🌟 Architecture & Module Integration

The system unifies 4 distinct functional sub-modules into a cohesive, high-performance platform:

| Original Sub-Module | Functional Area | Integrated Endpoints | Status |
|---|---|---|---|
| **Module 1 (`blockvault-module1-blockchain-hash`)** | Blockchain Ledger & SHA-256 Hash | `/api/blockchain/*`, `/api/hash/*` | ✅ Integrated & Running |
| **Module 2 & 5 (`blockvault vs code`)** | Admin Auth, 6-digit OTP & Support Email | `/api/auth/*`, `/admin-login`, `/verify-otp`, `/api/support` | ✅ Integrated & Running |
| **Module 3 & Core (`backend`)** | Certificate Generation, PDFKit & QR Codes | `/api/certificates/*`, `/certificates/*.pdf` | ✅ Integrated & Running |
| **Module 4 (`module4-backend`)** | Public Verification, Analytics & Notifications | `/api/verify/*`, `/api/reports/*`, `/api/dashboard`, `/api/notifications` | ✅ Integrated & Running |

---

## 📁 Repository Directory Structure

```text
Copy_N_BV/
├── backend/                                # Unified Primary Backend (Port 5000)
│   ├── app.js                              # Central Express Server integrating all 4 modules
│   ├── .env                                # Backend environment configuration
│   ├── package.json                        # Backend dependencies (express, cors, pdfkit, qrcode, etc.)
│   ├── blockchain/                         # Cryptographic Block & Blockchain classes
│   ├── certificates/                       # Auto-generated tamper-proof PDF credentials
│   ├── controllers/                        # Route business controllers
│   ├── data/                               # JSON ledger and notifications persistent storage
│   ├── middleware/                         # Multer PDF upload & validation middleware
│   ├── routes/                             # Clean modular route handlers
│   │   ├── authRoutes.js                   # Admin Login & OTP Verification (Module 2/5)
│   │   ├── blockchainRoutes.js             # Ledger Chain & Validation (Module 1)
│   │   ├── certificateRoutes.js            # Credential Issuance & QR (Module 3)
│   │   ├── hashRoutes.js                   # SHA-256 Text & File Hashing (Module 1/3)
│   │   ├── verificationRoutes.js           # Public Credential Verification (Module 4)
│   │   ├── analyticsRoutes.js              # Dashboard & Report Analytics (Module 4)
│   │   ├── notificationRoutes.js           # System & Audit Notifications (Module 4)
│   │   └── contactRoutes.js                # Contact & Support Email Dispatcher (Module 5/8)
│   ├── services/                           # PDFKit, QR Generator, Blockchain engines
│   └── utils/                              # Cryptographic helpers
│
├── blockvault-frontend/                    # Modern React Web Application (Port 3000)
│   ├── .env                                # Points to backend API (http://localhost:5000/api)
│   ├── package.json                        # Frontend dependencies (React, Lucide, Recharts)
│   ├── src/
│   │   ├── App.js                          # Application routing table
│   │   ├── index.css                       # Design system and typography styles
│   │   ├── components/                     # Reusable UI elements (Navbar, Footer, Modals)
│   │   ├── layouts/                        # PublicLayout and AdminLayout
│   │   ├── pages/                          # Public pages:
│   │   │   ├── HomePage.js                 # Landing showcase
│   │   │   ├── VerifyCertificate.js        # Multi-mode verification (ID, PDF Upload, QR Camera/Image)
│   │   │   ├── VerificationResult.js       # Live cryptographic authenticity badge & details
│   │   │   ├── AdminLogin.js               # Administrator login portal
│   │   │   ├── About.js                    # System documentation
│   │   │   └── Contact.js                  # Support contact form with direct mail dispatch
│   │   ├── pages/admin/                    # Protected Administrator Suite:
│   │   │   ├── Dashboard.js                # Live stats cards, Pie charts, Activity feed
│   │   │   ├── CertificatesManagement.js   # Real-time PDF issuance, Revocation & Restoration
│   │   │   ├── BlockchainRecords.js        # Interactive block explorer & Chain integrity validator
│   │   │   ├── ReportsAnalytics.js         # Analytical charts & verification breakdown
│   │   │   ├── Notifications.js            # Real-time alerts & tamper notification center
│   │   │   └── UsersManagement.js          # Role-based credential management
│   │   ├── services/
│   │   │   └── api.js                      # Centralized API service connecting all 4 backend modules
│   │   └── utils/
│   │       └── auth.js                     # Admin session & authentication helpers
│
├── blockvault vs code/                     # Original Module: Auth, OTP & MySQL module
├── blockvault-module1-blockchain-hash/     # Original Module: Sayali's Blockchain & Hash module
├── module4-backend/                        # Original Module: Gauri's Verification & Dashboard module
├── package.json                            # Root Orchestrator (starts backend + frontend in 1 command)
└── ARCHITECTURE.md                         # Detailed integration technical document
```

---

## 🚀 Quick Start Guide

### 1. Start Both Backend & Frontend Simultaneously

From the project root:
```bash
npm start
```
* Or using dev mode:
```bash
npm run dev
```

### 2. Access the Application

- **Public Website & Verification**: [http://localhost:3000](http://localhost:3000)
- **Direct Certificate Verification**: [http://localhost:3000/verify](http://localhost:3000/verify)
- **Admin Portal**: [http://localhost:3000/login](http://localhost:3000/login)
  - **Username**: `Administrator`
  - **Password**: `Admin@123`
- **Backend API & Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔒 Verification Methods Supported

1. **Instant Certificate ID Search**: Query any issued ID (e.g. `BV-2026-2293B257`) against the cryptographic blockchain ledger.
2. **File Upload Verification**: Upload any issued PDF certificate. BlockVault calculates its SHA-256 checksum client-side or server-side and compares it against the anchored block digest.
3. **Live QR Code Scanning**:
   - Web camera scanner with automatic decoding
   - Image file drag-and-drop
   - Mobile scan redirecting directly to verification results.
