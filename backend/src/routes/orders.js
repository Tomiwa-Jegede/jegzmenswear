const express = require("express");
const router = express.Router();
const requireSession = require("../middleware/session");
const requireAdmin = require("../middleware/adminAuth");
const {
  createPendingOrder,
  confirmOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/ordersController");

router.post("/pending", requireSession, createPendingOrder);
router.post("/confirm", requireSession, confirmOrder);
router.get("/", requireAdmin, getAllOrders);
router.get("/:id", requireAdmin, getOrderById);
router.patch("/:id/status", requireAdmin, updateOrderStatus);

module.exports = router;