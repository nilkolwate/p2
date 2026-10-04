const fs = require('fs');
const { generateHashFromFile, compareHashes } = require('../hash/hashGenerator');

/**
 * hashController.js
 * ------------------
 * POST /api/hash/generate
 *   Accepts an uploaded certificate PDF, returns its SHA-256 hash.
 *   Called internally by Pranav's Certificate Generation Module right
 *   after a new certificate PDF is created (server-to-server or same
 *   process function call), and by the Verification Module whenever a
 *   user uploads a certificate to check.
 *
 * POST /api/hash/compare
 *   Given two hashes (or a hash + certificateId to look up), returns
 *   whether they match. Thin convenience wrapper - the real lookup
 *   against blockchain records happens in blockchainController.
 */

async function generateHash(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const hash = generateHashFromFile(req.file.path);

    // Clean up the temp file now that we have the hash
    fs.unlink(req.file.path, () => {});

    return res.status(200).json({
      success: true,
      hash,
      algorithm: 'SHA-256',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

function compareHashesController(req, res) {
  const { hashA, hashB } = req.body;
  if (!hashA || !hashB) {
    return res.status(400).json({ success: false, message: 'Both hashA and hashB are required' });
  }
  const match = compareHashes(hashA, hashB);
  return res.status(200).json({ success: true, match });
}

module.exports = { generateHash, compareHashesController };
