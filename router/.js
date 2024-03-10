const {
  addSpec_working_day,
  getAllSpec_working_day,
  getAllSpec_working_dayById,
  updateSpec_working_day,
  deleteSpec_working_day,
} = require("../controllers/spec_working_day.controller");

// const {Router}=express.Router();
const { Router } = require("express");

const router = new Router();

router.post("/", addSpec_working_day);
router.get("/", getAllSpec_working_day);
router.get("/:id", getAllSpec_working_dayById);
router.put("/:id", updateSpec_working_day);
router.delete("/:id",deleteSpec_working_day)

module.exports = router;
