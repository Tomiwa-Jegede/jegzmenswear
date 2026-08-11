const express = require("express");
const router = express.Router();
const { handleFlutterwaveWebhook } = require("../controllers/ordersController");

router.post("/webhook", handleFlutterwaveWebhook);

module.exports = router;