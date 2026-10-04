const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { generateHash, compareHashesController } = require('../controllers/hashController');

router.post('/generate', upload.single('certificate'), generateHash);
router.post('/compare', compareHashesController);

module.exports = router;
