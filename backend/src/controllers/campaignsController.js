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
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; text-align: center; background: #faf8f5; padding: 32px 24px;">
        <p style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 12px;">Just Dropped</p>
        <h1 style="color: #111; font-size: 24px; margin: 0 0 4px; letter-spacing: 1px;">${product.name}</h1>
        <p style="color: #888; font-size: 13px; margin: 0 0 20px;">Fresh in. Take a look.</p>
        <img src="${image.url}" alt="${product.name}" style="width: 100%; max-width: 400px; height: auto; margin-bottom: 20px; border-radius: 2px;" />
        <p style="color: #111; font-size: 20px; font-weight: bold; margin: 0 0 20px;">₦${Number(product.price).toLocaleString()}</p>
        <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          Sharp, considered, made to be worn. This is the piece your wardrobe's been waiting on — get it before it sells out.
        </p>
        <a href="${productUrl}" style="display: inline-block; padding: 14px 40px; background: #111; color: #fff; text-decoration: none; text-transform: uppercase; letter-spacing: 2px; font-size: 12px; border-radius: 999px;">Shop This Now</a>
        <p style="color: #aaa; font-size: 11px; margin-top: 24px;">Free delivery on orders over ₦200,000</p>
      </div>
    `;
    await createAndSendCampaign({
      subject: `Just In: ${product.name} — don't miss it`,
      htmlContent,
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { notifyNewProduct };
