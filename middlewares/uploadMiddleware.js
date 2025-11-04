const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Kayıtların tutulacağı klasör yolu
const uploadDir = path.join(__dirname, "..", "uploads", "cv");

// Eğer klasör yoksa oluştur
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer depolama ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Her kullanıcı için dosya ismi userId.pdf şeklinde
    const userId = req.user?.id || "unknown";
    const ext = path.extname(file.originalname).toLowerCase() || ".pdf";
    cb(null, `${userId}${ext}`);
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
