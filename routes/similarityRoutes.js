const express = require('express');
const router = express.Router();
const { calculateSimilarity } = require('../controllers/similarityController');
const auth = require('../middlewares/authMiddleware');

// POST /api/similarity
router.post('/', auth, calculateSimilarity);

module.exports = router;
