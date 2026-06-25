const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/adminAuth");
const {
  getAllCollections,
  getAllCollectionsAdmin,
  getCollectionBySlug,
  createCollection,
  updateCollection,
  deleteCollection,
} = require("../controllers/collectionsController");
router.get("/", getAllCollections);
router.get("/admin/all", requireAdmin, getAllCollectionsAdmin);
router.get("/:slug", getCollectionBySlug);
router.post("/", requireAdmin, createCollection);
router.put("/:id", requireAdmin, updateCollection);
router.delete("/:id", requireAdmin, deleteCollection);

module.exports = router;
