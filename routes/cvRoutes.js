const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/uploadMiddleware.js");
const { upsertMyCv, getMyCvMeta, downloadMyCv, donwloadCvById, getCvForJob, setSimilarityForCv, deleteMyCv } = require("../controllers/cvController.js");

// CV yükle veya değiştir
router.post("/upload", auth, upload.single("cvFile"), upsertMyCv);

// CV meta bilgisi (örnek: isim, tarih, vs.)
router.get("/meta", auth, getMyCvMeta);

// CV dosyasını getirme (görüntüleme veya indirme)
router.get("/download", auth, donwloadCvById);

// CV silme
router.delete("/delete", auth, deleteMyCv);

// Job için CV'leri listele
router.get("/job/:jobId", auth, getCvForJob);

// Job için CV benzerliğini ayarla
router.post("/job/:jobId/similarity", auth, setSimilarityForCv);



module.exports = router;
