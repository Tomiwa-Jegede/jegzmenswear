const express = require("express");
const router = express.Router();
const requireSession = require("../middleware/session");
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
} = require("../controllers/cartController");

router.use(requireSession);
router.get("/", getCart);
router.post("/items", addItem);
router.put("/items/:itemId", updateItem);
router.delete("/items/:itemId", removeItem);

module.exports = router;
