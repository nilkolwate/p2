/**
 * Quick sanity test for the Blockchain + Hash modules.
 * Run with: node test/blockchain.test.js
 *
 * NOT a full Jest suite - just a fast way to confirm the core logic
 * (add block, validate chain, detect tampering, hash comparison) works
 * before wiring it into the Express routes / teammates' modules.
 */
const fs = require('fs');
const path = require('path');

// Safely preserve real ledger during test run
const realLedgerPath = path.join(__dirname, '..', 'data', 'blockchain_ledger.json');
let realLedgerBackup = null;
if (fs.existsSync(realLedgerPath)) {
  realLedgerBackup = fs.readFileSync(realLedgerPath, 'utf-8');
}

// Ensure clean test file
if (fs.existsSync(realLedgerPath)) fs.unlinkSync(realLedgerPath);

const blockchain = require('../blockchain/Blockchain');
const { generateHashFromData, compareHashes } = require('../hash/hashGenerator');

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

console.log('--- BlockVault Module 1 sanity test ---\n');

// 1. Hash generation is deterministic
const h1 = generateHashFromData({ name: 'Riya Sharma', course: 'B.Tech CSE' });
const h2 = generateHashFromData({ name: 'Riya Sharma', course: 'B.Tech CSE' });
assert(h1 === h2, 'Same data produces the same SHA-256 hash');

// 2. Even a tiny change produces a totally different hash (avalanche effect)
const h3 = generateHashFromData({ name: 'Riya Sharma', course: 'B.Tech CSE ' }); // trailing space
assert(h1 !== h3, 'A tiny data change produces a different hash');

// 3. Add a block to the chain
const block = blockchain.addBlock({
  certificateId: 'CERT-TEST-001',
  studentName: 'Riya Sharma',
  certificateHash: h1,
  issueDate: '2026-09-07',
});
assert(block.hash && block.previousHash, 'New block was created with hash + previousHash');
assert(block.previousHash === blockchain.chain[blockchain.chain.length - 2].hash, 'previousHash matches previous block hash');
assert(block.hash !== block.previousHash, 'Block hash does not equal previousHash');

// 4. Chain validates as intact
const validBefore = blockchain.isChainValid();
assert(validBefore.valid === true, 'Chain is valid immediately after adding a block');

// 5. Lookup by certificate ID works
const found = blockchain.getBlockByCertificateId('CERT-TEST-001');
assert(found && found.data.studentName === 'Riya Sharma', 'Block lookup by certificateId works');

// 6. Tampering is detected
found.data.studentName = 'Hacked Name';
const validAfterTamper = blockchain.isChainValid();
assert(validAfterTamper.valid === false, 'Tampering with block data is detected by isChainValid()');

// 7. Hash comparison helper
assert(compareHashes(h1, h1) === true, 'compareHashes matches identical hashes');
assert(compareHashes(h1, h3) === false, 'compareHashes rejects different hashes');

console.log('\n--- test run complete ---');

// Restore real ledger so tests never destroy operational data
if (realLedgerBackup !== null) {
  fs.writeFileSync(realLedgerPath, realLedgerBackup);
  console.log('Restored production ledger successfully.');
}
