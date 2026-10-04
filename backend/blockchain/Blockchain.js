const fs = require('fs');
const path = require('path');
const Block = require('./Block');

const DATA_DIR = path.join(__dirname, '..', 'data');
const LEDGER_FILE = path.join(DATA_DIR, 'blockchain_ledger.json');
const DIFFICULTY = 2;

class Blockchain {
  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    this.chain = this.loadChain() || [this.createGenesisBlock()];
    this.difficulty = DIFFICULTY;
  }

  createGenesisBlock() {
    const genesis = new Block(
      0,
      1704067200000,
      {
        type: 'genesis',
        note: 'BlockVault Genesis Block — Immutable Academic Credential Ledger Initiated',
        issuer: 'Government Polytechnic Amravati',
      },
      '0'
    );
    genesis.mineBlock(DIFFICULTY);
    return genesis;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(certData) {
    const latestBlock = this.getLatestBlock();
    const previousHash = latestBlock ? latestBlock.hash : '0';

    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      certData,
      previousHash
    );

    newBlock.mineBlock(this.difficulty);

    while (newBlock.hash === newBlock.previousHash) {
      newBlock.nonce++;
      newBlock.mineBlock(this.difficulty);
    }

    this.chain.push(newBlock);
    this.saveChain();

    return newBlock;
  }

  isChainValid() {
    if (!this.chain || this.chain.length === 0) {
      return { valid: false, reason: 'Blockchain is empty' };
    }

    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // Re-create a block instance to verify hash calculation
      const tempBlock = new Block(
        currentBlock.index,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.previousHash
      );
      tempBlock.nonce = currentBlock.nonce;

      if (currentBlock.hash !== tempBlock.calculateHash()) {
        return {
          valid: false,
          reason: `Block #${currentBlock.index} hash is invalid. Document or ledger tampered!`,
          tamperedBlockIndex: currentBlock.index,
        };
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return {
          valid: false,
          reason: `Block #${currentBlock.index} previousHash does not match Block #${previousBlock.index} hash.`,
          brokenLinkIndex: currentBlock.index,
        };
      }
    }

    return { valid: true, reason: 'All blockchain cryptographic anchors are authentic and valid.' };
  }

  getBlockByCertificateId(certificateId) {
    if (!certificateId) return null;
    return this.chain.find(
      (b) => b.data && (b.data.certificateId === certificateId || b.data.id === certificateId)
    );
  }

  loadChain() {
    try {
      if (fs.existsSync(LEDGER_FILE)) {
        const data = fs.readFileSync(LEDGER_FILE, 'utf8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Error loading blockchain ledger file:', err);
    }
    return null;
  }

  saveChain() {
    try {
      fs.writeFileSync(LEDGER_FILE, JSON.stringify(this.chain, null, 2), 'utf8');
    } catch (err) {
      console.error('Error saving blockchain ledger:', err);
    }
  }
}

const blockchainInstance = new Blockchain();
module.exports = blockchainInstance;
