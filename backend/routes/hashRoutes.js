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

/**
 * Extract Certificate ID from PDF stream or hex TJ arrays
 */
function extractCertificateIdFromBuffer(buf) {
  const zlib = require("zlib");
  let idx = 0;
  while ((idx = buf.indexOf(Buffer.from("stream"), idx)) !== -1) {
    let start = idx + 6;
    if (buf[start] === 0x0d && buf[start + 1] === 0x0a) start += 2;
    else if (buf[start] === 0x0a || buf[start] === 0x0d) start += 1;
    const end = buf.indexOf(Buffer.from("endstream"), start);
    if (end !== -1) {
      try {
        const dec = zlib.inflateSync(buf.subarray(start, end)).toString("utf8");
        const directMatch = dec.match(/BV-[0-9]{4}-[0-9A-Fa-f]+/);
        if (directMatch) return directMatch[0];

        const tjMatches = dec.match(/\[([\s\S]*?)\]\s*TJ/g) || [];
        for (const tj of tjMatches) {
          let text = "";
          const hexParts = tj.match(/<([0-9A-Fa-f]+)>/g) || [];
          for (const h of hexParts) {
            text += Buffer.from(h.slice(1, -1), "hex").toString("utf8");
          }
          const m = text.match(/BV-[0-9]{4}-[0-9A-Fa-f]+/);
          if (m) return m[0];
        }
      } catch (e) {}
    }
    idx = end + 9;
  }
  return null;
}

// ── POST /api/hash/verify-upload ─────────────────────────────────────────────
// Upload a PDF (with optional certificateId) → verifies against blockchain ledger
router.post(
  "/verify-upload",
  upload.single("certificate"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No PDF uploaded." });
      }

      let { certificateId } = req.body;

      // Compute uploaded PDF hash
      const fileBuffer = fs.readFileSync(req.file.path);
      const uploadedHash = crypto
        .createHash("sha256")
        .update(fileBuffer)
        .digest("hex");
      fs.unlink(req.file.path, () => {});

      if (!certificateId) {
        // Fallback 1: Extract from PDF stream contents
        certificateId = extractCertificateIdFromBuffer(fileBuffer);
      }

      if (!certificateId) {
        // Fallback 2: Check if filename contains Certificate ID
        const nameMatch = (req.file.originalname || "").match(/BV-[0-9]{4}-[0-9A-Fa-f]+/i);
        if (nameMatch) {
          certificateId = nameMatch[0];
        }
      }

      // If Certificate ID is identified, compare against blockchain record
      if (certificateId) {
        const cert = certificateService.getCertificateById(certificateId);
        if (cert) {
          const storedHash = (cert.hash || cert.sha256 || "").toLowerCase();
          const match = uploadedHash.toLowerCase() === storedHash;
          const isRevoked = cert.status === "Invalid";

          return res.json({
            success: true,
            verified: match && !isRevoked,
            status: !match ? "TAMPERED" : (isRevoked ? "REVOKED" : "VALID"),
            reason: !match
              ? "Cryptographic hash mismatch! The certificate file has been altered or tampered with."
              : (isRevoked
                  ? `Certificate has been revoked: ${cert.revocationReason || "Administrative Review"}`
                  : "SHA-256 hash matches — certificate is genuine and unmodified."),
            uploadedHash,
            originalHash: storedHash,
            certificateRecord: cert,
          });
        }
      }

      // Fallback 3: Search all certificates by hash across blockchain ledger
      const allCerts = certificateService.getAllCertificates();
      const matched = allCerts.find(
        (c) => (c.hash || c.sha256 || "").toLowerCase() === uploadedHash.toLowerCase()
      );

      if (matched) {
        const isRevoked = matched.status === "Invalid";
        return res.json({
          success: true,
          verified: !isRevoked,
          status: isRevoked ? "REVOKED" : "VALID",
          reason: isRevoked
            ? `Certificate has been revoked: ${matched.revocationReason || "Administrative Review"}`
            : "SHA-256 hash matches — certificate is genuine and unmodified.",
          uploadedHash,
          originalHash: matched.hash,
          certificateRecord: matched,
        });
      }

      // If not found
      return res.json({
        success: true,
        verified: false,
        status: "NOT_FOUND",
        reason: "No certificate matching this file digest or ID was found on the blockchain ledger.",
        uploadedHash,
      });
    } catch (err) {
      console.error("verify-upload error:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

module.exports = router;
