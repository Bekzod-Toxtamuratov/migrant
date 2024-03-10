const { Router } = require("express");

const {
  addAplication,
  getAllAplication,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require("../controllers/application.controller");

const router = Router();

router.get("/:id", getApplicationById);
router.get("/", getAllAplication);

router.post("/", addAplication);

router.put("/:id", updateApplication);
router.delete("/:id", deleteApplication);

module.exports = router;
