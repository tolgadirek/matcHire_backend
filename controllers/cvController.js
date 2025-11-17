// controllers/cvController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const logger = require("../utils/logger");
const path = require("path");
const fs = require("fs");

// Kullanıcının CV’sini kaydeder veya günceller.
const upsertMyCv = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });

    const filePath = path.join("uploads", "cv",  req.user.id, req.body.jobId, req.file.filename);
    const data = {
      filePath,
      jobId: req.body.jobId,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    };
   
    console.log("c")
    const created = await prisma.userCv.create({ data });
    const updatedJob = await prisma.job.update({
      where: { id: req.body.jobId },
      data: {CVs: { connect: { id: created.id } }, updatedAt: new Date() },
    });
    console.log(updatedJob)
    logger.info(`CV created for user ${req.user?.id} and job ${req.body.jobId}`);
    return res.status(201).json({ status: "Created", cv: created });
    
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
const donwloadCvById = async (req, res) => {
  const userId = req.user.id;
  const cvId = req.params.cvId;
  try {
    const cv = await prisma.userCv.findUnique({ where: { id: cvId, userId } });
    if (!cv) return res.status(404).json({ message: "No CV found." });
    const absPath = path.join(__dirname, "..", cv.filePath);
    if (!fs.existsSync(absPath)) return res.status(404).json({ message: "File missing on server." });

    res.setHeader("Content-Type", cv.mimeType || "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${cv.originalName || "cv.pdf"}"`);
    fs.createReadStream(absPath).pipe(res);
  } catch (e) {
    logger.error(`Download CV by ID error: ${e.message}`);
    return res.status(500).json({ message: e.message });
  }
};

// CV silme fonksiyonu
const deleteMyCv = async (req, res) => {
  //cvId will be in url like : /api/cv/delete?cvId=${encodeURIComponent(cvId)
  const userId = req.user.id; 
  const cvId = req.query.cvId;
  try {
    const cv = await prisma.userCv.findUnique({ where: { id: cvId } });

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
    await prisma.userCv.delete({ where: { id: cvId } });
    logger.info(`CV record deleted for user ${userId}`);

    return res.status(200).json({ status: "Deleted", message: "CV deleted successfully." });
  } catch (e) {
    logger.error(`Delete CV error: ${e.message}`);
    return res.status(500).json({ message: e.message });
  }
};

const getCvForJob = async (req, res) => {
  const { jobId } = req.params;
  try {
    const cvs = await prisma.userCv.findMany({
      where: { jobId },
      orderBy: { similarity: 'desc' },
      select: { id: true, originalName: true, mimeType: true, size: true, similarity: true, createdAt: true, userId: true }
    });
    return res.json({ cvs });
  } catch (e) {
    logger.error(`Get CVs for job error: ${e.message}`);
    return res.status(500).json({ message: e.message });
  } 
};

const setSimilarityForCv = async (cvId, similarity) => {
  try {
    await prisma.userCv.update({
      where: { id: cvId },
      data: { similarity },
    });
    logger.info(`Similarity ${similarity} set for CV ID: ${cvId}`);
  } catch (e) {
    logger.error(`Set similarity error for CV ID ${cvId}: ${e.message}`);
  }
};
  
module.exports = { upsertMyCv, getMyCvMeta, donwloadCvById, deleteMyCv, getCvForJob, setSimilarityForCv };