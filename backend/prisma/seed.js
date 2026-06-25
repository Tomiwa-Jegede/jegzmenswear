const prisma = require("../src/lib/prisma");

const COLLECTIONS = [
  {
    name: "Hoodies",
    slug: "hoodies",
    description: "Heavyweight comfort built for quiet confidence.",
    heroImageUrl: "/placeholders/campaign-portrait-01.jpg",
  },
  {
    name: "Sweatshirts",
    slug: "sweatshirts",
    description: "Everyday luxury, styled with intention.",
    heroImageUrl: "/placeholders/campaign-portrait-02.jpg",
  },
  {
    name: "Tracksuits",
    slug: "tracksuits",
    description: "Modern heritage, made for movement.",
    heroImageUrl: "/placeholders/campaign-portrait-03.jpg",
  },
  {
    name: "Denim",
    slug: "denim",
    description: "Street elegance, cut for longevity.",
    heroImageUrl: "/placeholders/campaign-portrait-04.jpg",
  },
  {
    name: "Rugby / Polo",
    slug: "rugby-polo",
    description: "Campus icons, reimagined as collectibles.",
    heroImageUrl: "/placeholders/campaign-portrait-05.jpg",
  },
];

const SIZES = ["S", "M", "L", "XL"];

async function main() {
  console.log("Seeding Onfleek catalog...");

  for (const [ci, collectionData] of COLLECTIONS.entries()) {
    const collection = await prisma.collection.upsert({
      where: { slug: collectionData.slug },
      update: collectionData,
      create: { ...collectionData, position: ci },
    });

    for (let p = 1; p <= 2; p++) {
      const productSlug = `${collection.slug}-sample-${p}`;
      const product = await prisma.product.upsert({
        where: { slug: productSlug },
        update: {},
        create: {
          name: `${collection.name} Sample ${p}`,
          slug: productSlug,
          description:
            "Placeholder product — replace with real campaign copy in Phase 7.",
          price: 45000 + p * 5000,
          isFeatured: p === 1,
          collectionId: collection.id,
          images: {
            create: [
              {
                url: `/placeholders/campaign-portrait-${String(
                  (ci % 5) + 1,
                ).padStart(2, "0")}.jpg`,
                altText: `Campaign Portrait Placeholder ${String(
                  (ci % 5) + 1,
                ).padStart(2, "0")}`,
                position: 0,
                isPlaceholder: true,
              },
            ],
          },
          variants: {
            create: SIZES.map((size) => ({
              size,
              sku: `${productSlug}-${size}`.toUpperCase(),
              stock: 25,
            })),
          },
        },
      });
      console.log(`  -> ${product.name}`);
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
