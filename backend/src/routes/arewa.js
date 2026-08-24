const express = require("express");
const router = express.Router();
const requireSession = require("../middleware/session");
const { chat } = require("../controllers/arewaController");

router.use(requireSession);
router.post("/chat", chat);

module.exports = router;