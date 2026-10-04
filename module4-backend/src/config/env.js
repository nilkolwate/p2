require('dotenv').config();

const env = {
  port: Number(process.env.PORT) || 5004,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  db: {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECT_STRING,
  },
  jwtSecret: process.env.JWT_SECRET,
  adminRole: (process.env.ADMIN_ROLE || 'ADMIN').toUpperCase(),
  issuerRole: (process.env.ISSUER_ROLE || 'ISSUER').toUpperCase(),
  blockchain: {
    mode: (process.env.BLOCKCHAIN_MODE || 'none').toLowerCase(),
    apiUrl: process.env.BLOCKCHAIN_API_URL,
    timeoutMs: Number(process.env.BLOCKCHAIN_TIMEOUT_MS) || 5000,
  },
  internalApiKey: process.env.INTERNAL_API_KEY,
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || 'no-reply@example.com',
  },
  verifyRateLimit: Number(process.env.VERIFY_RATE_LIMIT) || 60,
};

module.exports = env;
