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

const router = express.Router();

router.get("/", getAllCertificates);
router.post("/generate", generateCertificate);
router.post("/verify", verifyCertificate);
router.post("/verify-qr", verifyQRCode);
router.post("/revoke", revokeCertificate);
router.post("/restore", restoreCertificate);
router.get("/:certificateId", getCertificateById);

module.exports = router;