const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');

/**
 * Verifies the JWT issued by Module 2 (Authentication).
 * Accepts payload shapes: { id | userId | sub, email, role }
 */
function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next(new AppError('Authentication required', 401, 'NO_TOKEN'));

  try {
    const p = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: Number(p.id ?? p.userId ?? p.sub),
      email: p.email,
      role: String(p.role || '').toUpperCase(),
    };
    next();
  } catch (e) {
    next(new AppError('Invalid or expired token', 401, 'INVALID_TOKEN'));
  }
}

const authorize = (...roles) => (req, _res, next) => {
  const allowed = roles.map((r) => r.toUpperCase());
  if (!req.user || !allowed.includes(req.user.role)) {
    return next(new AppError('You do not have permission for this action', 403, 'FORBIDDEN'));
  }
  next();
};

module.exports = { authenticate, authorize };
