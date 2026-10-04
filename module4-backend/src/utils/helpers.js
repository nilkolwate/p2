const crypto = require('crypto');
const AppError = require('./AppError');

const CERT_ID_REGEX = /^[A-Za-z0-9_-]{3,50}$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/** SHA-256 hex digest of a Buffer/string. Must match Module 1's hash generation. */
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

function assertCertificateId(id) {
  if (typeof id !== 'string' || !CERT_ID_REGEX.test(id)) {
    throw new AppError('Invalid certificate ID format', 400, 'INVALID_CERTIFICATE_ID');
  }
  return id;
}

/**
 * Extract a certificate ID from QR content. Supports:
 *  - raw ID:              CERT-2026-0001
 *  - URL with query:      https://site/verify?id=CERT-2026-0001  (or certificateId / cert)
 *  - URL with path:       https://site/verify/CERT-2026-0001
 *  - JSON string:         {"certificateId":"CERT-2026-0001"}
 */
function parseQrPayload(payload) {
  if (typeof payload !== 'string' || !payload.trim()) {
    throw new AppError('QR data is required', 400, 'INVALID_QR');
  }
  const text = payload.trim();
  let candidate = text;

  if (text.startsWith('{')) {
    try {
      const obj = JSON.parse(text);
      candidate = obj.certificateId || obj.certId || obj.id;
    } catch (_) {
      throw new AppError('Malformed QR JSON', 400, 'INVALID_QR');
    }
  } else if (/^https?:\/\//i.test(text)) {
    try {
      const url = new URL(text);
      candidate =
        url.searchParams.get('id') ||
        url.searchParams.get('certificateId') ||
        url.searchParams.get('cert') ||
        url.pathname.split('/').filter(Boolean).pop();
    } catch (_) {
      throw new AppError('Malformed QR URL', 400, 'INVALID_QR');
    }
  }
  return assertCertificateId(candidate);
}

function assertDate(value, field) {
  if (value === undefined || value === '') return null;
  if (!DATE_REGEX.test(value)) {
    throw new AppError(`${field} must be YYYY-MM-DD`, 400, 'INVALID_DATE');
  }
  return value;
}

function parsePaging(query, defLimit = 20, maxLimit = 100) {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || defLimit, 1), maxLimit);
  return { page, limit, offset: (page - 1) * limit };
}

function toCsv(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = v instanceof Date ? v.toISOString() : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(','), ...rows.map((r) => headers.map((h) => esc(r[h])).join(','))].join('\n');
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = {
  sha256, assertCertificateId, parseQrPayload, assertDate, parsePaging, toCsv, asyncHandler,
};
