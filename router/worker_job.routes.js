const { Router } = require("express");

const {
  addWorker_job,
  deleteWorker_job,
  updateWorker_job,
  getWorker_jobById,
  getAllWorker_job,
} = require("../controllers/worker_job.controller");

const router = Router();

router.post("/", addWorker_job);
router.get("/", getAllWorker_job);
router.put("/:id", updateWorker_job);
router.delete("/:id", deleteWorker_job);
router.get("/:id", getWorker_jobById);

module.exports = router;
