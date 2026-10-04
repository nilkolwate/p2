const multer = require('multer');
const path = require('path');

/**
 * upload.js
 * ---------
 * Shared file-upload middleware (multer), used wherever a certificate
 * PDF needs to be received - e.g. hashing endpoint, verification endpoint.
 * Stores to /uploads temporarily; files are only needed long enough to
 * compute their SHA-256 hash.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are accepted'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB max

module.exports = upload;
