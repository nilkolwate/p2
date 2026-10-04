# BlockVault – Module 4 Backend
**Verification + Dashboard/Reports + Notification** (Node.js · Express · Oracle)

Standalone REST API. It plugs into the other modules through **the shared Oracle DB**,
**the shared JWT secret**, and **one tiny blockchain adapter** – nothing else.

## 1. Setup
```bash
npm install
cp .env.example .env        # fill DB + JWT_SECRET
# run sql/schema.sql in Oracle (section A creates this module's tables)
npm start                   # http://localhost:5004/api/health
```
Node 18+ and Oracle DB 12c+ required (oracledb "thin" mode, no Oracle Client needed).

## 2. Integration checklist (for the teammate merging modules)
| Need | From | What to do |
|---|---|---|
| JWT | Module 2 | Set the **same `JWT_SECRET`**. Token payload needs `id` (or `userId`/`sub`) and `role` (`ADMIN`/`ISSUER`) |
| Tables `USERS`, `CERTIFICATES` | Module 2 / 3 | Column names are listed at the bottom of `sql/schema.sql`. If yours differ, edit the SQL in `src/services/` |
| Hash | Module 1 / 3 | `CERTIFICATES.CERT_HASH` = **SHA-256 hex of the exact final PDF bytes** (with QR embedded). Uploaded-file verification hashes the same way |
| Blockchain | Module 1 | Set `BLOCKCHAIN_MODE=http` and expose `GET /certificates/:id -> {hash}`, **or** replace `getHash()` in `src/services/blockchain.service.js` with a direct function call |
| QR URL | Module 3 | QR should encode `https://<frontend>/verify/<CERTIFICATE_ID>` (or the raw ID). Frontend scans it and calls the API below |
| Notifications from other modules | any | `POST /api/notifications/internal/send` with header `x-api-key` |

## 3. API  (all responses: `{ success, data, meta? }` or `{ success:false, error:{code,message} }`)

### Verification – public, rate-limited
| Method | Path | Body | Notes |
|---|---|---|---|
| GET | `/api/verify/:certificateId` | – | Verify by ID |
| POST | `/api/verify/qr` | `{ "qrData": "<scanned text>" }` | Accepts raw ID, URL (`?id=` or `/verify/ID`) or JSON |
| POST | `/api/verify/upload` | multipart `file`(PDF) + optional `certificateId` | Re-hashes the PDF. Without ID, finds the certificate by file hash |

Result `status`: `VALID` · `TAMPERED` · `REVOKED` · `NOT_FOUND`
```json
{ "success": true, "data": {
  "certificateId": "CERT-2026-0001", "status": "VALID",
  "reason": "Certificate is authentic and verified against the blockchain",
  "verifiedAt": "2026-09-30T10:00:00.000Z",
  "checks": { "certificateFound": true, "fileHashMatchesRecord": true,
              "blockchainChecked": true, "blockchainMatchesRecord": true, "revoked": false },
  "certificate": { "studentName": "…", "course": "…", "issueDate": "…", "blockIndex": 4, "txHash": "…" } } }
```
Every attempt is stored in `VERIFICATION_LOGS` (auditable record).

### Dashboard – `Authorization: Bearer <jwt>` (ADMIN sees all, ISSUER sees own certificates)
| GET | `/api/dashboard/summary` | totals, verification counts, last 24h, recent activity, top verified |
|---|---|---|
| GET | `/api/dashboard/trends?days=30` | per-day counts by status (for charts) |

### Reports – same auth
| GET | `/api/reports/verifications` | filters: `from`,`to` (YYYY-MM-DD), `status`, `certificateId`, `page`, `limit`, `format=csv` |
|---|---|---|
| GET | `/api/reports/certificates` | filters: `from`,`to`,`status`, `page`, `limit`, `format=csv` |

### Notifications – JWT (own notifications only)
| GET | `/api/notifications?unread=true&page=&limit=` | list |
|---|---|---|
| GET | `/api/notifications/unread-count` | for the bell badge |
| PATCH | `/api/notifications/:id/read` · `/api/notifications/read-all` | mark read |
| POST | `/api/notifications/internal/send` | **internal**, `x-api-key` header; body `{userId,type,title,message,email?,sendMail?}` |

Automatic notifications: issuer is notified on every verification of their certificate;
on `TAMPERED`/`REVOKED` an email is also sent (if SMTP configured); on `TAMPERED` all admins are alerted.

## 4. Quick test
```bash
curl http://localhost:5004/api/verify/CERT-2026-0001
curl -F file=@certificate.pdf -F certificateId=CERT-2026-0001 http://localhost:5004/api/verify/upload
curl -H "Authorization: Bearer $TOKEN" "http://localhost:5004/api/reports/verifications?format=csv" -o report.csv
npm test    # unit tests for hashing / QR parsing / CSV helpers
```

## 5. Structure
```
src/
  server.js  app.js
  config/      env.js  db.js
  middleware/  auth.js  upload.js  error.js
  routes/      verify · dashboard · report · notification
  services/    verification · blockchain(adapter) · dashboard · notification
  utils/       helpers.js  AppError.js
sql/schema.sql
```
