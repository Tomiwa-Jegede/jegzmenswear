const crypto = require("crypto");
const prisma = require("./prisma");

function randomCode() {
  return "WELC-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

async function createDiscountCodeForSubscriber(subscriberId) {
  const existing = await prisma.discountCode.findUnique({
    where: { subscriberId },
  });
  if (existing) return existing;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      return await prisma.discountCode.create({
        data: { code: randomCode(), subscriberId },
      });
    } catch (err) {
      if (err.code === "P2002") continue; // code collision, retry
      throw err;
    }
  }
  throw new Error("Could not generate a unique discount code");
}

module.exports = { createDiscountCodeForSubscriber };