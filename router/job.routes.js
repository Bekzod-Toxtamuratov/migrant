const { Router } = require("express");
const {
  addJob,
  getJobsById,
  getAllJob,
  updateJobs,
  deleteJobs,
} = require("../controllers/job.controller");

const router = Router();

const is_creatorAdmin = require("../middleware/is_creater_police");

router.post("/", addJob);
router.get("/", getAllJob);
router.put("/:id", is_creatorAdmin, updateJobs);
router.delete("/:id", is_creatorAdmin, deleteJobs);
router.get("/:id", getJobsById);

module.exports = router;
