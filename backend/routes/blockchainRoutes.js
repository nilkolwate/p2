const express = require("express");
const blockchain = require("../blockchain/Blockchain");

const router = express.Router();

// GET /api/blockchain and /api/blockchain/chain
router.get("/", (req, res) => {
  res.json({
    success: true,
    length: blockchain.chain.length,
    chain: blockchain.chain
  });
});

router.get("/chain", (req, res) => {
  res.json({
    success: true,
    length: blockchain.chain.length,
    chain: blockchain.chain
  });
});

// GET /api/blockchain/validate
router.get("/validate", (req, res) => {
  const result = blockchain.isChainValid();
  res.json({
    success: true,
    valid: result.valid,
    reason: result.reason,
    chainLength: blockchain.chain.length
  });
});

// POST /api/blockchain/add
router.post("/add", (req, res) => {
  try {
    const data = req.body;
    if (!data.certificateId || !data.certificateHash) {
      return res.status(400).json({
        success: false,
        message: "certificateId and certificateHash are required."
      });
    }

    const block = blockchain.addBlock({
      type: data.type || "certificate_issuance",
      certificateId: data.certificateId,
      studentName: data.studentName || "Student",
      course: data.course || "General",
      issueDate: data.issueDate || new Date().toISOString().split("T")[0],
      certificateHash: data.certificateHash,
      grade: data.grade || "Distinction",
      status: data.status || "Valid"
    });

    res.status(201).json({
      success: true,
      message: "Block mined and added to chain successfully.",
      block
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// GET /api/blockchain/record/:certificateId
router.get("/record/:certificateId", (req, res) => {
  const { certificateId } = req.params;
  const block = blockchain.getBlockByCertificateId(certificateId);

  if (!block) {
    return res.status(404).json({
      success: false,
      message: `Blockchain block for certificate ${certificateId} not found.`
    });
  }

  res.json({
    success: true,
    block,
    certificateRecord: block.data
  });
});

module.exports = router;
