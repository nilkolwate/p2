const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  addBlock,
  getChain,
  validateChain,
  getRecordByCertificateId,
  verifyCertificate,
} = require('../controllers/blockchainController');

router.post('/add', addBlock);
router.get('/chain', getChain);
router.get('/validate', validateChain);
router.get('/record/:certificateId', getRecordByCertificateId);
router.post('/verify', upload.single('certificate'), verifyCertificate);

module.exports = router;
