const express = require('express');
const router = express.Router();
const { analyzeIntent, generateFormStructure } = require('../controllers/aiController');

router.post('/analyze', analyzeIntent);
router.post('/generate', generateFormStructure);

module.exports = router;
