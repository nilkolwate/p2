/**
 * BlockVault — Unified Backend Server
 * =====================================
 * Integrates all modules into a single Express server:
 *   Module 1  — Blockchain Ledger          /api/blockchain
 *   Module 2  — Certificate Management     /api/certificates
 *   Module 3  — SHA-256 Hash Generation    /api/hash
 *   Module 4  — Blockchain Verification    /api/verify
 *   Module 5  — QR Code (embedded in cert generation)
 *   Module 6  — Analytics / Dashboard      /api/reports, /api/dashboard
 *   Module 7  — Notifications              /api/notifications
 *   Module 8  — Contact / Support Email    /api/contact
 */

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const os = require("os");

// ── Route Modules ──────────────────────────────────────────────────────────
const certificateRoutes   = require("./routes/certificateRoutes");
const blockchainRoutes    = require("./routes/blockchainRoutes");
const hashRoutes          = require("./routes/hashRoutes");
const analyticsRoutes     = require("./routes/analyticsRoutes");
const contactRoutes       = require("./routes/contactRoutes");
const notificationRoutes  = require("./routes/notificationRoutes");
const verificationRoutes  = require("./routes/verificationRoutes");
const authRoutes          = require("./routes/authRoutes");
const requireAuth         = require("./middleware/auth");
const certificateService  = require("./services/certificateService");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ─────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    "https://nilkolwate.github.io",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ── Static Files — Serve generated PDFs ──────────────────────────────────
app.use("/certificates", express.static(path.join(__dirname, "certificates")));

// ── Health Check ──────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "BlockVault Server is running and healthy",
    modules: {
      blockchain: "active",
      certificates: "active",
      hash: "active",
      verification: "active",
      analytics: "active",
      notifications: "active",
      contact: "active",
    },
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────────────────────
// Module 2 — Certificate CRUD + Generation + QR
app.use("/api/certificates", certificateRoutes);

// Module 1 — Blockchain Ledger
app.use("/api/blockchain", blockchainRoutes);

// Module 3 — SHA-256 Hash Generation (text + file upload)
app.use("/api/hash", hashRoutes);

// Module 4 — Public Verification (by ID or PDF upload)
app.use("/api/verify", verificationRoutes);

// Module 6 — Analytics & Dashboard Stats (Admin Protected)
app.use("/api/reports",   requireAuth, analyticsRoutes);
app.use("/api/dashboard", requireAuth, analyticsRoutes);

// Module 7 — Notifications (Admin Protected)
app.use("/api/notifications", requireAuth, notificationRoutes);

// Module 8 — Contact / Support Email
app.use("/api/contact", contactRoutes);
app.use("/api/support",  contactRoutes);
app.use("/support",      contactRoutes);

// Auth & Admin OTP Module (from blockvault vs code)
app.use("/api/auth", authRoutes);
app.use("/",         authRoutes); // Provides /admin-login and /verify-otp

// ── Standalone QR Verification Route ───────────────────────────────────────
// When QR is scanned, automatically redirect to the live frontend verification page
app.get("/verify", (req, res) => {
  const certId = req.query.id || req.query.certificateId;
  const frontendUrl = (process.env.FRONTEND_URL || "https://nilkolwate.github.io/p2").replace(/\/+$/, "");
  if (certId) {
    return res.redirect(302, `${frontendUrl}/#/verify/${encodeURIComponent(certId)}`);
  }
  return res.redirect(302, `${frontendUrl}/#/verify`);
});

