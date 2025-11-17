const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { log } = require("console");

// Kayıtların tutulacağı klasör yolu
const uploadDir = path.join(__dirname, "..", "uploads", "cv");

// Eğer klasör yoksa oluştur
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer depolama ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    //create an folder for each user if not exists
    
    const userId = req.user?.id || "unknown";
    const userDir = path.join(uploadDir, userId);
    console.log("JobId:", req.body.jobId);
    console.log("req.body:", req.body);
    
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    //also create an folder for job description under the user folder
    const jobDescDir = path.join(userDir, req.body.jobId || "general");

    if (!fs.existsSync(jobDescDir)) {
      fs.mkdirSync(jobDescDir, { recursive: true });
    }
    cb(null, jobDescDir);
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
