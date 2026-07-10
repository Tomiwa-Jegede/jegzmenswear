const express = require("express");
const router = express.Router();
const requireSession = require("../middleware/session");
const requireAdmin = require("../middleware/adminAuth");
const {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/ordersController");

router.post("/", requireSession, createOrder);
router.get("/", requireAdmin, getAllOrders);
router.get("/:id", requireAdmin, getOrderById);
router.patch("/:id/status", requireAdmin, updateOrderStatus);

module.exports = router;