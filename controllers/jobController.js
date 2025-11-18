const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const logger = require("../utils/logger");
const path = require("path");

//Create a job in the database
const createJob = async (req, res) => {
  const { title, description } = req.body;
    try {
    const job = await prisma.job.create({
      data: {
        title,
        description,
        userId: req.user.id,
      },
    });
    logger.info(`Job created with ID: ${job.id}`);
    return res.status(201).json({ job });
  } catch (e) {
    logger.error(`Job creation error: ${e.message}`);
    return res.status(500).json({ message: e.message });
  }
};

const getAllJobs = async (req, res) => {
    try {
    const jobs = await prisma.job.findMany();
    return res.json({ jobs });
  } catch (e) {
    logger.error(`Get all jobs error: ${e.message}`);
    return res.status(500).json({ message: e.message });
  }
};

const getAllJobsUser = async (req, res) => {
    try {
    const jobs = await prisma.job.findMany({
        where: { userId: req.user.id },
        include: { CVs: true },
    });
    return res.json({ jobs });
  } catch (e) {
    logger.error(`Get user jobs error: ${e.message}`);
    return res.status(500).json({ message: e.message });
  }
};

const deleteJob = async (req, res) => {
  const { jobId } = req.params;
  try {
    // 1) Önce job'a bağlı tüm CV'leri sil
    await prisma.userCv.deleteMany({
      where: { jobId },
    });

    // 2) Sonra job'u sil
    await prisma.job.delete({
      where: { id: jobId },
    });

    return res.json({ message: "Job and related CVs deleted successfully." });

  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

module.exports = { createJob, getAllJobs, deleteJob, getAllJobsUser };