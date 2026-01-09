const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const logger = require("../utils/logger");
const path = require("path");
const fs = require("fs");

// Kullanıcının CV’sini kaydeder veya günceller.
const upsertMyCv = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded." });

    // --- TÜRKÇE KARAKTER DÜZELTMESİ ---
    // Multer ismi bozuk (latin1) getirebilir, bunu UTF-8'e çeviriyoruz.
    const fixedOriginalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8');

    const filePath = path.join("uploads", "cv", req.user.id, req.body.jobId, req.file.filename);
    
    const data = {
      filePath,
      jobId: req.body.jobId,
      originalName: fixedOriginalName,
      mimeType: req.file.mimetype,
      size: req.file.size,
    };
   
    const created = await prisma.userCv.create({ data });
    
    await prisma.job.update({
      where: { id: req.body.jobId },
      data: { CVs: { connect: { id: created.id } }, updatedAt: new Date() },
    });

    logger.info(`CV created for user ${req.user?.id} and job ${req.body.jobId}`);
    return res.status(201).json({ status: "Created", cv: created });
    
  } catch (e) {
    logger.error(`CV upsert error: ${e.message}`);
    return res.status(500).json({ message: e.message });
  }
};

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

const downloadCvById = async (req, res) => {
  const cvId = req.query.cvId;

  try {
    const cv = await prisma.userCv.findUnique({ where: { id: cvId } });
    if (!cv) return res.status(404).json({ message: "No CV found." });

    const absPath = path.join(process.cwd(), cv.filePath);

    res.setHeader("Content-Type", cv.mimeType || "application/pdf");
    
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(cv.originalName)}"`);

    fs.createReadStream(absPath).pipe(res);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

const deleteMyCv = async (req, res) => {
  const userId = req.user.id; 
  const cvId = req.query.cvId;
  try {
    const cv = await prisma.userCv.findUnique({ where: { id: cvId } });

    if (!cv) {
      logger.warn(`Delete failed - no CV found for user ${userId}`);
      return res.status(404).json({ message: "No CV found to delete." });
    }

    const absPath = path.join(__dirname, "..", cv.filePath);
    if (fs.existsSync(absPath)) {
      fs.unlinkSync(absPath);
      logger.info(`CV file deleted from disk: ${absPath}`);
    }

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

// setSimilarityForCv silindi, similarityController bu işi yapıyor.
  
module.exports = { upsertMyCv, getMyCvMeta, downloadCvById, deleteMyCv, getCvForJob };