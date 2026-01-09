const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");

async function calculateSimilarity(req, res) {
  try {
    const { job_text, cvId, jobId } = req.body || {};

    const cv = await prisma.userCv.findUnique({
      where: { id: cvId, jobId },
      select: { filePath: true },
    });

    if (!cv) return res.status(404).json({ success: false, message: 'CV not found' });

    const absCvPath = path.resolve(process.cwd(), cv.filePath);

    if (!fs.existsSync(absCvPath)) {
      return res.status(500).json({ success: false, message: "PDF file not found on server" });
    }

    const flaskUrl = process.env.SIMILARITY_SERVICE_URL || "http://localhost:8000/similarity";

    const response = await axios.post(flaskUrl, {
      cvId,
      cv_path: absCvPath,
      job_text
    });

    const similarity = response.data.similarity;

    await prisma.userCv.update({
      where: { id: cvId, jobId },
      data: { similarity },
    });

    return res.status(200).json({ success: true, similarity });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { calculateSimilarity };