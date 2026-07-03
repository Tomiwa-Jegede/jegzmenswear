const prisma = require("../lib/prisma");
const { generateUniqueSlug } = require("../lib/slugify");

async function getAllProducts(req, res, next) {
  try {
    const { collection, featured, search, minPrice, maxPrice } = req.query;
    const where = { isActive: true };
    if (collection) where.collection = { slug: collection };
    if (featured === "true") where.isFeatured = true;
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
        collection: { select: { name: true, slug: true } },
        variants: { select: { stock: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const result = products.map(({ variants, ...p }) => ({
      ...p,
      isFullyOutOfStock: variants.every((v) => v.stock < 1),
    }));
    res.json(result);
  } catch (err) {
    next(err);
  }
}
async function getAllProductsAdmin(req, res, next) {
  try {
    const products = await prisma.product.findMany({
      include: {
        collection: { select: { name: true, slug: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
}

async function getProductByIdAdmin(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
        collection: { select: { name: true, slug: true } },
      },
    });
    if (!product) {
      const err = new Error("Product not found");
      err.status = 404;
      throw err;
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function getProductBySlug(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
        collection: { select: { name: true, slug: true } },
      },
    });
    if (!product || !product.isActive) {
      const err = new Error("Product not found");
      err.status = 404;
      throw err;
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function createProduct(req, res, next) {
  try {
    const { name, description, price, isFeatured, collectionId } = req.body;
    const slug = await generateUniqueSlug(prisma, "product", name);
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        isFeatured,
        ...(collectionId ? { collectionId } : {}),
      },
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

async function updateProduct(req, res, next) {
  try {
    const {
      name,
      description,
      price,
      isFeatured,
      isActive,
      collectionId,
    } = req.body;
    const slug = await generateUniqueSlug(
      prisma,
      "product",
      name,
      req.params.id,
    );
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        slug,
        description,
        price,
        isFeatured,
        isActive,
        collectionId,
      },
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function deleteProduct(req, res, next) {
  try {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllProducts,
  getAllProductsAdmin,
  getProductBySlug,
  getProductByIdAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
};