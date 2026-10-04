const router = require('express').Router();
const crypto = require('crypto');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const { authenticate } = require('../middleware/auth');
const { asyncHandler, parsePaging } = require('../utils/helpers');
const notifications = require('../services/notification.service');

/**
 * INTERNAL: lets other modules (e.g. Module 3 after issuing a certificate) push a notification.
 * Protected by x-api-key header, NOT by user JWT.
 * POST /api/notifications/internal/send
 * body: { userId, type, title, message, email?, sendMail? }
 */
router.post('/internal/send', asyncHandler(async (req, res) => {
  const key = String(req.get('x-api-key') || '');
  const expected = String(env.internalApiKey || '');
  const ok = expected && key.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(key), Buffer.from(expected));
  if (!ok) throw new AppError('Invalid API key', 401, 'INVALID_API_KEY');

  const { userId, type = 'INFO', title, message, email = null, sendMail = false } = req.body || {};
  if (!userId || !title || !message) throw new AppError('userId, title and message are required', 400, 'VALIDATION_ERROR');
  await notifications.create({ userId: Number(userId), type, title, message, email, sendMail });
  res.status(201).json({ success: true, data: { sent: true } });
}));

// ---- user-facing (JWT) ----
router.use(authenticate);

// GET /api/notifications?unread=true&page=&limit=
router.get('/', asyncHandler(async (req, res) => {
  const paging = parsePaging(req.query);
  const { items, total } = await notifications.listForUser(req.user.id, {
    unreadOnly: req.query.unread === 'true', limit: paging.limit, offset: paging.offset,
  });
  res.json({ success: true, data: items, meta: { total, page: paging.page, limit: paging.limit } });
}));

// GET /api/notifications/unread-count
router.get('/unread-count', asyncHandler(async (req, res) => {
  res.json({ success: true, data: { unread: await notifications.unreadCount(req.user.id) } });
}));

// PATCH /api/notifications/read-all
router.patch('/read-all', asyncHandler(async (req, res) => {
  res.json({ success: true, data: { updated: await notifications.markAllRead(req.user.id) } });
}));

// PATCH /api/notifications/:id/read
router.patch('/:id/read', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!id) throw new AppError('Invalid notification id', 400, 'VALIDATION_ERROR');
  await notifications.markRead(req.user.id, id);
  res.json({ success: true, data: { read: true } });
}));

module.exports = router;
