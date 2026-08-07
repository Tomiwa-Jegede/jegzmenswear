const express = require("express");
const router = express.Router();
const requireSession = require("../middleware/session");
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  updateMeasurements,
} = require("../controllers/cartController");

router.use(requireSession);
router.get("/", getCart);
router.post("/items", addItem);
router.put("/items/:itemId", updateItem);
router.put("/items/:itemId/measurements", updateMeasurements);
router.delete("/items/:itemId", removeItem);

module.exports = router;
