const router = require('express').Router();
const env = require('../config/env');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../utils/helpers');
const dashboard = require('../services/dashboard.service');

router.use(authenticate, authorize(env.adminRole, env.issuerRole));

// GET /api/dashboard/summary
router.get('/summary', asyncHandler(async (req, res) => {
  const [summary, recent, top] = await Promise.all([
    dashboard.summary(req.user),
    dashboard.recentActivity(req.user, 10),
    dashboard.topCertificates(req.user, 5),
  ]);
  res.json({ success: true, data: { ...summary, recentActivity: recent, topVerifiedCertificates: top } });
}));

// GET /api/dashboard/trends?days=30
router.get('/trends', asyncHandler(async (req, res) => {
  const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 365);
  res.json({ success: true, data: await dashboard.trends(req.user, days) });
}));

module.exports = router;
