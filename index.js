const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const similarityRoutes = require('./routes/similarityRoutes');
const cvRoutes = require("./routes/cvRoutes");
const jobRoutes = require("./routes/jobRoutes");
const morgan = require('morgan');
const logger = require('./utils/logger');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes)
app.use('/api/similarity', similarityRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/jobs", jobRoutes);

// Morgan loglarını da Winston’a yönlendirdik.
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Test route
app.get("/", (req, res) => {
  res.send("API çalışıyor 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server çalışıyor: http://localhost:${PORT}`);
});