app.get("/verify/:certificateId", (req, res) => {
  try {
    const rawId = req.params.certificateId;
    const certificateId =
      certificateService.extractCertificateIdFromQR(rawId) || rawId;
    const frontendUrl = (process.env.FRONTEND_URL || "https://nilkolwate.github.io/p2").replace(/\/+$/, "");

    // Allow ?format=html for explicit server-side debug view
    if (req.query.format !== "html") {
      return res.redirect(302, `${frontendUrl}/#/verify/${encodeURIComponent(certificateId)}`);
    }

    const host = req.get("host") || "localhost:5000";
    const cert = certificateService.getCertificateById(certificateId, host);

    if (!cert) {
      return res.status(404).send(`
        <!DOCTYPE html><html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Certificate Not Found — BlockVault</title>
          <style>
            *{box-sizing:border-box;margin:0;padding:0}
            body{font-family:'Segoe UI',Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f1f14 0%,#1a3422 100%);color:#fff}
            .card{background:rgba(255,255,255,0.05);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:50px 40px;text-align:center;max-width:480px;width:90%}
            .icon{font-size:64px;margin-bottom:20px}
            h1{font-size:24px;color:#ff6b6b;margin-bottom:12px}
            p{color:rgba(255,255,255,0.7);font-size:15px;line-height:1.6;margin-bottom:8px}
            .id{font-family:monospace;background:rgba(255,255,255,0.1);padding:6px 12px;border-radius:8px;font-size:13px;word-break:break-all;margin:12px 0}
            a{display:inline-block;margin-top:24px;padding:12px 28px;background:#1F3D2B;color:#fff;text-decoration:none;border-radius:50px;font-weight:600;transition:background .2s}
            a:hover{background:#16281C}
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">🔍</div>
            <h1>Certificate Not Found</h1>
            <p>No blockchain record exists for:</p>
            <div class="id">${certificateId}</div>
            <p>This certificate may not have been issued through BlockVault, or the ID may be incorrect.</p>
            <a href="${frontendUrl}/#/verify">← Try Another Certificate</a>
          </div>
        </body></html>
      `);
    }

    const pdfUrl = `/certificates/${certificateId}.pdf`;
    const isRevoked = cert.status === "Invalid";

    res.send(`
      <!DOCTYPE html><html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BlockVault — ${isRevoked ? "Revoked" : "Verified"}: ${cert.certificateId}</title>
        <style>
          *{box-sizing:border-box;margin:0;padding:0}
          body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;color:#1a1a1a}
          .header{background:linear-gradient(135deg,#1F3D2B,#2d5a3e);color:#fff;padding:24px 20px;text-align:center}
          .header h1{font-size:28px;letter-spacing:2px;font-weight:800}
          .header p{font-size:13px;opacity:.85;margin-top:4px}
          .container{max-width:800px;margin:30px auto;padding:0 16px 40px}
          .card{background:#fff;border-radius:16px;padding:28px;box-shadow:0 4px 20px rgba(0,0,0,0.07);border:1px solid #e8eef4;margin-bottom:20px}
          .status-icon{width:80px;height:80px;margin:0 auto 16px;border-radius:50%;background:${isRevoked?"#fee2e2":"#dcfce7"};display:flex;align-items:center;justify-content:center;font-size:40px}
          .status-title{font-size:22px;font-weight:700;color:${isRevoked?"#dc2626":"#16a34a"};text-align:center;margin-bottom:8px}
          .status-msg{text-align:center;color:#666;font-size:14px;line-height:1.6}
          .badge{display:inline-block;padding:4px 14px;border-radius:50px;font-size:12px;font-weight:700;background:${isRevoked?"#fee2e2":"#dcfce7"};color:${isRevoked?"#dc2626":"#16a34a"};margin:12px auto;display:block;width:fit-content}
          h3{font-size:16px;color:#1F3D2B;font-weight:700;border-bottom:2px solid #f0f4f8;padding-bottom:12px;margin-bottom:16px}
          .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f5f5f5;gap:20px;font-size:14px}
          .row:last-child{border-bottom:none}
          .label{font-weight:600;color:#555;flex-shrink:0}
          .value{color:#111;text-align:right;word-break:break-all}
          .hash{font-family:monospace;font-size:11px;color:#444;word-break:break-all}
          iframe{width:100%;height:500px;border:1px solid #e0e0e0;border-radius:10px;margin-top:12px}
          .btn{display:inline-block;padding:12px 28px;background:#1F3D2B;color:#fff;text-decoration:none;border-radius:50px;font-weight:600;font-size:14px;transition:background .2s;margin-top:16px}
          .btn:hover{background:#16281C}
          .btn-outline{background:transparent;border:2px solid #1F3D2B;color:#1F3D2B;margin-left:10px}
          .btn-outline:hover{background:#1F3D2B;color:#fff}
          @media(max-width:600px){.row{flex-direction:column;gap:4px}.value{text-align:left}iframe{height:320px}}
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 BLOCKVAULT</h1>
          <p>Blockchain-Based Academic Certificate Verification System</p>
        </div>
        <div class="container">
          <div class="card" style="text-align:center">
            <div class="status-icon">${isRevoked?"❌":"✅"}</div>
            <div class="status-title">${isRevoked?"Certificate REVOKED":"Certificate Verified Successfully"}</div>
            <div class="badge">${cert.status || "Valid"}</div>
            <p class="status-msg">${isRevoked
              ? `This credential was revoked: <strong>${cert.revocationReason||"Administrative Review"}</strong>`
              : "This academic certificate is authentic and securely anchored on the BlockVault blockchain."
            }</p>
          </div>

          <div class="card">
            <h3>📋 Certificate Credentials</h3>
            <div class="row"><span class="label">Certificate ID</span><span class="value"><strong>${cert.certificateId||cert.id}</strong></span></div>
            <div class="row"><span class="label">Student Name</span><span class="value">${cert.studentName}</span></div>
            <div class="row"><span class="label">Roll Number</span><span class="value">${cert.rollNumber||"N/A"}</span></div>
            <div class="row"><span class="label">Course / Degree</span><span class="value">${cert.course}</span></div>
            <div class="row"><span class="label">Department</span><span class="value">${cert.department||"Computer Engineering"}</span></div>
            <div class="row"><span class="label">Institution</span><span class="value">${cert.institution||"Government Polytechnic Amravati"}</span></div>
            <div class="row"><span class="label">Issue Date</span><span class="value">${cert.issueDate}</span></div>
            <div class="row"><span class="label">Grade</span><span class="value">${cert.grade||"First Class with Distinction"}</span></div>
            <div class="row"><span class="label">Blockchain Block</span><span class="value">${cert.blockNumber||"Block #1"}</span></div>
            <div class="row"><span class="label">SHA-256 Hash</span><span class="value hash">${cert.hash||cert.sha256||"N/A"}</span></div>
          </div>

          <div class="card">
            <h3>📄 Official Certificate Document</h3>
            <iframe src="${pdfUrl}" title="Certificate PDF"></iframe>
            <div style="text-align:center;margin-top:16px">
              <a class="btn" href="${pdfUrl}" download="Certificate_${cert.id}.pdf">⬇ Download PDF</a>
              <a class="btn btn-outline" href="${frontendUrl}/#/verify">🔍 Verify Another</a>
            </div>
          </div>
        </div>
      </body></html>
    `);
  } catch (err) {
    console.error("Verification page error:", err);
    res.status(500).send("Verification error occurred.");
  }
});

