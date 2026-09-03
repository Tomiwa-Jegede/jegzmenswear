const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/adminAuth");
const {
  login,
  getCloudinarySignature,
  getCloudinaryUsage,
} = require("../controllers/adminController");

router.post("/login", login);
router.get("/cloudinary-signature", requireAdmin, getCloudinarySignature);
router.get("/cloudinary-usage", requireAdmin, getCloudinaryUsage);

module.exports = router;
