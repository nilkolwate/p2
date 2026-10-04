const crypto = require('crypto');

/**
 * Block.js
 * Represents a single block in the BlockVault private blockchain ledger.
 * Stores essential cryptographic certificate anchors:
 *   - certificateId
 *   - studentName
 *   - certificateHash (SHA-256 digest of the PDF)
 *   - course
 *   - issueDate
 *   - status
 */
class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.data = data;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();

    while (this.hash === this.previousHash) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.timestamp +
        JSON.stringify(this.data) +
        this.previousHash +
        this.nonce
      )
      .digest('hex');
  }

  mineBlock(difficulty = 2) {
    const target = Array(difficulty + 1).join('0');
    while (this.hash.substring(0, difficulty) !== target || this.hash === this.previousHash) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    return this.hash;
  }
}

module.exports = Block;
