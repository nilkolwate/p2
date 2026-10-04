# BlockVault — Module 1: Blockchain + Hash Generation + Integration
**Owner: Sayali**

This is the backend skeleton for the **Blockchain-Based Certificate Verification System (BlockVault)**. It implements your two modules from the synopsis and doubles as the integration point where the whole team's code plugs together.

## What's implemented (fully working, tested)

| Piece | File |
|---|---|
| Hash Generation Module | `hash/hashGenerator.js` |
| Blockchain Module (Block) | `blockchain/Block.js` |
| Blockchain Module (Chain) | `blockchain/Blockchain.js` |
| REST API for hashing | `routes/hashRoutes.js` + `controllers/hashController.js` |
| REST API for blockchain | `routes/blockchainRoutes.js` + `controllers/blockchainController.js` |
| Overall integration (main app) | `server.js` |
| Oracle DB connection stub | `config/db.js` |

Run `node test/blockchain.test.js` any time to sanity-check the core logic (hashing determinism, block linking, tamper detection).

## How it works

1. **Certificate created** (Pranav's module) → PDF saved.
2. **Hash generated**: `POST /api/hash/generate` (or call `generateHashFromFile()` directly in-process) → SHA-256 fingerprint of the PDF.
3. **Stored on-chain**: `POST /api/blockchain/add` with `{ certificateId, studentName, certificateHash, issueDate }` → creates a new mined block linked to the previous one.
4. **Verification** (Gauri, Module 4): `POST /api/blockchain/verify` with the uploaded PDF + `certificateId` → re-hashes the upload, looks up the original hash on-chain, returns `verified: true/false`.

## API Endpoints

**Hash Module**
- `POST /api/hash/generate` — form-data field `certificate` (PDF file) → `{ hash }`
- `POST /api/hash/compare` — `{ hashA, hashB }` → `{ match: bool }`

**Blockchain Module**
- `POST /api/blockchain/add` — `{ certificateId, studentName, certificateHash, issueDate }`
- `GET /api/blockchain/chain` — full chain (feed this to the Dashboard module)
- `GET /api/blockchain/validate` — integrity check across all blocks
- `GET /api/blockchain/record/:certificateId` — single block lookup
- `POST /api/blockchain/verify` — form-data `certificate` (PDF) + `certificateId` → `{ verified, reason, uploadedHash, originalHash }`

## Setup

```bash
npm install
cp .env.example .env      # fill in Oracle credentials once Gauri's schema is ready
npm run dev                # nodemon, auto-restart
# or
npm start
```

The blockchain works **without Oracle configured** — it persists to `data/blockchain_ledger.json` on disk. This means you can build and demo your part independently of the DB module. Once Gauri's Oracle schema is live, wire `config/db.js` into `Blockchain.js`'s `saveChain()`/`loadChain()` to mirror each block into the `BLOCKCHAIN_LEDGER` table (schema suggestion is in `config/db.js`).

## Integration with teammates

`server.js` is the **single entry point** for the whole app. It currently mounts:
- Your routes (fully working)
- Placeholder routes for everyone else (`routes/placeholders/teammateRoutes.js`) — these return `501 Not Implemented` so the server runs end-to-end today.

As each teammate finishes their module, swap their placeholder for the real router in `server.js`:

```js
// before
const { authRoutes } = require('./routes/placeholders/teammateRoutes');

// after Gauri Agraval finishes Module 2
const authRoutes = require('./routes/authRoutes');
```

Suggested route ownership so there are no collisions:

| Route prefix | Module | Owner |
|---|---|---|
| `/api/hash` | Hash Generation | **Sayali (you)** |
| `/api/blockchain` | Blockchain | **Sayali (you)** |
| `/api/auth` | Authentication (JWT + Bcrypt) | Gauri Agraval |
| `/api/certificates` | Certificate Generation (PDF) | Pranav |
| `/api/qr` | QR Code | Pranav |
| `/api/verify` | Verification | Gauri |
| `/api/dashboard` | Dashboard/Reports | Gauri |
| `/api/notifications` | Notification | Gauri |

## Suggested certificate generation flow (for Pranav to call into your module)

```js
const { generateHashFromFile } = require('../hash/hashGenerator');
const blockchain = require('../blockchain/Blockchain');

// after PDF is written to disk at pdfPath, and before/after QR embedding:
const certificateHash = generateHashFromFile(pdfPath);
blockchain.addBlock({
  certificateId,
  studentName,
  certificateHash,
  issueDate,
});
```

## Notes / assumptions

- Proof-of-work difficulty is set to 2 leading zeros (`blockchain/Blockchain.js`) — fast enough for a live demo, still shows mining behavior for the eval panel. Bump it up if you want a more dramatic "mining time" for the demo.
- Since it's a **private/permissioned** chain (per the synopsis), there's no peer-to-peer consensus — only this backend can write blocks. That matches the scope described.
- The blockchain only ever stores the hash + minimal metadata, never the PDF itself — matches the synopsis exactly ("Instead of storing the entire certificate...").
