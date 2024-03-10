const { Router } = require("express");
const {
  addAdmin,
  getAdminById,
  getAllAdmin,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAdminToken,
  adminActivate,
} = require("../controllers/admin.controller");

const router = Router();

router.post("/login", loginAdmin);

router.post("/refresh", refreshAdminToken);

const adminPolice = require("../middleware/admin_police");
const is_creatorAdmin = require("../middleware/is_creater_police");

router.get("/", adminPolice, getAllAdmin);
router.get("/:id", adminPolice, getAdminById);

router.get("/activation/:link", adminActivate);

router.post("/logout", logoutAdmin);
router.post("/", addAdmin);
router.get("/", getAllAdmin);
router.put("/:id", is_creatorAdmin, updateAdmin);
router.delete("/:id", is_creatorAdmin, deleteAdmin);
router.get("/:id", getAdminById);

module.exports = router;
