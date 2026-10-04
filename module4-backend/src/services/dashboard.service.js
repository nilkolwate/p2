const db = require('../config/db');
const env = require('../config/env');

/** ISSUER users only see data for certificates they issued. ADMIN sees everything. */
function scope(user) {
  if (user.role === env.issuerRole) {
    return { sql: ' AND c.ISSUER_ID = :scopeIssuer', binds: { scopeIssuer: user.id } };
  }
  return { sql: '', binds: {} };
}

async function summary(user) {
  const s = scope(user);
  const certs = await db.queryOne(
    `SELECT COUNT(*) AS TOTAL,
            NVL(SUM(CASE WHEN c.STATUS = 'ACTIVE'  THEN 1 ELSE 0 END), 0) AS ACTIVE_COUNT,
            NVL(SUM(CASE WHEN c.STATUS = 'REVOKED' THEN 1 ELSE 0 END), 0) AS REVOKED_COUNT
       FROM CERTIFICATES c WHERE 1 = 1 ${s.sql}`, s.binds);

  const ver = await db.queryOne(
    `SELECT COUNT(*) AS TOTAL,
            NVL(SUM(CASE WHEN l.STATUS = 'VALID'     THEN 1 ELSE 0 END), 0) AS VALID_COUNT,
            NVL(SUM(CASE WHEN l.STATUS = 'TAMPERED'  THEN 1 ELSE 0 END), 0) AS TAMPERED_COUNT,
            NVL(SUM(CASE WHEN l.STATUS = 'REVOKED'   THEN 1 ELSE 0 END), 0) AS REVOKED_COUNT,
            NVL(SUM(CASE WHEN l.STATUS = 'NOT_FOUND' THEN 1 ELSE 0 END), 0) AS NOT_FOUND_COUNT,
            NVL(SUM(CASE WHEN l.VERIFIED_AT >= SYSTIMESTAMP - INTERVAL '1' DAY THEN 1 ELSE 0 END), 0) AS LAST_24H
       FROM VERIFICATION_LOGS l
       LEFT JOIN CERTIFICATES c ON c.CERTIFICATE_ID = l.CERTIFICATE_ID
      WHERE 1 = 1 ${s.sql}`, s.binds);

  return {
    certificates: { total: certs.total, active: certs.activeCount, revoked: certs.revokedCount },
    verifications: {
      total: ver.total, valid: ver.validCount, tampered: ver.tamperedCount,
      revoked: ver.revokedCount, notFound: ver.notFoundCount, last24h: ver.last24h,
    },
  };
}

async function trends(user, days) {
  const s = scope(user);
  return db.query(
    `SELECT TO_CHAR(TRUNC(l.VERIFIED_AT), 'YYYY-MM-DD') AS DAY, l.STATUS, COUNT(*) AS COUNT
       FROM VERIFICATION_LOGS l
       LEFT JOIN CERTIFICATES c ON c.CERTIFICATE_ID = l.CERTIFICATE_ID
      WHERE l.VERIFIED_AT >= TRUNC(SYSDATE) - :days ${s.sql}
      GROUP BY TRUNC(l.VERIFIED_AT), l.STATUS
      ORDER BY TRUNC(l.VERIFIED_AT)`, { days, ...s.binds });
}

async function topCertificates(user, limit = 10) {
  const s = scope(user);
  return db.query(
    `SELECT c.CERTIFICATE_ID, c.STUDENT_NAME, c.COURSE, COUNT(*) AS VERIFICATION_COUNT
       FROM VERIFICATION_LOGS l
       JOIN CERTIFICATES c ON c.CERTIFICATE_ID = l.CERTIFICATE_ID
      WHERE 1 = 1 ${s.sql}
      GROUP BY c.CERTIFICATE_ID, c.STUDENT_NAME, c.COURSE
      ORDER BY COUNT(*) DESC FETCH FIRST :limit ROWS ONLY`, { limit, ...s.binds });
}

async function recentActivity(user, limit = 10) {
  const s = scope(user);
  return db.query(
    `SELECT l.LOG_ID, l.CERTIFICATE_ID, l.METHOD, l.STATUS, l.VERIFIED_AT
       FROM VERIFICATION_LOGS l
       LEFT JOIN CERTIFICATES c ON c.CERTIFICATE_ID = l.CERTIFICATE_ID
      WHERE 1 = 1 ${s.sql}
      ORDER BY l.VERIFIED_AT DESC FETCH FIRST :limit ROWS ONLY`, { limit, ...s.binds });
}

/** Detailed verification report with filters + paging. */
async function verificationReport(user, { from, to, status, certificateId, limit, offset }) {
  const s = scope(user);
  let where = ` WHERE 1 = 1 ${s.sql}`;
  const binds = { ...s.binds };
  if (from) { where += ` AND l.VERIFIED_AT >= TO_DATE(:fromDate, 'YYYY-MM-DD')`; binds.fromDate = from; }
  if (to) { where += ` AND l.VERIFIED_AT < TO_DATE(:toDate, 'YYYY-MM-DD') + 1`; binds.toDate = to; }
  if (status) { where += ` AND l.STATUS = :status`; binds.status = status; }
  if (certificateId) { where += ` AND l.CERTIFICATE_ID = :certId`; binds.certId = certificateId; }

  const base = `FROM VERIFICATION_LOGS l LEFT JOIN CERTIFICATES c ON c.CERTIFICATE_ID = l.CERTIFICATE_ID ${where}`;
  const total = (await db.queryOne(`SELECT COUNT(*) AS TOTAL ${base}`, binds)).total;

  const paging = limit ? ` OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY` : '';
  const pageBinds = limit ? { ...binds, offset, limit } : binds;
  const rows = await db.query(
    `SELECT l.LOG_ID, l.CERTIFICATE_ID, c.STUDENT_NAME, c.COURSE, l.METHOD, l.STATUS,
            l.IP_ADDRESS, l.VERIFIED_AT
       ${base} ORDER BY l.VERIFIED_AT DESC ${paging}`, pageBinds);
  return { total, rows };
}

/** Issued-certificates report with verification counts. */
async function certificateReport(user, { from, to, status, limit, offset }) {
  const s = scope(user);
  let where = ` WHERE 1 = 1 ${s.sql}`;
  const binds = { ...s.binds };
  if (from) { where += ` AND c.ISSUE_DATE >= TO_DATE(:fromDate, 'YYYY-MM-DD')`; binds.fromDate = from; }
  if (to) { where += ` AND c.ISSUE_DATE < TO_DATE(:toDate, 'YYYY-MM-DD') + 1`; binds.toDate = to; }
  if (status) { where += ` AND c.STATUS = :status`; binds.status = status; }

  const total = (await db.queryOne(`SELECT COUNT(*) AS TOTAL FROM CERTIFICATES c ${where}`, binds)).total;
  const paging = limit ? ` OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY` : '';
  const pageBinds = limit ? { ...binds, offset, limit } : binds;
  const rows = await db.query(
    `SELECT c.CERTIFICATE_ID, c.STUDENT_NAME, c.COURSE, c.ISSUE_DATE, c.STATUS, c.ISSUER_ID,
            (SELECT COUNT(*) FROM VERIFICATION_LOGS l WHERE l.CERTIFICATE_ID = c.CERTIFICATE_ID) AS VERIFICATION_COUNT
       FROM CERTIFICATES c ${where} ORDER BY c.ISSUE_DATE DESC ${paging}`, pageBinds);
  return { total, rows };
}

module.exports = { summary, trends, topCertificates, recentActivity, verificationReport, certificateReport };
