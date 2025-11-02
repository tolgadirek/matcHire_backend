const express = require('express');
const router = express.Router();
const { calculateSimilarity } = require('../controllers/similarityController');

// POST /api/similarity
router.post('/', calculateSimilarity);

module.exports = router;
