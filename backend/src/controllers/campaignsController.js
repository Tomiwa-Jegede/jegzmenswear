const prisma = require("../lib/prisma");
const { createAndSendCampaign } = require("../lib/brevo");

function getSiteUrl() {
  const raw = process.env.CLIENT_URL || "";
  return raw.split(",")[0].trim().replace(/\/$/, "");
}

async function notifyNewProduct(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.productId },
      include: {
        images: { orderBy: { position: "asc" }, take: 1 },
      },
    });
    if (!product) {
      const err = new Error("Product not found");
      err.status = 404;
      throw err;
    }
    const image = product.images[0];
    if (!image) {
      const err = new Error("Product must have at least one image to notify subscribers");
      err.status = 400;
      throw err;
    }

    const siteUrl = getSiteUrl();
    const productUrl = `${siteUrl}/products/${product.slug}`;

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; text-align: center;">
        <h2 style="color: #111;">New Arrival</h2>
        <img src="${image.url}" alt="${product.name}" style="width: 100%; max-width: 400px; height: auto; margin: 16px 0;" />
        <h3 style="color: #111;">${product.name}</h3>
        <p style="color: #555; font-size: 18px;">₦${Number(product.price).toLocaleString()}</p>
        <a href="${productUrl}" style="display: inline-block; margin-top: 16px; padding: 12px 32px; background: #111; color: #fff; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; font-size: 12px;">Shop Now</a>
      </div>
    `;

    await createAndSendCampaign({
      subject: `New Arrival: ${product.name}`,
      htmlContent,
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { notifyNewProduct };
