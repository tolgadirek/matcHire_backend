const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/uploadMiddleware.js");
const { upsertMyCv, getMyCvMeta, downloadCvById, deleteMyCv, getCvForJob } = require("../controllers/cvController.js");

// CV yükle veya değiştir
router.post("/upload", auth, upload.single("cvFile"), upsertMyCv);

// CV meta bilgisi
router.get("/meta", auth, getMyCvMeta);

// CV dosyasını indir/görüntüle
router.get("/download", auth, downloadCvById);

// CV silme
router.delete("/delete", auth, deleteMyCv);

// Job için CV'leri listele
router.get("/job/:jobId", auth, getCvForJob);

module.exports = router;