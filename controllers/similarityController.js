const axios = require('axios');

/**
 * POST /api/similarity
 * Proxies similarity requests to the Flask service at http://localhost:8000/similarity
 * Expected body: { cv_text: string, job_text: string }
 */
async function calculateSimilarity(req, res) {
  try {
    const { cv_text, job_text } = req.body || {};

    if (!cv_text || !job_text) {
      return res.status(400).json({ success: false, message: 'cv_text and job_text are required' });
    }

    const flaskUrl = process.env.SIMILARITY_SERVICE_URL || 'http://localhost:8000/similarity';

    // Forward request to Flask API
    const response = await axios.post(flaskUrl, { cv_text, job_text }, { timeout: 10000 });
    console.log(response.data);
    
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
