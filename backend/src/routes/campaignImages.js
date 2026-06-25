const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/adminAuth");
const {
  getAllCampaignImages,
  getAllCampaignImagesAdmin,
  createCampaignImage,
  updateCampaignImage,
  deleteCampaignImage,
} = require("../controllers/campaignImagesController");

router.get("/", getAllCampaignImages);
router.get("/all", requireAdmin, getAllCampaignImagesAdmin);
router.post("/", requireAdmin, createCampaignImage);
router.put("/:id", requireAdmin, updateCampaignImage);
router.delete("/:id", requireAdmin, deleteCampaignImage);

module.exports = router;
