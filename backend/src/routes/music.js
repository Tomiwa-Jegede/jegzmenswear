// src/routes/music.js
const express = require("express");
const multer = require("multer");
const router = express.Router();
const requireAdmin = require("../middleware/adminAuth");
const {
  getActiveMusic,
  getAllMusic,
  uploadMusic,
  activateMusic,
  deleteMusic,
} = require("../controllers/musicController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("audio/")) {
      cb(null, true);
    } else {
      cb(new Error("Only audio files are allowed"));
    }
  },
});

// Public
router.get("/", getActiveMusic);

// Admin
router.get("/all", requireAdmin, getAllMusic);
router.post("/", requireAdmin, upload.single("audio"), uploadMusic);
router.patch("/:id/activate", requireAdmin, activateMusic);
router.delete("/:id", requireAdmin, deleteMusic);

module.exports = router;
