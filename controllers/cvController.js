// controllers/cvController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const logger = require("../utils/logger");
const path = require("path");
const fs = require("fs");

// Kullanıcının CV’sini kaydeder veya günceller.
const upsertMyCv = async (req, res) => {
  const userId = req.user.id;
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });

    const filePath = path.join("uploads", "cv", req.file.filename);
    const data = {
      userId,
      filePath,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    };

    // varsa güncelle, yoksa oluştur
    const existing = await prisma.userCv.findUnique({ where: { userId } });
    if (existing) {
      // farklı uzantıyla önceden dosya kalmışsa temizle
      if (existing.filePath && existing.filePath !== filePath) {
        try { fs.unlinkSync(path.join(__dirname, "..", existing.filePath)); } catch {}
      }
      const updated = await prisma.userCv.update({ where: { userId }, data });
      logger.info(`CV updated for user ${userId}`);
      return res.json({ status: "Updated", cv: updated });
    } else {
      const created = await prisma.userCv.create({ data });
      logger.info(`CV created for user ${userId}`);
      return res.status(201).json({ status: "Created", cv: created });
    }
  } catch (e) {
    logger.error(`CV upsert error: ${e.message}`);
    return res.status(500).json({ message: e.message });
  }
};

// “Kullanıcının yüklediği CV var mı, varsa ne zaman yüklendi?” bilgisini verir.
const getMyCvMeta = async (req, res) => {
  const userId = req.user.id;
  try {
    const cv = await prisma.userCv.findUnique({ where: { userId } });
    if (!cv) return res.status(404).json({ message: "No CV found." });
    return res.json({ cv });
  } catch (e) {
    logger.error(`Get CV meta error: ${e.message}`);
    return res.status(500).json({ message: e.message });
  }
};

// “Kullanıcının mevcut CV’sini anasayfada göster / indir” işlemini yapar.
const downloadMyCv = async (req, res) => {
  const userId = req.user.id;
  try {
    const cv = await prisma.userCv.findUnique({ where: { userId } });
    if (!cv) return res.status(404).json({ message: "No CV found." });

    const absPath = path.join(__dirname, "..", cv.filePath);
    if (!fs.existsSync(absPath)) return res.status(404).json({ message: "File missing on server." });

    res.setHeader("Content-Type", cv.mimeType || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${cv.originalName || "cv.pdf"}"`);
    fs.createReadStream(absPath).pipe(res);
  } catch (e) {
    logger.error(`Download CV error: ${e.message}`);
    return res.status(500).json({ message: e.message });
  }
};

// CV silme fonksiyonu
const deleteMyCv = async (req, res) => {
  const userId = req.user.id;
  try {
    const cv = await prisma.userCv.findUnique({ where: { userId } });
    if (!cv) {
      logger.warn(`Delete failed - no CV found for user ${userId}`);
      return res.status(404).json({ message: "No CV found to delete." });
    }

    // Dosyayı sil
    const absPath = path.join(__dirname, "..", cv.filePath);
    if (fs.existsSync(absPath)) {
      fs.unlinkSync(absPath);
      logger.info(`CV file deleted from disk: ${absPath}`);
    }

    // Veritabanı kaydını sil
    await prisma.userCv.delete({ where: { userId } });
    logger.info(`CV record deleted for user ${userId}`);

    return res.status(200).json({ status: "Deleted", message: "CV deleted successfully." });
  } catch (e) {
    logger.error(`Delete CV error: ${e.message}`);
    return res.status(500).json({ message: e.message });
  }
};

module.exports = { upsertMyCv, getMyCvMeta, downloadMyCv, deleteMyCv };
