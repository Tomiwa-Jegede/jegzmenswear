const express = require("express");
const router = express.Router();
const requireAdmin = require("../middleware/adminAuth");
const {
  getAllProducts,
  getAllProductsAdmin,
  getProductBySlug,
  getProductByIdAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  renewProduct,
  deleteArchivedProducts,
} = require("../controllers/productsController");
const {
  createProductImage,
  updateProductImage,
  deleteProductImage,
} = require("../controllers/productImagesController");
const {
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
} = require("../controllers/productVariantsController");

router.get("/", getAllProducts);
router.get("/admin/all", requireAdmin, getAllProductsAdmin);
router.get("/admin/:id", requireAdmin, getProductByIdAdmin);
router.get("/:slug", getProductBySlug);
router.post("/", requireAdmin, createProduct);
router.put("/:id", requireAdmin, updateProduct);
router.delete("/archived", requireAdmin, deleteArchivedProducts);
router.delete("/:id", requireAdmin, deleteProduct);
router.patch("/:id/renew", requireAdmin, renewProduct);

router.post("/:id/images", requireAdmin, createProductImage);
router.put("/images/:imageId", requireAdmin, updateProductImage);
router.delete("/images/:imageId", requireAdmin, deleteProductImage);

router.post("/:id/variants", requireAdmin, createProductVariant);
router.put("/variants/:variantId", requireAdmin, updateProductVariant);
router.delete("/variants/:variantId", requireAdmin, deleteProductVariant);

module.exports = router;
