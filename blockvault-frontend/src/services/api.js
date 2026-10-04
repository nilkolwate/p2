/**
 * BlockVault API Client Service
 * ================================
 * Centralised HTTP client for all backend calls.
 * Uses REACT_APP_API_URL env var, falling back to CRA's proxy (/api/...).
 */

const API_BASE = process.env.REACT_APP_API_URL || 'https://p2-c6yu.onrender.com/api';
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || API_BASE.replace(/\/api\/?$/, '') || 'https://p2-c6yu.onrender.com';

// ── Generic fetch wrapper with error handling ────────────────────────────
async function request(method, endpoint, body = null, isFormData = false) {
  const headers = isFormData ? {} : { 'Content-Type': 'application/json' };

  const options = {
    method,
    headers,
    ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();

    // Attach HTTP status to the returned object for error diagnosis
    return { ...data, _status: response.status };
  } catch (err) {
    console.error(`API Error [${method} ${endpoint}]:`, err);
    return {
      success: false,
      _status: 0,
      message: `Network error: ${err.message || 'Could not reach the server.'}`,
    };
  }
}

const get  = (endpoint)          => request('GET',  endpoint);
const post = (endpoint, body)    => request('POST', endpoint, body);
const postForm = (endpoint, fd)  => request('POST', endpoint, fd, true);

// ─────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────
const checkHealth = () => get('/health');

// ─────────────────────────────────────────────────────────────────────────
// MODULE 2 — CERTIFICATE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────
const getCertificates           = ()                      => get('/certificates');
const getCertificateById        = (id)                    => get(`/certificates/${encodeURIComponent(id)}`);
const generateCertificate       = (data)                  => post('/certificates/generate', data);
const revokeCertificate         = (certificateId, reason) => post('/certificates/revoke', { certificateId, reason });
const restoreCertificate        = (certificateId)         => post('/certificates/restore', { certificateId });

// ─────────────────────────────────────────────────────────────────────────
// MODULE 3 — SHA-256 HASH GENERATION
// ─────────────────────────────────────────────────────────────────────────
const generateHash = (textOrData) =>
  post('/hash/generate', typeof textOrData === 'string'
    ? { text: textOrData }
    : { data: textOrData });

const generateHashFromFile = (file) => {
  const fd = new FormData();
  fd.append('certificate', file);
  return postForm('/hash/generate-file', fd);
};

const compareHashes = (hashA, hashB) => post('/hash/compare', { hashA, hashB });

const verifyUploadedFile = (file, certificateId) => {
  const fd = new FormData();
  fd.append('certificate', file);
  if (certificateId) fd.append('certificateId', certificateId);
  return postForm('/hash/verify-upload', fd);
};

// ─────────────────────────────────────────────────────────────────────────
// MODULE 4 — VERIFICATION & QR CODE
// ─────────────────────────────────────────────────────────────────────────
const verifyCertificate = (certificateId, hash = null) =>
  post('/certificates/verify', { certificateId, hash });

const verifyQRCode = (qrData, hash = null) =>
  post('/certificates/verify-qr', { qrData, hash });

const getVerificationById = (certificateId) =>
  get(`/verify/${encodeURIComponent(certificateId)}`);

// ─────────────────────────────────────────────────────────────────────────
// MODULE 1 — BLOCKCHAIN LEDGER
// ─────────────────────────────────────────────────────────────────────────
const getBlockchainChain        = ()              => get('/blockchain/chain');
const validateBlockchain        = ()              => get('/blockchain/validate');
const addBlockchainRecord       = (data)          => post('/blockchain/add', data);
const getRecordByCertificateId  = async (id) => {
  // First try direct certificate lookup (faster path)
  try {
    const certRes = await getCertificateById(id);
    if (certRes?.success && certRes?.data) {
      return {
        success: true,
        verified: certRes.data.status !== 'Invalid',
        certificateRecord: certRes.data,
        block: { index: 1, hash: certRes.data.hash },
      };
    }
  } catch (_) { /* fall through */ }

  return get(`/blockchain/record/${encodeURIComponent(id)}`);
};

// ─────────────────────────────────────────────────────────────────────────
// MODULE 6 — ANALYTICS / DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────────
const getDashboardStats = () => get('/reports/summary');
const getAnalytics      = () => get('/reports/analytics');
const getReports        = () => get('/reports/summary');

// ─────────────────────────────────────────────────────────────────────────
// MODULE 7 — NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────
const getNotifications  = () => get('/notifications');

// ─────────────────────────────────────────────────────────────────────────
// MODULE 8 — CONTACT / SUPPORT EMAIL
// ─────────────────────────────────────────────────────────────────────────
const sendContactMessage = (data) => post('/contact', data);

// ─────────────────────────────────────────────────────────────────────────
// ADMIN AUTH (client-side only — no real JWT in this build)
// ─────────────────────────────────────────────────────────────────────────
const adminLogin = ({ email, password }) => {
  // Simple client-side credential check (no server-side JWT)
  const validEmail    = process.env.REACT_APP_ADMIN_EMAIL    || 'admin@blockvault.edu';
  const validPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'BlockVault@2025';

  if (email === validEmail && password === validPassword) {
    const token = btoa(JSON.stringify({ email, role: 'admin', exp: Date.now() + 8 * 60 * 60 * 1000 }));
    return Promise.resolve({ success: true, token, user: { email, role: 'admin' } });
  }
  return Promise.resolve({ success: false, message: 'Invalid email or password.' });
};

// ─────────────────────────────────────────────────────────────────────────
// EXPORT — named exports + default object
// ─────────────────────────────────────────────────────────────────────────
const apiService = {
  checkHealth,
  // Certificates
  getCertificates,
  getCertificateById,
  generateCertificate,
  revokeCertificate,
  restoreCertificate,
  // Hash
  generateHash,
  generateHashFromFile,
  compareHashes,
  verifyUploadedFile,
  // Verification
  verifyCertificate,
  verifyQRCode,
  getVerificationById,
  // Blockchain
  getBlockchainChain,
  validateBlockchain,
  addBlockchainRecord,
  getRecordByCertificateId,
  // Analytics
  getDashboardStats,
  getAnalytics,
  getReports,
  // Notifications
  getNotifications,
  // Contact
  sendContactMessage,
  // Auth
  adminLogin,
  // URLs
  API_BASE,
  BACKEND_URL,
};

export { API_BASE, BACKEND_URL };
export default apiService;
