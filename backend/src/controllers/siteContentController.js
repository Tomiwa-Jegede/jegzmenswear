const prisma = require("../lib/prisma");

async function getSiteContent(req, res, next) {
  try {
    const rows = await prisma.siteContent.findMany();
    const content = {};
    rows.forEach((r) => {
      content[r.key] = r.value;
    });
    res.json(content);
  } catch (err) {
    next(err);
  }
}

async function upsertSiteContent(req, res, next) {
  try {
    const updates = req.body; // { key: value, ... }
    if (!updates || typeof updates !== "object") {
      const err = new Error("Body must be a key/value object");
      err.status = 400;
      throw err;
    }
    const ops = Object.entries(updates).map(([key, value]) =>
      prisma.siteContent.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      }),
    );
    await Promise.all(ops);
    const rows = await prisma.siteContent.findMany();
    const content = {};
    rows.forEach((r) => {
      content[r.key] = r.value;
    });
    res.json(content);
  } catch (err) {
    next(err);
  }
}

module.exports = { getSiteContent, upsertSiteContent };
