const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
/**
 * POST /api/similarity
 * Proxies similarity requests to the Flask service at http://localhost:8000/similarity
 * Expected body: { cv_text: string, job_text: string }
 */
async function calculateSimilarity(req, res) {
  try {
    const { job_text, cvId, jobId } = req.body || {};
    const userId = req.user.id;

    console.log('CV ID:', cvId);
    const cv = await prisma.userCv.findUnique({
      where: { id: cvId, jobId },
      select: { filePath: true },
    });
    console.log('CV:', cv);

    const cv_path = cv.filePath;
    if (!cv_path) {
      return res.status(404).json({ success: false, message: 'CV not found' });
    }

    if (!job_text) {
      return res.status(400).json({ success: false, message: 'job_text is required' });
    }

    // Read CV text from file
    const fs = require('fs');
    const path = require('path');
    const absCvPath = path.join(__dirname, '..', cv_path);
    const cv_text = fs.readFileSync(absCvPath, 'utf-8');
    console.log('CV Text:', cv_text);
    console.log('Job Text:', job_text);
    const flaskUrl = process.env.SIMILARITY_SERVICE_URL || 'http://localhost:8000/similarity';

    // Forward request to Flask API
    const response = await axios.post(flaskUrl, { cv_text, job_text }, { timeout: 10000 });
    console.log(response.data);

    console.log('Similarity :', response.data.similarity);
    console.log()
    await prisma.userCv.update({
      where: { id: cvId, jobId },
      data: { similarity: response.data.similarity },
    });
    console.log('Similarity updated in database');
    
    // Return the Flask response directly in a consistent structure
    return res.status(200).json({ success: true, data: response.data });
  } catch (err) {
    // Axios error with response from server
    if (err.response) {
      const status = err.response.status || 500;
      const data = err.response.data || { message: 'Similarity service error' };
      return res.status(status).json({ success: false, message: data });
    }

    // Request made but no response
    if (err.request) {
      return res.status(502).json({ success: false, message: 'No response from similarity service' });
    }

    // Other errors
    return res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
  }
}

module.exports = { calculateSimilarity };
