const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const logger = require('./utils/logger');
const authRoutes = require('./routes/authRoutes');
const similarityRoutes = require('./routes/similarityRoutes');
const cvRoutes = require("./routes/cvRoutes");
const jobRoutes = require("./routes/jobRoutes");
const keywordsRoutes = require("./routes/keywordsRoutes");

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// Loglama (Morgan'ı route'lardan önce tanımlıyoruz ki gelen isteği görsün)
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// --- Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/similarity', similarityRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/keywords", keywordsRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("API çalışıyor 🚀");
});

// --- Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server çalışıyor: http://localhost:${PORT}`);
});