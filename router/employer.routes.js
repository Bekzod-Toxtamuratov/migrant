const { Router } = require("express");
const {
  addEmployer,
  getAllEmployer,
  getEmployerById,
  updatEmployer,
  deleteEnemployer,
  loginEmployer,
  logoutEmployer,
  refreshEmployerToken,
} = require("../controllers/employer.controller");

const router = Router();

router.post("/login", loginEmployer);
router.post("/logout", logoutEmployer);

router.post("/refresh", refreshEmployerToken);

router.post("/", addEmployer);
router.get("/", getAllEmployer);

router.get("/:id", getEmployerById);

router.put("/:id", updatEmployer);

router.delete("/:id", deleteEnemployer);

module.exports = router;
