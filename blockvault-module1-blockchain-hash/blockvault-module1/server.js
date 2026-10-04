const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const { initPool } = require('./config/db');

// ---- Your modules (Sayali) ----
const hashRoutes = require('./routes/hashRoutes');
const blockchainRoutes = require('./routes/blockchainRoutes');

// ---- Teammates' modules ----
// Swap each placeholder for the real router as your teammates finish
// their work (see routes/placeholders/teammateRoutes.js for instructions).
const {
  authRoutes,
  certificateRoutes,
  qrRoutes,
  verificationRoutes,
  dashboardRoutes,
  notificationRoutes,
} = require('./routes/placeholders/teammateRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Global Middleware ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ---------- Health check ----------
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'BlockVault API is running' });
});

// ---------- Route mounting (this IS the "overall integration") ----------
// Module 1 (Sayali) - fully implemented
app.use('/api/hash', hashRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Module 2 (Gauri Agraval) - Auth + DB
app.use('/api/auth', authRoutes);

// Module 3 (Pranav) - Certificate generation + QR
app.use('/api/certificates', certificateRoutes);
app.use('/api/qr', qrRoutes);

// Module 4 (Gauri) - Verification + Dashboard + Notifications
app.use('/api/verify', verificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// ---------- 404 handler ----------
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ---------- Global error handler ----------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// ---------- Start server ----------
async function start() {
  await initPool(); // does not block startup if Oracle isn't configured yet
  app.listen(PORT, () => {
    console.log(`BlockVault server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

start();

module.exports = app; // exported for testing (e.g. supertest)
