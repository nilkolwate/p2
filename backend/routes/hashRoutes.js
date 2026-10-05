/**
 * hashRoutes.js — Enhanced Hash Generation Module (Module 3)
 * 
 * Endpoints:
 *   POST /api/hash/generate          — Hash text or JSON data (no file)
 *   POST /api/hash/generate-file     — Hash an uploaded PDF file (multer)
 *   POST /api/hash/compare           — Compare two SHA-256 hashes
 *   POST /api/hash/verify-upload     — Upload PDF & certificateId → compare with stored hash
 */
const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const upload = require("../middleware/upload");
const certificateService = require("../services/certificateService");

const router = express.Router();

// ── POST /api/hash or /api/hash/generate ─────────────────────────────────────
// Accepts { text } or { data } (JSON object) in request body
router.post(["/", "/generate"], (req, res) => {
  try {
    const { text, data } = req.body;
    const input = text || (data ? JSON.stringify(data) : "");

    if (!input) {
      return res.status(400).json({
        success: false,
        message: "Provide 'text' string or 'data' object to hash.",
      });
    }

    const hash = crypto.createHash("sha256").update(input).digest("hex");
    res.json({ success: true, hash, algorithm: "SHA-256", inputLength: input.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/hash/generate-file ────────────────────────────────────────────
// Accepts a PDF file upload (field name: "certificate" or "file")
router.post(
  "/generate-file",
  upload.single("certificate") || upload.single("file"),
  (req, res) => {
    try {
      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No PDF file uploaded. Use field name 'certificate' or 'file'." });
      }

      const fileBuffer = fs.readFileSync(req.file.path);
      const hash = crypto.createHash("sha256").update(fileBuffer).digest("hex");

      // Clean up temp file
      fs.unlink(req.file.path, () => {});

      res.json({
        success: true,
        hash,
        algorithm: "SHA-256",
        fileName: req.file.originalname,
        fileSize: req.file.size,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ── POST /api/hash/compare ───────────────────────────────────────────────────
router.post("/compare", (req, res) => {
  const { hashA, hashB } = req.body;

  if (!hashA || !hashB) {
    return res.status(400).json({
      success: false,
      message: "Both 'hashA' and 'hashB' are required.",
    });
  }

  const match =
    hashA.trim().toLowerCase() === hashB.trim().toLowerCase();

  res.json({
    success: true,
    match,
    hashA,
    hashB,
    status: match ? "IDENTICAL" : "MISMATCH",
  });
});

// ── POST /api/hash/verify-upload ─────────────────────────────────────────────
// Upload a PDF + certificateId → returns whether the PDF hash matches blockchain record
router.post(
  "/verify-upload",
  upload.single("certificate"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No PDF uploaded." });
      }

      const { certificateId } = req.body;
      if (!certificateId) {
        fs.unlink(req.file.path, () => {});
        return res
          .status(400)
          .json({ success: false, message: "certificateId is required." });
      }

      // Compute uploaded PDF hash
      const fileBuffer = fs.readFileSync(req.file.path);
      const uploadedHash = crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex");
      fs.unlink(req.file.path, () => {});

      // Look up stored certificate
      const cert = certificateService.getCertificateById(certificateId);
      if (!cert) {
        return res.status(404).json({
          success: true,
          verified: false,
          reason: `No certificate record found for ID: ${certificateId}`,
          uploadedHash,
        });
      }

      const storedHash = (cert.hash || cert.sha256 || "").toLowerCase();
      const match = uploadedHash.toLowerCase() === storedHash;

      res.json({
        success: true,
        verified: match,
        reason: match
          ? "SHA-256 hash matches — certificate is genuine and unmodified."
          : "Hash mismatch — certificate file has been altered or is counterfeit.",
        uploadedHash,
        originalHash: storedHash,
        certificateRecord: cert,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
