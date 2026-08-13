const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/adminAuth");
const subscribeLimiter = require("../middleware/subscribeLimiter");
const {
  subscribe,
  verifyEmail,
  listSubscribers,
} = require("../controllers/subscribersController");

router.post("/", subscribeLimiter, subscribe);
router.get("/verify/:token", verifyEmail);
router.get("/", requireAdmin, listSubscribers);

module.exports = router;