const oracledb = require('oracledb');
require('dotenv').config();

/**
 * db.js
 * -----
 * Oracle DB connection pool.
 *
 * NOTE FOR THE TEAM: Gauri (Module 2) owns the actual schema design.
 * This file just sets up the connection pool so every module (auth,
 * certificates, blockchain mirror, verification logs) can pull a
 * connection from the same pool instead of each opening its own.
 *
 * Suggested table this Blockchain Module will read/write to once the
 * schema is finalized (confirm exact name/columns with Gauri):
 *
 *   CREATE TABLE BLOCKCHAIN_LEDGER (
 *     ID               NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 *     BLOCK_INDEX      NUMBER NOT NULL,
 *     CERTIFICATE_ID   VARCHAR2(100) NOT NULL,
 *     STUDENT_NAME     VARCHAR2(200) NOT NULL,
 *     CERTIFICATE_HASH VARCHAR2(64)  NOT NULL,   -- SHA-256 = 64 hex chars
 *     PREVIOUS_HASH    VARCHAR2(64)  NOT NULL,
 *     BLOCK_HASH       VARCHAR2(64)  NOT NULL,
 *     NONCE            NUMBER,
 *     ISSUE_DATE       DATE NOT NULL,
 *     CREATED_AT       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 *   );
 *
 * Until the schema is live, the Blockchain Module works fully standalone
 * using the JSON file ledger (blockchain/Blockchain.js -> data/blockchain_ledger.json)
 * so you're not blocked waiting on Module 2.
 */

let pool;

async function initPool() {
  try {
    pool = await oracledb.createPool({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECT_STRING, // e.g. localhost:1521/XEPDB1
      poolMin: 2,
      poolMax: 10,
      poolIncrement: 1,
    });
    console.log('Oracle DB connection pool created successfully.');
  } catch (err) {
    console.error('Failed to create Oracle DB pool:', err.message);
    console.warn('Server will continue running - blockchain/hash modules do not require DB to function.');
  }
}

async function getConnection() {
  if (!pool) throw new Error('DB pool not initialized. Call initPool() first.');
  return pool.getConnection();
}

async function closePool() {
  if (pool) await pool.close(10);
}

module.exports = { initPool, getConnection, closePool };
