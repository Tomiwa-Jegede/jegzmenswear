const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/adminAuth");
const {
  login,
  getCloudinarySignature,
} = require("../controllers/adminController");

router.post("/login", login);
router.get("/cloudinary-signature", requireAdmin, getCloudinarySignature);

module.exports = router;
