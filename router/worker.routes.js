const { Router } = require("express");
const {
  addWorker,
  getAllWorker,
  updateWorker,
  deleteWorker,
  getWorkerById,
  workerActivate,
  loginWorker,
  logoutWorker,
  refreshWorkerToken,
} = require("../controllers/worker.controller");

const router = Router();

router.post("/login", loginWorker);
router.post("/logout", logoutWorker);

router.post("/refresh", refreshWorkerToken);

router.get("/activation/:link", workerActivate);

router.get("/activation/:link", workerActivate);

router.post("/", addWorker);
router.get("/", getAllWorker);
router.put("/:id", updateWorker);
router.delete("/:id", deleteWorker);
router.get("/:id", getWorkerById);

module.exports = router;
