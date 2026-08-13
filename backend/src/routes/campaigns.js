const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/adminAuth");
const { notifyNewProduct } = require("../controllers/campaignsController");

router.post("/notify-product/:productId", requireAdmin, notifyNewProduct);

module.exports = router;