const express = require('express');

/**
 * teammateRoutes.js
 * ------------------
 * TEMPORARY placeholder routes for the modules owned by your teammates.
 * This lets the server run end-to-end and lets you demo/test your
 * blockchain + hash flow WITHOUT waiting for their code.
 *
 * When each teammate finishes their module, replace the matching
 * router below with their real router file (see comments), e.g.:
 *   const authRoutes = require('../authRoutes');       // Gauri Agraval
 *   const certificateRoutes = require('../certificateRoutes'); // Pranav
 *   const qrRoutes = require('../qrRoutes');                   // Pranav
 *   const verificationRoutes = require('../verificationRoutes'); // Gauri
 *   const dashboardRoutes = require('../dashboardRoutes');       // Gauri
 *   const notificationRoutes = require('../notificationRoutes'); // Gauri
 */

function placeholder(name) {
  const router = express.Router();
  router.all('*', (req, res) => {
    res.status(501).json({
      success: false,
      message: `[${name}] not implemented yet - this is a placeholder from Module 1's integration skeleton.`,
    });
  });
  return router;
}

module.exports = {
  authRoutes: placeholder('Authentication Module (Gauri Agraval)'),
  certificateRoutes: placeholder('Certificate Generation Module (Pranav)'),
  qrRoutes: placeholder('QR Code Module (Pranav)'),
  verificationRoutes: placeholder('Verification Module (Gauri)'),
  dashboardRoutes: placeholder('Dashboard/Reports Module (Gauri)'),
  notificationRoutes: placeholder('Notification Module (Gauri)'),
};
