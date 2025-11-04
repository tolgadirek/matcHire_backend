const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware.js");
const upload = require("../middlewares/uploadMiddleware.js");
const { upsertMyCv, getMyCvMeta, downloadMyCv, deleteMyCv } = require("../controllers/cvController.js");

// CV yükle veya değiştir
router.post("/upload", auth, upload.single("cvFile"), upsertMyCv);

// CV meta bilgisi (örnek: isim, tarih, vs.)
router.get("/meta", auth, getMyCvMeta);

// CV dosyasını getirme (görüntüleme veya indirme)
router.get("/download", auth, downloadMyCv);

// CV silme
router.delete("/delete", auth, deleteMyCv);

module.exports = router;
