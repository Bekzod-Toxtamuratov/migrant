const { Router } = require("express");
const {
  addCountry,
  getCountryById,
  getAllCountry,
  updateCountry,
  deleteCountry,
} = require("../controllers/country.controller");

const is_creatorAdmin = require("../middleware/is_creater_police");

const router = Router();

router.post("/", addCountry);
router.get("/", getAllCountry);
router.put("/:id", is_creatorAdmin, updateCountry);
router.delete("/:id", is_creatorAdmin, deleteCountry);
router.get("/:id", getCountryById);

module.exports = router;
