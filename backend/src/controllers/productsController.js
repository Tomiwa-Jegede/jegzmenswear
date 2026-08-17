const prisma = require("../lib/prisma");
const { generateUniqueSlug } = require("../lib/slugify");

async function getAllProducts(req, res, next) {
  try {
    const { collection, featured, search, minPrice, maxPrice, page, limit } = req.query;
    const where = { isActive: true };
    if (collection) where.collection = { slug: collection };
    if (featured === "true") where.isFeatured = true;
    if (search) where.name = { contains: search, mode: "insensitive" };
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    const pageNum = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Number(limit) || 12);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: { orderBy: { position: "asc" }, take: 1 },
          collection: { select: { name: true, slug: true } },
          variants: { select: { stock: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);
    const result = products.map(({ variants, ...p }) => ({
      ...p,
      isFullyOutOfStock: variants.every((v) => v.stock < 1),
    }));
    res.json({
      products: result,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      page: pageNum,
    });
  } catch (err) {
    next(err);
  }
}
const STALE_DAYS = 14;

async function getAllProductsAdmin(req, res, next) {
  try {
    const products = await prisma.product.findMany({
      include: {
        collection: { select: { name: true, slug: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const staleThreshold = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);
    const result = products.map(({ _count, ...p }) => ({
      ...p,
      hasOrders: _count.orderItems > 0,
      isStale: p.isActive && p.renewedAt < staleThreshold,
    }));
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function renewProduct(req, res, next) {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { renewedAt: new Date(), isActive: true },
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

async function autoArchiveStaleProducts() {
  const staleThreshold = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000);
  const result = await prisma.product.updateMany({
    where: { isActive: true, renewedAt: { lt: staleThreshold } },
    data: { isActive: false },
  });
  if (result.count > 0) {
    console.log(`[auto-archive] Archived ${result.count} product(s) past ${STALE_DAYS} days.`);
  }
  return result.count;
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
    const orderCount = await prisma.orderItem.count({
      where: { productId: req.params.id },
    });
    if (orderCount > 0) {
      const err = new Error(
        "This product has order history and cannot be deleted. Archive it instead.",
      );
      err.status = 400;
      throw err;
    }
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function deleteArchivedProducts(req, res, next) {
  try {
    const candidates = await prisma.product.findMany({
      where: { isActive: false },
      include: { _count: { select: { orderItems: true } } },
    });
    const deletableIds = candidates
      .filter((p) => p._count.orderItems === 0)
      .map((p) => p.id);
    if (deletableIds.length === 0) {
      return res.json({ deletedCount: 0 });
    }
    const result = await prisma.product.deleteMany({
      where: { id: { in: deletableIds } },
    });
    res.json({ deletedCount: result.count });
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
  renewProduct,
  deleteArchivedProducts,
  autoArchiveStaleProducts,
};