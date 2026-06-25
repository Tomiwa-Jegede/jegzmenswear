function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(prisma, modelName, name, excludeId) {
  const base = slugify(name);
  let slug = base;
  let counter = 2;

  while (true) {
    const existing = await prisma[modelName].findFirst({
      where: excludeId ? { slug, NOT: { id: excludeId } } : { slug },
    });
    if (!existing) return slug;
    slug = `${base}-${counter}`;
    counter++;
  }
}

module.exports = { slugify, generateUniqueSlug };
