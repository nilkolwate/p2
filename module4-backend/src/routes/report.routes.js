const router = require('express').Router();
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler, assertDate, assertCertificateId, parsePaging, toCsv } = require('../utils/helpers');
const dashboard = require('../services/dashboard.service');

router.use(authenticate, authorize(env.adminRole, env.issuerRole));

const VERIFY_STATUSES = ['VALID', 'TAMPERED', 'REVOKED', 'NOT_FOUND'];
const CERT_STATUSES = ['ACTIVE', 'REVOKED'];

function respond(req, res, name, { total, rows }, paging) {
  if (req.query.format === 'csv') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${name}-${Date.now()}.csv"`);
    return res.send(toCsv(rows));
  }
  res.json({
    success: true,
    data: rows,
    meta: { total, page: paging.page, limit: paging.limit, pages: Math.ceil(total / paging.limit) },
  });
}

// GET /api/reports/verifications?from=&to=&status=&certificateId=&page=&limit=&format=csv
router.get('/verifications', asyncHandler(async (req, res) => {
  const status = req.query.status ? String(req.query.status).toUpperCase() : null;
  if (status && !VERIFY_STATUSES.includes(status)) throw new AppError(`status must be one of ${VERIFY_STATUSES.join(', ')}`, 400, 'INVALID_STATUS');
  const certificateId = req.query.certificateId ? assertCertificateId(req.query.certificateId) : null;
  const paging = parsePaging(req.query);
  const csv = req.query.format === 'csv';

  const result = await dashboard.verificationReport(req.user, {
    from: assertDate(req.query.from, 'from'),
    to: assertDate(req.query.to, 'to'),
    status, certificateId,
    limit: csv ? null : paging.limit, offset: paging.offset,
  });
  respond(req, res, 'verification-report', result, paging);
}));

// GET /api/reports/certificates?from=&to=&status=&page=&limit=&format=csv
router.get('/certificates', asyncHandler(async (req, res) => {
  const status = req.query.status ? String(req.query.status).toUpperCase() : null;
  if (status && !CERT_STATUSES.includes(status)) throw new AppError(`status must be one of ${CERT_STATUSES.join(', ')}`, 400, 'INVALID_STATUS');
  const paging = parsePaging(req.query);
  const csv = req.query.format === 'csv';

  const result = await dashboard.certificateReport(req.user, {
    from: assertDate(req.query.from, 'from'),
    to: assertDate(req.query.to, 'to'),
    status,
    limit: csv ? null : paging.limit, offset: paging.offset,
  });
  respond(req, res, 'certificate-report', result, paging);
}));

module.exports = router;
