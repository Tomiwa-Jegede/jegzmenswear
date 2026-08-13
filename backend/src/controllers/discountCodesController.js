const prisma = require("../lib/prisma");

async function validateCode(req, res, next) {
  try {
    const code = String(req.params.code || "").trim().toUpperCase();
    if (!code) {
      const err = new Error("Code is required");
      err.status = 400;
      throw err;
    }

    const discountCode = await prisma.discountCode.findUnique({
      where: { code },
    });

    if (!discountCode || discountCode.isUsed) {
      return res.status(404).json({ valid: false, error: "Invalid or already used code" });
    }

    res.json({ valid: true, percentage: discountCode.percentage });
  } catch (err) {
    next(err);
  }
}

module.exports = { validateCode };