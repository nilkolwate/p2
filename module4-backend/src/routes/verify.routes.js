const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const env = require('../config/env');
const upload = require('../middleware/upload');
const AppError = require('../utils/AppError');
const { asyncHandler, parseQrPayload } = require('../utils/helpers');
const verification = require('../services/verification.service');

// PUBLIC endpoints (anyone scanning a QR must be able to verify) -> rate limited
router.use(rateLimit({
  windowMs: 60 * 1000,
  max: env.verifyRateLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many verification requests, try again shortly' } },
}));

const ctx = (req) => ({ ip: req.ip, userAgent: req.get('user-agent') });

// POST /api/verify/qr   body: { "qrData": "<text decoded from QR>" }
router.post('/qr', asyncHandler(async (req, res) => {
  const certificateId = parseQrPayload(req.body?.qrData);
  const data = await verification.verify({ certificateId, method: 'QR', ...ctx(req) });
  res.json({ success: true, data });
}));

// POST /api/verify/upload   multipart: file=<pdf>, certificateId=<optional>
router.post('/upload', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError('PDF file is required (field name: file)', 400, 'FILE_REQUIRED');
  const data = await verification.verify({
    certificateId: req.body?.certificateId || null,
    fileBuffer: req.file.buffer,
    method: 'UPLOAD',
    ...ctx(req),
  });
  res.json({ success: true, data });
}));

// GET /api/verify/:certificateId   (what the QR code URL should point to)
router.get('/:certificateId', asyncHandler(async (req, res) => {
  const data = await verification.verify({ certificateId: req.params.certificateId, method: 'ID', ...ctx(req) });
  res.json({ success: true, data });
}));

module.exports = router;
