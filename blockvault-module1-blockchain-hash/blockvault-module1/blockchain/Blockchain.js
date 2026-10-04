const fs = require('fs');
const path = require('path');
const Block = require('./Block');

const LEDGER_FILE = path.join(__dirname, '..', 'data', 'blockchain_ledger.json');
const DIFFICULTY = 2; // PoW difficulty - keep low for fast demo performance

/**
 * Blockchain.js
 * -------------
 * A private, permissioned blockchain that only this backend (BlockVault
 * server) can write to. It is NOT a public chain like Ethereum - there's
 * no consensus between multiple nodes, which matches the synopsis
 * ("Private Blockchain" under Technology Stack).
 *
 * Responsibilities:
 *   - Maintain the chain in memory
 *   - Persist the chain to disk (blockchain_ledger.json) so it survives
 *     server restarts, AND optionally mirror each block into the Oracle
 *     DB table that Gauri (Module 2) creates, e.g. BLOCKCHAIN_LEDGER.
 *   - Add new blocks when a certificate is generated (called by
 *     Pranav's Certificate Generation Module after it creates a PDF + hash)
 *   - Validate the integrity of the whole chain
 *   - Look up a block by certificateId (called by the Verification Module)
 */
class Blockchain {
  constructor() {
    this.chain = this.loadChain() || [this.createGenesisBlock()];
    this.difficulty = DIFFICULTY;
  }

  createGenesisBlock() {
    const genesis = new Block(0, 1704067200000, {
      type: 'genesis',
      note: 'BlockVault Genesis Block — Immutable Academic Credential Ledger Initiated',
    }, '0');
    genesis.mineBlock(DIFFICULTY);
    return genesis;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Adds a new certificate record to the chain.
   * previousHash is strictly and automatically taken from the latest block's hash.
   * @param {Object} certData - { certificateId, studentName, certificateHash, issueDate, ... }
   * @returns {Block} the newly mined block
   */
  addBlock(certData) {
    this.validateCertData(certData);

    const latestBlock = this.getLatestBlock();
    if (!latestBlock) {
      throw new Error('Genesis block missing, cannot add block');
    }
    const previousHash = latestBlock.hash;

    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      certData,
      previousHash
    );

    newBlock.mineBlock(this.difficulty);

    // Guarantee current block's hash does not equal its own previous hash
    while (newBlock.hash === newBlock.previousHash) {
      newBlock.nonce++;
      newBlock.mineBlock(this.difficulty);
    }

    this.chain.push(newBlock);
    this.saveChain();

    return newBlock;
  }

  validateCertData(certData) {
    const required = ['certificateId', 'studentName', 'certificateHash', 'issueDate'];
    const missing = required.filter((field) => !certData || !certData[field]);
    if (missing.length) {
      throw new Error(`Missing required certificate fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Walks the entire chain and checks:
   *   1. Genesis block validity (index 0, previousHash "0", valid hash)
   *   2. Each block's stored hash still matches a freshly recalculated hash
   *      (detects tampering with block content)
   *   3. Each block's previousHash correctly matches the immediately prior block's hash
   *      (detects blocks being removed / reordered / inserted)
   *   4. Current block's hash does not equal its own previousHash
   */
  isChainValid() {
    if (!this.chain || this.chain.length === 0) {
      return { valid: false, reason: 'Blockchain is empty' };
    }

    // Genesis Block check
    const genesis = this.chain[0];
    if (genesis.index !== 0) {
      return { valid: false, brokenAtIndex: 0, reason: 'Genesis block must have index 0' };
    }
    if (genesis.previousHash !== '0') {
      return { valid: false, brokenAtIndex: 0, reason: 'Genesis block previousHash must be "0"' };
    }
    if (genesis.hash !== genesis.calculateHash()) {
      return { valid: false, brokenAtIndex: 0, reason: 'Genesis block content has been tampered with' };
    }

    // All blocks after Genesis
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // Check index continuity
      if (current.index !== i) {
        return { valid: false, brokenAtIndex: i, reason: `Block index mismatch: expected ${i}, found ${current.index}` };
      }

      // Check content tampering (SHA-256 hash recalculation)
      if (current.hash !== current.calculateHash()) {
        return { valid: false, brokenAtIndex: i, reason: `Block ${i} content has been tampered with` };
      }

      // Check chain linking: previousHash must match the immediately previous block's hash
      if (current.previousHash !== previous.hash) {
        return {
          valid: false,
          brokenAtIndex: i,
          reason: `Chain link broken: Block ${i} previousHash does not match Block ${i - 1} hash`,
        };
      }

      // Ensure block hash does not equal its previousHash
      if (current.hash === current.previousHash) {
        return { valid: false, brokenAtIndex: i, reason: `Block ${i} hash cannot equal its own previousHash` };
      }
    }

    return { valid: true, chainLength: this.chain.length, message: 'Blockchain is intact and cryptographically valid' };
  }

  /**
   * Finds the block matching a given certificateId.
   * Used by the Verification Module to fetch the "original" hash
   * to compare against a freshly computed hash of an uploaded file.
   */
  getBlockByCertificateId(certificateId) {
    return this.chain.find((block) => block.data && block.data.certificateId === certificateId) || null;
  }

  getFullChain() {
    return this.chain;
  }

  // ---------- Persistence (file-based; swap/extend for Oracle in db.js) ----------

  saveChain() {
    try {
      fs.mkdirSync(path.dirname(LEDGER_FILE), { recursive: true });
      fs.writeFileSync(LEDGER_FILE, JSON.stringify(this.chain, null, 2));
    } catch (err) {
      console.error('Failed to persist blockchain ledger to disk:', err.message);
    }
  }

  loadChain() {
    try {
      if (fs.existsSync(LEDGER_FILE)) {
        const raw = fs.readFileSync(LEDGER_FILE, 'utf-8');
        const parsedBlocks = JSON.parse(raw);
        if (Array.isArray(parsedBlocks) && parsedBlocks.length > 0) {
          // Rehydrate plain objects back into Block instances so calculateHash() works
          const blocks = parsedBlocks.map((b) => {
            const block = new Block(b.index, b.timestamp, b.data, b.previousHash);
            block.nonce = b.nonce;
            block.hash = b.hash;
            return block;
          });

          // Verify and correct any existing ledger records with broken previous-hash links
          let needsResave = false;
          if (blocks[0].previousHash !== '0' || blocks[0].hash !== blocks[0].calculateHash()) {
            blocks[0].previousHash = '0';
            blocks[0].mineBlock(this.difficulty);
            needsResave = true;
          }

          for (let i = 1; i < blocks.length; i++) {
            const current = blocks[i];
            const previous = blocks[i - 1];

            if (
              current.previousHash !== previous.hash ||
              current.hash !== current.calculateHash() ||
              current.hash === current.previousHash
            ) {
              current.previousHash = previous.hash;
              current.mineBlock(this.difficulty);
              needsResave = true;
            }
          }

          if (needsResave) {
            console.log('Auto-corrected ledger records to ensure valid previous-hash links.');
            try {
              fs.writeFileSync(LEDGER_FILE, JSON.stringify(blocks, null, 2));
            } catch (err) {
              console.error('Failed to save repaired ledger:', err.message);
            }
          }

          return blocks;
        }
      }
    } catch (err) {
      console.error('Failed to load existing ledger, starting fresh:', err.message);
    }
    return null;
  }
}

// Export a singleton instance - the whole app shares ONE chain in memory
module.exports = new Blockchain();
