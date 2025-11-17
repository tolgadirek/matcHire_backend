const router = require("express").Router();
const {
  createJob,
  getAllJobs,
  deleteJob,
  getAllJobsUser
} = require("../controllers/jobController");
const auth = require("../middlewares/authMiddleware.js");

// POST /api/jobs
router.post("/", auth, createJob);
// GET /api/jobs
router.get("/", auth, getAllJobsUser);
// DELETE /api/jobs/:jobId
router.delete("/:jobId", auth, deleteJob);


module.exports = router;