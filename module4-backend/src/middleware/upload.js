const multer = require('multer');
const AppError = require('../utils/AppError');

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new AppError('Only PDF files are allowed', 400, 'INVALID_FILE_TYPE'));
    }
    cb(null, true);
  },
});
