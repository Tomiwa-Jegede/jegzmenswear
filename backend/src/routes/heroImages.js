const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/adminAuth");
const {
  getAllHeroImages,
  getAllHeroImagesAdmin,
  createHeroImage,
  updateHeroImage,
  deleteHeroImage,
} = require("../controllers/heroImagesController");

router.get("/", getAllHeroImages);
router.get("/all", requireAdmin, getAllHeroImagesAdmin);
router.post("/", requireAdmin, createHeroImage);
router.put("/:id", requireAdmin, updateHeroImage);
router.delete("/:id", requireAdmin, deleteHeroImage);

module.exports = router;
