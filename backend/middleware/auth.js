const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Validates the Bearer token in the Authorization header.
 * Attaches decoded payload to req.user if valid.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: No authorization token provided.',
    });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Malformed authorization header.',
    });
  }

  const secret = process.env.JWT_SECRET || 'blockvault_jwt_secret_key_2026';

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Access Denied: Invalid or expired token. Please log in again.',
    });
  }
}

module.exports = requireAuth;
