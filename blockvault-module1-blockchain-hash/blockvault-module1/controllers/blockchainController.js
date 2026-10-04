const blockchain = require('../blockchain/Blockchain');
const { generateHashFromFile, compareHashes } = require('../hash/hashGenerator');
const fs = require('fs');

/**
 * blockchainController.js
 * ------------------------
 * Exposes the Blockchain Module as REST endpoints so other modules/
 * teammates can integrate over HTTP (or, since it's the same backend,
 * they can also just `require('../blockchain/Blockchain')` directly).
 *
 * Endpoints:
 *   POST /api/blockchain/add
 *     Called right after Pranav's module generates a certificate + hash.
 *     Body: { certificateId, studentName, certificateHash, issueDate }
 *
 *   GET  /api/blockchain/chain
 *     Returns the full chain (for the Dashboard module - Gauri, Module 4).
 *
 *   GET  /api/blockchain/validate
 *     Runs chain-integrity check across every block.
 *
 *   GET  /api/blockchain/record/:certificateId
 *     Returns the stored block for a given certificate ID.
 *
 *   POST /api/blockchain/verify
 *     The core verification flow: accepts an uploaded PDF + certificateId,
 *     hashes the upload fresh, looks up the original hash on-chain, and
 *     reports match/no-match. (Gauri's Verification Module, Module 4,
 *     can call this directly instead of re-implementing hash comparison.)
 */

function addBlock(req, res) {
  try {
    const { certificateId, studentName, certificateHash, issueDate, course, grade, status } = req.body;
    const certPayload = { certificateId, studentName, certificateHash, issueDate };
    if (course) certPayload.course = course;
    if (grade) certPayload.grade = grade;
    if (status) certPayload.status = status;

    const newBlock = blockchain.addBlock(certPayload);
    return res.status(201).json({ success: true, block: newBlock });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

function getChain(req, res) {
  return res.status(200).json({ success: true, length: blockchain.chain.length, chain: blockchain.getFullChain() });
}

function validateChain(req, res) {
  const result = blockchain.isChainValid();
  return res.status(200).json({ success: true, ...result });
}

function getRecordByCertificateId(req, res) {
  const { certificateId } = req.params;
  const block = blockchain.getBlockByCertificateId(certificateId);
  if (!block) {
    return res.status(404).json({ success: false, message: 'No blockchain record found for this certificate ID' });
  }
  return res.status(200).json({ success: true, block });
}

async function verifyCertificate(req, res) {
  try {
    const { certificateId } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No certificate file uploaded' });
    }
    if (!certificateId) {
      return res.status(400).json({ success: false, message: 'certificateId is required' });
    }

    const uploadedHash = generateHashFromFile(req.file.path);
    fs.unlink(req.file.path, () => {});

    const block = blockchain.getBlockByCertificateId(certificateId);
    if (!block) {
      return res.status(404).json({
        success: true,
        verified: false,
        reason: 'No matching certificate ID found on the blockchain',
      });
    }

    const isMatch = compareHashes(uploadedHash, block.data.certificateHash);

    return res.status(200).json({
      success: true,
      verified: isMatch,
      reason: isMatch ? 'Hashes match - certificate is genuine' : 'Hash mismatch - certificate has been modified or is counterfeit',
      uploadedHash,
      originalHash: block.data.certificateHash,
      certificateRecord: block.data,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  addBlock,
  getChain,
  validateChain,
  getRecordByCertificateId,
  verifyCertificate,
};
