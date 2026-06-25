const prisma = require("../lib/prisma");

async function createProductImage(req, res, next) {
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
    const image = await prisma.productImage.create({
      data: {
        url,
        altText,
        position,
        productId: req.params.id,
        isPlaceholder: false,
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

async function updateProductImage(req, res, next) {
  try {
    const {
      url, altText, position,
      desktopCropMode, desktopCropX, desktopCropY, desktopCropWidth, desktopCropHeight, desktopZoom,
      mobileCropMode, mobileCropX, mobileCropY, mobileCropWidth, mobileCropHeight, mobileZoom,
    } = req.body;
    const image = await prisma.productImage.update({
      where: { id: req.params.imageId },
      data: {
        url,
        altText,
        position,
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

async function deleteProductImage(req, res, next) {
  try {
    await prisma.productImage.delete({ where: { id: req.params.imageId } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createProductImage,
  updateProductImage,
  deleteProductImage,
};

