/**
 * verificationRoutes.js — Public Certificate Verification Endpoints
 * 
 * Used by the frontend verify page and QR code scanner
 * All routes under /api/verify
 */
const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const upload = require("../middleware/upload");
const certificateService = require("../services/certificateService");

const router = express.Router();

// ── GET /api/verify/:certificateId ─────────────────────────────────────────
// Verify by ID — used when QR redirects to this URL
router.get("/:certificateId", (req, res) => {
  try {
    const { certificateId } = req.params;
    const host = req.get("host") || "localhost:5000";
    const cert = certificateService.getCertificateById(certificateId, host);

    if (!cert) {
      return res.status(404).json({
        success: false,
        verified: false,
        message: `Certificate ${certificateId} not found on the blockchain ledger.`,
      });
    }

    if (cert.status === "Invalid") {
      return res.json({
        success: true,
        verified: false,
        certificateRecord: cert,
        reason: `Certificate has been REVOKED: ${cert.revocationReason || "Administrative Review"}`,
      });
    }

    res.json({
      success: true,
      verified: true,
      certificateRecord: cert,
      reason: "Certificate verified successfully against the immutable blockchain ledger.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/verify/upload ──────────────────────────────────────────────────
// Upload a PDF certificate to verify it by computing its SHA-256 hash
router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No PDF file uploaded (field: 'file')." });
    }

    const { certificateId } = req.body;
    const fileBuffer = fs.readFileSync(req.file.path);
    const uploadedHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
    fs.unlink(req.file.path, () => {});

    if (!certificateId) {
      // Just return the hash if no ID provided
      return res.json({ success: true, hash: uploadedHash, algorithm: "SHA-256" });
    }

    const cert = certificateService.getCertificateById(certificateId);
    if (!cert) {
      return res.status(404).json({ success: false, verified: false, uploadedHash, message: `Certificate ${certificateId} not found.` });
    }

    const storedHash = (cert.hash || cert.sha256 || "").toLowerCase();
    const match = uploadedHash.toLowerCase() === storedHash;

    res.json({
      success: true,
      verified: match,
      reason: match
        ? "SHA-256 matches — certificate is authentic."
        : "Hash mismatch — file has been tampered with.",
      uploadedHash,
      originalHash: storedHash,
      certificateRecord: cert,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;