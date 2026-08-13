const express = require("express");
const router = express.Router();
const { validateCode } = require("../controllers/discountCodesController");

router.get("/:code", validateCode);

module.exports = router;