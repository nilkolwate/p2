const crypto = require('crypto');
const fs = require('fs');

/**
 * hashGenerator.js
 * ----------------
 * The Hash Generation Module (Module 3 in the synopsis).
 *
 * Two entry points are exposed:
 *   1. generateHashFromFile(filePath)   -> hash an actual certificate PDF
 *      Used right after Pranav's Certificate Generation Module creates the
 *      PDF, and again by the Verification Module whenever a user uploads
 *      a certificate to verify.
 *
 *   2. generateHashFromBuffer(buffer)   -> same, but for an in-memory file
 *      (e.g. multer file upload buffer, no need to write to disk first)
 *
 * Why SHA-256: per the synopsis, "even the smallest modification to the
 * certificate results in a completely different hash" - this is the
 * avalanche effect, and it's exactly what makes tamper detection possible.
 */

function generateHashFromBuffer(buffer) {
  if (!buffer) throw new Error('No file buffer provided for hashing');
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function generateHashFromFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }
  const fileBuffer = fs.readFileSync(filePath);
  return generateHashFromBuffer(fileBuffer);
}

/**
 * Optional helper: hash structured certificate metadata instead of a file.
 * Not used in the main flow (we hash the actual PDF), but handy for
 * testing/demo purposes or if the team decides to hash the raw data first.
 */
function generateHashFromData(dataObject) {
  const normalized = JSON.stringify(dataObject, Object.keys(dataObject).sort());
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Compares a freshly generated hash against a stored/original hash.
 * Case-insensitive, whitespace-trimmed comparison to avoid false negatives.
 */
function compareHashes(hashA, hashB) {
  if (!hashA || !hashB) return false;
  return hashA.trim().toLowerCase() === hashB.trim().toLowerCase();
}

module.exports = {
  generateHashFromBuffer,
  generateHashFromFile,
  generateHashFromData,
  compareHashes,
};
