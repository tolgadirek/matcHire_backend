const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ana upload dizini
const baseUploadDir = path.join("uploads", "cv");

// Multer depolama ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user?.id || "unknown";
    const jobId = req.body.jobId || "general";

    // Hedef klasör: uploads/cv/{userId}/{jobId}
    const finalDir = path.join(baseUploadDir, userId, jobId);

    // Klasör yoksa recursive (iç içe) olarak oluştur
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    cb(null, finalDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Yalnızca PDF dosyalarına izin ver
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

// Upload middleware’i oluştur
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5 MB
});

module.exports = upload;