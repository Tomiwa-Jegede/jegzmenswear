const prisma = require("../lib/prisma");

async function createProductVariant(req, res, next) {
  try {
    const { size, color, sku, stock } = req.body;
    if (!size || !sku) {
      const err = new Error("size and sku are required");
      err.status = 400;
      throw err;
    }
    const variant = await prisma.productVariant.create({
      data: {
        size,
        color,
        sku,
        stock,
        productId: req.params.id,
      },
    });
    res.status(201).json(variant);
  } catch (err) {
    next(err);
  }
}

async function updateProductVariant(req, res, next) {
  try {
    const { size, color, sku, stock } = req.body;
    const variant = await prisma.productVariant.update({
      where: { id: req.params.variantId },
      data: { size, color, sku, stock },
    });
    res.json(variant);
  } catch (err) {
    next(err);
  }
}

async function deleteProductVariant(req, res, next) {
  try {
    await prisma.productVariant.delete({ where: { id: req.params.variantId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
};
