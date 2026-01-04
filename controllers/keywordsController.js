const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const path = require("path");
const fs = require("fs");

async function getMissingKeywords(req, res) {
  try {
    const { cvId, jobId } = req.body;

    if (!cvId || !jobId) {
      return res.status(400).json({
        success: false,
        message: "cvId and jobId are required"
      });
    }

    // CV'nin dosya yolunu DB'den alın
    const cv = await prisma.userCv.findFirst({
        where: { id: cvId, jobId },
        select: { filePath: true }
    });

    if (!cv) {
      return res.status(404).json({
        success: false,
        message: "CV not found"
      });
    }

    const absPath = path.resolve(process.cwd(), cv.filePath);

    if (!fs.existsSync(absPath)) {
      return res.status(500).json({
        success: false,
        message: "CV file does not exist on server"
      });
    }

    const pythonUrl =
      process.env.EXPLAIN_KEYWORDS_URL ||
      "http://localhost:8000/explain_keywords";

    // PYTHON'A GÖNDERİLEN JSON
    const response = await axios.post(pythonUrl, {
      cv_path: absPath,
      job_text: req.body.jobText
    });

    const missingKeywords = response.data.recommendations || [];

    // DB'ye kaydet
    await prisma.job.update({
      where: { id: jobId },
      data: { missingKeywords }
    });

    return res.status(200).json({
      success: true,
      missingKeywords,
      count: missingKeywords.length
    });

  } catch (err) {
    console.error("Missing keywords error:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}

module.exports = { getMissingKeywords };