const express = require("express");
const certificateService = require("../services/certificateService");
const blockchain = require("../blockchain/Blockchain");

const router = express.Router();

// Helper to get formatted notifications from real certificates and blockchain
function generateNotifications() {
  const certs = certificateService.getAllCertificates();
  const notifications = [];

  // Genesis block event
  notifications.push({
    id: "NOTIF-GENESIS",
    title: "Blockchain Genesis Block Anchored",
    description: "BlockVault cryptographic ledger initialized with SHA-256 genesis block.",
    category: "Security",
    priority: "Normal",
    type: "info",
    timestamp: "Genesis",
    unread: false,
    actionUrl: "/admin/blockchain",
    actionText: "Inspect Ledger"
  });

  // Recent certificate operations
  certs.forEach((cert, idx) => {
    if (cert.status === "Invalid") {
      notifications.push({
        id: `NOTIF-REV-${cert.id}`,
        title: `Certificate ${cert.id} Revoked`,
        description: `Certificate for ${cert.studentName} (${cert.course}) was revoked: ${cert.revocationReason || "Administrative Review"}.`,
        category: "Certificates",
        priority: "High",
        type: "warning",
        timestamp: cert.issueDate || "Recently",
        unread: idx === 0,
        actionUrl: "/admin/certificates",
        actionText: "View Certificate"
      });
    } else {
      notifications.push({
        id: `NOTIF-ISSUE-${cert.id}`,
        title: `Certificate ${cert.id} Anchored`,
        description: `Official academic credential for ${cert.studentName} anchored to blockchain ${cert.blockNumber || "Block"}.`,
        category: "Certificates",
        priority: "Normal",
        type: "success",
        timestamp: cert.issueDate || "Recently",
        unread: idx === 0,
        actionUrl: "/admin/certificates",
        actionText: "View Certificate"
      });
    }
  });

  // Blockchain integrity health notification
  const chainValidation = blockchain.isChainValid();
  notifications.push({
    id: "NOTIF-HEALTH",
    title: chainValidation.valid ? "Cryptographic Ledger Verified" : "Chain Integrity Warning",
    description: chainValidation.valid
      ? `All ${blockchain.chain.length} blocks validated with 100% cryptographic integrity score.`
      : `Integrity check failed: ${chainValidation.reason}`,
    category: "Security",
    priority: chainValidation.valid ? "Low" : "High",
    type: chainValidation.valid ? "success" : "warning",
    timestamp: "Real-time",
    unread: false,
    actionUrl: "/admin/blockchain",
    actionText: "View Blockchain"
  });

  return notifications;
}

// GET /api/notifications and /api/notifications/all
router.get("/", (req, res) => {
  try {
    const list = generateNotifications();
    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/notifications", (req, res) => {
  try {
    const list = generateNotifications();
    res.json({
      success: true,
      count: list.length,
      data: list
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
