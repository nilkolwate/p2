const express = require("express");
const {
  generateCertificate,
  getAllCertificates,
  getCertificateById,
  revokeCertificate,
  restoreCertificate,
  verifyCertificate,
  verifyQRCode
} = require("../controllers/certificateController");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// Admin protected endpoints
router.get("/", requireAuth, getAllCertificates);
router.post("/generate", requireAuth, generateCertificate);
router.post("/revoke", requireAuth, revokeCertificate);
router.post("/restore", requireAuth, restoreCertificate);

// Public verification endpoints
router.post("/verify", verifyCertificate);
router.post("/verify-qr", verifyQRCode);
router.get("/:certificateId", getCertificateById);

module.exports = router;