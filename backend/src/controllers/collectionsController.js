const prisma = require("../lib/prisma");
const { generateUniqueSlug } = require("../lib/slugify");

async function getAllCollections(req, res, next) {
  try {
    const collections = await prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    });
    res.json(collections);
  } catch (err) {
    next(err);
  }
}

async function getAllCollectionsAdmin(req, res, next) {
  try {
    const collections = await prisma.collection.findMany({
      orderBy: { position: "asc" },
    });
    res.json(collections);
  } catch (err) {
    next(err);
  }
}

async function getCollectionBySlug(req, res, next) {
  try {
    const collection = await prisma.collection.findUnique({
      where: { slug: req.params.slug },
      include: {
        products: {
          where: { isActive: true },
          include: {
            images: { orderBy: { position: "asc" }, take: 1 },
          },
        },
      },
    });
    if (!collection || !collection.isActive) {
      const err = new Error("Collection not found");
      err.status = 404;
      throw err;
    }
    res.json(collection);
  } catch (err) {
    next(err);
  }
}

async function createCollection(req, res, next) {
  try {
    const {
      name,
      description,
      heroImageUrl,
      altText,
      position,
      desktopCropMode,
      desktopCropX,
      desktopCropY,
      desktopCropWidth,
      desktopCropHeight,
      desktopZoom,
      mobileCropMode,
      mobileCropX,
      mobileCropY,
      mobileCropWidth,
      mobileCropHeight,
      mobileZoom,
    } = req.body;
    const slug = await generateUniqueSlug(prisma, "collection", name);
    const collection = await prisma.collection.create({
      data: {
        name,
        slug,
        description,
        heroImageUrl,
        altText,
        position: position !== undefined ? Number(position) : undefined,
        desktopCropMode: desktopCropMode ?? "auto",
        desktopCropX:
          desktopCropX !== undefined ? Number(desktopCropX) : undefined,
        desktopCropY:
          desktopCropY !== undefined ? Number(desktopCropY) : undefined,
        desktopCropWidth:
          desktopCropWidth !== undefined ? Number(desktopCropWidth) : undefined,
        desktopCropHeight:
          desktopCropHeight !== undefined
            ? Number(desktopCropHeight)
            : undefined,
        desktopZoom:
          desktopZoom !== undefined ? Number(desktopZoom) : undefined,
        mobileCropMode: mobileCropMode ?? "auto",
        mobileCropX:
          mobileCropX !== undefined ? Number(mobileCropX) : undefined,
        mobileCropY:
          mobileCropY !== undefined ? Number(mobileCropY) : undefined,
        mobileCropWidth:
          mobileCropWidth !== undefined ? Number(mobileCropWidth) : undefined,
        mobileCropHeight:
          mobileCropHeight !== undefined ? Number(mobileCropHeight) : undefined,
        mobileZoom: mobileZoom !== undefined ? Number(mobileZoom) : undefined,
      },
    });
    res.status(201).json(collection);
  } catch (err) {
    next(err);
  }
}
async function updateCollection(req, res, next) {
  try {
    const {
      name,
      description,
      heroImageUrl,
      altText,
      position,
      isActive,
      desktopCropMode,
      desktopCropX,
      desktopCropY,
      desktopCropWidth,
      desktopCropHeight,
      desktopZoom,
      mobileCropMode,
      mobileCropX,
      mobileCropY,
      mobileCropWidth,
      mobileCropHeight,
      mobileZoom,
    } = req.body;
    const slug = await generateUniqueSlug(
      prisma,
      "collection",
      name,
      req.params.id,
    );
    const collection = await prisma.collection.update({
      where: { id: req.params.id },
      data: {
        name,
        slug,
        description,
        heroImageUrl,
        altText,
        isActive,
        position: position !== undefined ? Number(position) : undefined,
        desktopCropMode,
        desktopCropX:
          desktopCropX !== undefined ? Number(desktopCropX) : undefined,
        desktopCropY:
          desktopCropY !== undefined ? Number(desktopCropY) : undefined,
        desktopCropWidth:
          desktopCropWidth !== undefined ? Number(desktopCropWidth) : undefined,
        desktopCropHeight:
          desktopCropHeight !== undefined
            ? Number(desktopCropHeight)
            : undefined,
        desktopZoom:
          desktopZoom !== undefined ? Number(desktopZoom) : undefined,
        mobileCropMode,
        mobileCropX:
          mobileCropX !== undefined ? Number(mobileCropX) : undefined,
        mobileCropY:
          mobileCropY !== undefined ? Number(mobileCropY) : undefined,
        mobileCropWidth:
          mobileCropWidth !== undefined ? Number(mobileCropWidth) : undefined,
        mobileCropHeight:
          mobileCropHeight !== undefined ? Number(mobileCropHeight) : undefined,
        mobileZoom: mobileZoom !== undefined ? Number(mobileZoom) : undefined,
      },
    });
    res.json(collection);
  } catch (err) {
    next(err);
  }
}

async function deleteCollection(req, res, next) {
  try {
    await prisma.collection.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllCollections,
  getAllCollectionsAdmin,
  getCollectionBySlug,
  createCollection,
  updateCollection,
  deleteCollection,
};
