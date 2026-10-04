const multer = require('multer');

function notFound(req, res) {
  res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: `Route ${req.method} ${req.originalUrl} not found` } });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message;

  if (err instanceof multer.MulterError) {
    status = 400;
    code = err.code;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'File too large (max 10 MB)' : err.message;
  }
  if (status >= 500) {
    console.error(err);
    message = 'Internal server error';
  }
  res.status(status).json({ success: false, error: { code, message } });
}

module.exports = { notFound, errorHandler };
