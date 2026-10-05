/**
 * authRoutes.js — Production Admin Authentication Module
 * 
 * Endpoints:
 *   POST /api/auth/login (and /admin-login) — Verifies credentials against environment variables and issues JWT
 */

const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();

/**
 * POST /api/auth/login or POST /admin-login
 * Authenticates administrator credentials and returns an 8-hour JWT token.
 */
router.post(['/login', '/admin-login'], (req, res) => {
  const { username, email, password } = req.body;
  const inputIdentifier = (username || email || '').trim();
  const inputPassword = (password || '').trim();

  if (!inputIdentifier || !inputPassword) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.',
    });
  }

  // Load configured admin credentials from environment variables
  const configuredUser = (process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || '').trim();
  const configuredEmail = (process.env.ADMIN_EMAIL || '').trim();
  const configuredPass = (process.env.ADMIN_PASSWORD || '').trim();

  // Validate credentials against environment
  const isUsernameMatch =
    (configuredUser && inputIdentifier.toLowerCase() === configuredUser.toLowerCase()) ||
    (configuredEmail && inputIdentifier.toLowerCase() === configuredEmail.toLowerCase()) ||
    (configuredUser.toLowerCase() === 'administrator' && inputIdentifier.toLowerCase() === 'admin');

  const isPasswordMatch = configuredPass && inputPassword === configuredPass;

  if (!isUsernameMatch || !isPasswordMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password. Access Denied.',
    });
  }

  // Sign JWT valid for 8 hours
  const secret = process.env.JWT_SECRET || 'blockvault_jwt_secret_key_2026';
  const token = jwt.sign(
    {
      username: inputIdentifier,
      role: 'admin',
    },
    secret,
    { expiresIn: '8h' }
  );

  return res.json({
    success: true,
    message: 'Authentication successful.',
    token,
    user: {
      username: inputIdentifier,
      role: 'admin',
      displayName: inputIdentifier,
    },
  });
});

/**
 * GET /api/auth/me (or /me)
 * Validates the currently supplied JWT token and returns admin profile.
 */
const requireAuth = require('../middleware/auth');

router.get(['/me', '/verify-token'], requireAuth, (req, res) => {
  return res.json({
    success: true,
    message: 'Token is valid and active.',
    user: req.user,
  });
});

module.exports = router;

