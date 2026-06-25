const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/adminAuth");
const {
  getSiteContent,
  upsertSiteContent,
} = require("../controllers/siteContentController");

router.get("/", getSiteContent);
router.put("/", requireAdmin, upsertSiteContent);

module.exports = router;
