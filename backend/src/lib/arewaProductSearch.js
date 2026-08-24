const prisma = require("./prisma");

async function searchProducts({ query, minPrice, maxPrice, size } = {}) {
  const where = {
    isActive: true,
    ...(minPrice != null || maxPrice != null
      ? {
          price: {
            ...(minPrice != null ? { gte: minPrice } : {}),
            ...(maxPrice != null ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
            { collection: { name: { contains: query, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(size
      ? { variants: { some: { size: { equals: size, mode: "insensitive" }, stock: { gt: 0 } } } }
      : {}),
  };

  const products = await prisma.product.findMany({
    where,
    include: {
      collection: { select: { name: true, slug: true } },
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { select: { size: true, stock: true } },
    },
    take: 8,
  });

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    description: p.description,
    collection: p.collection?.name || null,
    image: p.images[0]?.url || null,
    availableSizes: p.variants.filter((v) => v.stock > 0).map((v) => v.size),
    inStock: p.variants.some((v) => v.stock > 0),
  }));
}

module.exports = { searchProducts };