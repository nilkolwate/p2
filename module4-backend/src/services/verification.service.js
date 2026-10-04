const db = require('../config/db');
const blockchain = require('./blockchain.service');
const notifications = require('./notification.service');
const { sha256, assertCertificateId } = require('../utils/helpers');

const CERT_COLUMNS = `CERTIFICATE_ID, STUDENT_NAME, COURSE, ISSUE_DATE, ISSUER_ID,
                      CERT_HASH, BLOCK_INDEX, TX_HASH, STATUS`;

const findById = (id) =>
  db.queryOne(`SELECT ${CERT_COLUMNS} FROM CERTIFICATES WHERE CERTIFICATE_ID = :id`, { id });

const findByHash = (hash) =>
  db.queryOne(`SELECT ${CERT_COLUMNS} FROM CERTIFICATES WHERE LOWER(CERT_HASH) = :hash`, { hash });

async function logVerification({ certificateId, method, status, ip, userAgent, details }) {
  await db.execute(
    `INSERT INTO VERIFICATION_LOGS (CERTIFICATE_ID, METHOD, STATUS, IP_ADDRESS, USER_AGENT, DETAILS)
     VALUES (:certificateId, :method, :status, :ip, :userAgent, :details)`,
    {
      certificateId: certificateId || null,
      method,
      status,
      ip: ip ? String(ip).slice(0, 64) : null,
      userAgent: userAgent ? String(userAgent).slice(0, 255) : null,
      details: details ? JSON.stringify(details) : null,
    }
  );
}

/**
 * Core verification.
 *  - certificateId only          -> checks DB record + blockchain hash
 *  - fileBuffer (+/- id)         -> also hashes the uploaded PDF and compares
 *  - fileBuffer without id       -> looks the certificate up by file hash
 *
 * Result status: VALID | TAMPERED | REVOKED | NOT_FOUND
 */
async function verify({ certificateId, fileBuffer, method, ip, userAgent }) {
  if (certificateId) assertCertificateId(certificateId);

  const uploadedHash = fileBuffer ? sha256(fileBuffer) : null;
  let cert = null;
  if (certificateId) cert = await findById(certificateId);
  else if (uploadedHash) cert = await findByHash(uploadedHash);

  const checks = {
    certificateFound: !!cert,
    fileHashMatchesRecord: null,
    blockchainChecked: false,
    blockchainMatchesRecord: null,
    revoked: null,
  };
  let status;
  let reason;

  if (!cert) {
    status = 'NOT_FOUND';
    reason = uploadedHash && !certificateId
      ? 'No issued certificate matches this file'
      : 'No certificate exists with this ID';
  } else {
    const recordHash = String(cert.certHash || '').toLowerCase();
    checks.revoked = cert.status === 'REVOKED';

    if (uploadedHash) checks.fileHashMatchesRecord = uploadedHash === recordHash;

    const chain = await blockchain.getHash(cert.certificateId);
    checks.blockchainChecked = chain.checked;
    if (chain.checked) checks.blockchainMatchesRecord = chain.found && chain.hash === recordHash;

    if (checks.fileHashMatchesRecord === false) {
      status = 'TAMPERED';
      reason = 'Uploaded file does not match the hash issued for this certificate';
    } else if (checks.blockchainMatchesRecord === false) {
      status = 'TAMPERED';
      reason = 'Database record does not match the hash stored on the blockchain';
    } else if (checks.revoked) {
      status = 'REVOKED';
      reason = 'This certificate has been revoked by the issuer';
    } else {
      status = 'VALID';
      reason = checks.blockchainChecked
        ? 'Certificate is authentic and verified against the blockchain'
        : 'Certificate matches our records (blockchain check unavailable)';
    }
  }

  const result = {
    certificateId: cert?.certificateId || certificateId || null,
    status,
    reason,
    verifiedAt: new Date().toISOString(),
    checks,
    certificate: cert && status !== 'NOT_FOUND'
      ? {
          studentName: cert.studentName,
          course: cert.course,
          issueDate: cert.issueDate,
          blockIndex: cert.blockIndex,
          txHash: cert.txHash,
        }
      : null,
  };

  await logVerification({
    certificateId: result.certificateId, method, status, ip, userAgent, details: { reason, checks },
  });
  // fire-and-forget so verification response is never delayed by email/DB alerts
  notifications.notifyVerification({ result, certificate: cert, method });

  return result;
}

module.exports = { verify };