// ── Server Home Page ───────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.send(`
    <!DOCTYPE html><html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>BlockVault API Server</title>
      <style>
        body{font-family:'Segoe UI',Arial,sans-serif;background:#0f1f14;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center}
        .card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:40px;max-width:600px;width:90%;text-align:center}
        h1{font-size:32px;font-weight:800;letter-spacing:3px;color:#6ee7a0;margin-bottom:8px}
        .sub{color:rgba(255,255,255,.6);font-size:14px;margin-bottom:28px}
        .badge{display:inline-block;padding:6px 18px;background:#22c55e22;color:#6ee7a0;border:1px solid #22c55e44;border-radius:50px;font-size:13px;font-weight:700;margin-bottom:28px}
        table{width:100%;border-collapse:collapse;text-align:left}
        th{color:rgba(255,255,255,.5);font-size:11px;text-transform:uppercase;padding:8px;border-bottom:1px solid rgba(255,255,255,.1)}
        td{padding:10px 8px;border-bottom:1px solid rgba(255,255,255,.06);font-size:13px}
        code{background:rgba(255,255,255,.08);padding:2px 8px;border-radius:6px;font-family:monospace;color:#a5f3c0}
      </style>
    </head>
    <body>
      <div class="card">
        <h1>BLOCKVAULT</h1>
        <p class="sub">Blockchain-Based Certificate Verification API</p>
        <div class="badge">✓ Server Running on Port ${PORT}</div>
        <table>
          <tr><th>Module</th><th>Endpoint</th></tr>
          <tr><td>Certificate Management</td><td><code>/api/certificates</code></td></tr>
          <tr><td>Blockchain Ledger</td><td><code>/api/blockchain</code></td></tr>
          <tr><td>Hash Generation</td><td><code>/api/hash</code></td></tr>
          <tr><td>Public Verification</td><td><code>/api/verify</code></td></tr>
          <tr><td>Analytics / Reports</td><td><code>/api/reports</code></td></tr>
          <tr><td>Dashboard Stats</td><td><code>/api/dashboard</code></td></tr>
          <tr><td>Notifications</td><td><code>/api/notifications</code></td></tr>
          <tr><td>Contact / Support</td><td><code>/api/contact</code></td></tr>
          <tr><td>Health Check</td><td><code>/api/health</code></td></tr>
        </table>
      </div>
    </body></html>
  `);
});

// ── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
  });
});

// ── Error Handler ──────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ── Start Server ───────────────────────────────────────────────────────────
const localIP = certificateService.getLocalIPv4();

app.listen(PORT, "0.0.0.0", () => {
  console.log("\n══════════════════════════════════════════");
  console.log("        BLOCKVAULT BACKEND SERVER");
  console.log("══════════════════════════════════════════");
  console.log(`  Local:   http://localhost:${PORT}`);
  console.log(`  Network: http://${localIP}:${PORT}`);
  console.log("──────────────────────────────────────────");
  console.log("  API Modules Active:");
  console.log(`    /api/health         — Health Check`);
  console.log(`    /api/certificates   — Module 2: Certificate Management`);
  console.log(`    /api/blockchain     — Module 1: Blockchain Ledger`);
  console.log(`    /api/hash           — Module 3: SHA-256 Hash`);
  console.log(`    /api/verify         — Module 4: Verification`);
  console.log(`    /api/reports        — Module 6: Analytics`);
  console.log(`    /api/notifications  — Module 7: Notifications`);
  console.log(`    /api/contact        — Module 8: Contact Email`);
  console.log("══════════════════════════════════════════\n");
});

module.exports = app;