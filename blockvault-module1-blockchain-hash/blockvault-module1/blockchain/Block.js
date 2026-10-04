const crypto = require('crypto');

/**
 * Block.js
 * ---------
 * Represents a single block in the BlockVault private blockchain.
 * Each block stores the essential certificate info (NOT the full PDF):
 *   - certificateId
 *   - studentName
 *   - certificateHash (SHA-256 fingerprint of the certificate PDF)
 *   - issueDate
 *
 * As per the synopsis (Methodology, Step 4 - Blockchain Storage):
 * "Instead of storing the entire certificate on the blockchain, the
 *  application stores only essential information such as Certificate ID,
 *  Student Name, SHA-256 Hash, and Issue Date."
 */
class Block {
  constructor(index, timestamp, data, previousHash = '') {
    this.index = index;                 // position of block in the chain
    this.timestamp = timestamp;         // when the block was created
    this.data = data;                   // { certificateId, studentName, certificateHash, issueDate }
    this.previousHash = previousHash;   // hash of the previous block (the "chain" link)
    this.nonce = 0;                     // used for simple proof-of-work
    this.hash = this.calculateHash();   // this block's own hash

    // Guarantee the current block's hash never equals its own previousHash
    while (this.hash === this.previousHash) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
  }

  /**
   * Computes SHA-256 hash of the block's contents.
   * Any change to index, timestamp, data, previousHash, or nonce
   * will completely change this hash - this is what makes the
   * chain tamper-evident.
   */
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

  /**
   * Simple Proof-of-Work: re-hash the block until the hash starts
   * with `difficulty` number of zeros and does not equal previousHash.
   */
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
