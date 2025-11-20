const express = require("express");
const router = express.Router();
const { getMissingKeywords } = require("../controllers/keywordsController");
const auth = require("../middlewares/authMiddleware");

router.post("/missing", auth, getMissingKeywords);

module.exports = router;