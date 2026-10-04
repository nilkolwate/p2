const express = require("express");
const certificateService = require("../services/certificateService");
const blockchain = require("../blockchain/Blockchain");

const router = express.Router();

function getStats() {
  const certs = certificateService.getAllCertificates();
  const validCount = certs.filter((c) => c.status === "Valid").length;
  const revokedCount = certs.filter((c) => c.status === "Invalid").length;
  const isChainValid = blockchain.isChainValid();

  return {
    success: true,
    stats: {
      totalCertificates: certs.length,
      validCertificates: validCount,
      revokedCertificates: revokedCount,
      totalBlocks: blockchain.chain.length,
      isChainValid: isChainValid.valid,
      verificationRate: certs.length > 0 ? ((validCount / certs.length) * 100).toFixed(1) : "100.0"
    },
    recentCertificates: certs.slice(0, 5)
  };
}

// GET /api/reports/summary, /api/reports/analytics, /api/dashboard/stats, /api/dashboard
router.get("/analytics", (req, res) => {
  try {
    res.json(getStats());
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/summary", (req, res) => {
  try {
    res.json(getStats());
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/stats", (req, res) => {
  try {
    res.json(getStats());
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/", (req, res) => {
  try {
    res.json(getStats());
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
