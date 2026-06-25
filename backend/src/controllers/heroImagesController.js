const prisma = require("../lib/prisma");

async function getAllHeroImages(req, res, next) {
  try {
    const images = await prisma.heroImage.findMany({
      where: { isActive: true },
      orderBy: { position: "asc" },
    });
    res.json(images);
  } catch (err) {
    next(err);
  }
}

async function getAllHeroImagesAdmin(req, res, next) {
  try {
    const images = await prisma.heroImage.findMany({
      orderBy: { position: "asc" },
    });
    res.json(images);
  } catch (err) {
    next(err);
  }
}

async function createHeroImage(req, res, next) {
  try {
    const {
      url, altText, position,
      desktopCropMode, desktopCropX, desktopCropY, desktopCropWidth, desktopCropHeight, desktopZoom,
      mobileCropMode, mobileCropX, mobileCropY, mobileCropWidth, mobileCropHeight, mobileZoom,
    } = req.body;
    if (!url) {
      const err = new Error("url is required");
      err.status = 400;
      throw err;
    }
    const image = await prisma.heroImage.create({
      data: {
        url,
        altText,
        position,
        desktopCropMode: desktopCropMode ?? "auto",
        desktopCropX: desktopCropX !== undefined ? Number(desktopCropX) : undefined,
        desktopCropY: desktopCropY !== undefined ? Number(desktopCropY) : undefined,
        desktopCropWidth: desktopCropWidth !== undefined ? Number(desktopCropWidth) : undefined,
        desktopCropHeight: desktopCropHeight !== undefined ? Number(desktopCropHeight) : undefined,
        desktopZoom: desktopZoom !== undefined ? Number(desktopZoom) : undefined,
        mobileCropMode: mobileCropMode ?? "auto",
        mobileCropX: mobileCropX !== undefined ? Number(mobileCropX) : undefined,
        mobileCropY: mobileCropY !== undefined ? Number(mobileCropY) : undefined,
        mobileCropWidth: mobileCropWidth !== undefined ? Number(mobileCropWidth) : undefined,
        mobileCropHeight: mobileCropHeight !== undefined ? Number(mobileCropHeight) : undefined,
        mobileZoom: mobileZoom !== undefined ? Number(mobileZoom) : undefined,
      },
    });
    res.status(201).json(image);
  } catch (err) {
    next(err);
  }
}

async function updateHeroImage(req, res, next) {
  try {
    const {
      url, altText, position, isActive,
      desktopCropMode, desktopCropX, desktopCropY, desktopCropWidth, desktopCropHeight, desktopZoom,
      mobileCropMode, mobileCropX, mobileCropY, mobileCropWidth, mobileCropHeight, mobileZoom,
    } = req.body;
    const image = await prisma.heroImage.update({
      where: { id: req.params.id },
      data: {
        url,
        altText,
        position: position !== undefined ? Number(position) : undefined,
        isActive,
        desktopCropMode,
        desktopCropX: desktopCropX !== undefined ? Number(desktopCropX) : undefined,
        desktopCropY: desktopCropY !== undefined ? Number(desktopCropY) : undefined,
        desktopCropWidth: desktopCropWidth !== undefined ? Number(desktopCropWidth) : undefined,
        desktopCropHeight: desktopCropHeight !== undefined ? Number(desktopCropHeight) : undefined,
        desktopZoom: desktopZoom !== undefined ? Number(desktopZoom) : undefined,
        mobileCropMode,
        mobileCropX: mobileCropX !== undefined ? Number(mobileCropX) : undefined,
        mobileCropY: mobileCropY !== undefined ? Number(mobileCropY) : undefined,
        mobileCropWidth: mobileCropWidth !== undefined ? Number(mobileCropWidth) : undefined,
        mobileCropHeight: mobileCropHeight !== undefined ? Number(mobileCropHeight) : undefined,
        mobileZoom: mobileZoom !== undefined ? Number(mobileZoom) : undefined,
      },
    });
    res.json(image);
  } catch (err) {
    next(err);
  }
}

async function deleteHeroImage(req, res, next) {
  try {
    await prisma.heroImage.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAllHeroImages,
  getAllHeroImagesAdmin,
  createHeroImage,
  updateHeroImage,
  deleteHeroImage,
};
