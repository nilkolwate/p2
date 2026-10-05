/**
 * BlockVault API Client Service
 * ================================
 * Centralised HTTP client for all backend calls.
 * Uses REACT_APP_API_URL env var, falling back to CRA's proxy (/api/...).
 */

import { getToken, setAdminSession, logoutAdmin } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const cleanBaseUrl = API_URL.replace(/\/+$/, '');
const BACKEND_URL = cleanBaseUrl.replace(/\/api\/?$/, '');

function buildUrl(endpoint) {
  if (/^https?:\/\//i.test(endpoint)) return endpoint;
  let path = endpoint || '';
  if (!path.startsWith('/')) path = '/' + path;
  if (path.startsWith('/api/')) {
    path = path.slice(4);
  } else if (path === '/api') {
    path = '';
  }
  return `${cleanBaseUrl}${path}`;
}

// ── Generic fetch wrapper with error handling ────────────────────────────
async function request(method, endpoint, body = null, isFormData = false) {
  const token = getToken();
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const options = {
    method,
    headers,
    ...(body ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  };

  try {
    const url = buildUrl(endpoint);
    const response = await fetch(url, options);

    // If 401 Unauthorized received on a protected request, clear session and redirect
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      logoutAdmin();
      const currentHash = window.location.hash || '';
      if (!currentHash.includes('/login')) {
        window.location.hash = '#/login?sessionExpired=true';
      }
    }

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
// ADMIN AUTH (Real backend JWT authentication)
// ─────────────────────────────────────────────────────────────────────────
const adminLogin = async ({ username, email, password, rememberMe = true }) => {
  const userIdentifier = username || email;
  const res = await post('/auth/login', { username: userIdentifier, password });
  if (res && res.success && res.token) {
    setAdminSession(res.token, res.user, rememberMe);
  }
  return res;
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
  // URLs & Helpers
  API_URL,
  API_BASE: cleanBaseUrl,
  BACKEND_URL,
  buildUrl,
};

export { API_URL, cleanBaseUrl as API_BASE, BACKEND_URL, buildUrl };
export default apiService;
