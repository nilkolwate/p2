/**
 * Adapter for Module 1 (Blockchain). Module 4 only needs ONE thing from it:
 * "what hash is stored on-chain for this certificate ID?"
 *
 * Contract expected from Module 1 when BLOCKCHAIN_MODE=http:
 *   GET {BLOCKCHAIN_API_URL}/certificates/:certificateId
 *   200 -> { "hash": "<sha256 hex>" }        (optionally also blockIndex, txHash)
 *   404 -> certificate not on chain
 *
 * If Module 1 is a Node library instead of an HTTP service, replace getHash()
 * below with a direct function call - nothing else in Module 4 needs to change.
 */
const env = require('../config/env');

/** @returns {Promise<{checked:boolean, found:boolean, hash:string|null, error?:string}>} */
async function getHash(certificateId) {
  if (env.blockchain.mode !== 'http') {
    return { checked: false, found: false, hash: null };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.blockchain.timeoutMs);
  try {
    const res = await fetch(
      `${env.blockchain.apiUrl}/certificates/${encodeURIComponent(certificateId)}`,
      { signal: controller.signal }
    );
    if (res.status === 404) return { checked: true, found: false, hash: null };
    if (!res.ok) throw new Error(`Blockchain service responded ${res.status}`);
    const body = await res.json();
    const hash = (body.hash || body.data?.hash || '').toLowerCase() || null;
    return { checked: true, found: !!hash, hash };
  } catch (err) {
    // Chain unreachable: do not crash verification, report that chain was not checked.
    return { checked: false, found: false, hash: null, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { getHash };
