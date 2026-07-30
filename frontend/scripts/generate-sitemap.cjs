const fs = require("fs");
const path = require("path");

const SITE_URL = "https://jegzmenswear.store";
const API_URL = "https://jegzmenswear.onrender.com/api";

async function fetchAllProducts() {
  const products = [];
  let page = 1;
  let totalPages = 1;
  do {
    const res = await fetch(`${API_URL}/products?page=${page}&limit=100`, {
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`Failed to fetch products page ${page}: ${res.status}`);
    const data = await res.json();
    products.push(...data.products);
    totalPages = data.totalPages;
    page++;
  } while (page <= totalPages);
  return products;
}

async function fetchAllCollections() {
  const res = await fetch(`${API_URL}/collections`, {
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Failed to fetch collections: ${res.status}`);
  return res.json();
}

function urlEntry(loc, changefreq, priority) {
  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function generateSitemap() {
  const [products, collections] = await Promise.all([
    fetchAllProducts(),
    fetchAllCollections(),
  ]);

  const staticUrls = [
    urlEntry(`${SITE_URL}/`, "daily", "1.0"),
    urlEntry(`${SITE_URL}/shop`, "daily", "0.9"),
    urlEntry(`${SITE_URL}/info`, "monthly", "0.5"),
  ];

  const productUrls = products.map((p) =>
    urlEntry(`${SITE_URL}/products/${p.slug}`, "weekly", "0.8")
  );

  const collectionUrls = collections.map((c) =>
    urlEntry(`${SITE_URL}/collections/${c.slug}`, "weekly", "0.7")
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    ...staticUrls,
    ...productUrls,
    ...collectionUrls,
  ].join("\n")}\n</urlset>\n`;

  const outPath = path.join(__dirname, "..", "dist", "sitemap.xml");
  fs.writeFileSync(outPath, xml);
  console.log(`Sitemap written: ${products.length} products, ${collections.length} collections`);
}

generateSitemap().catch((err) => {
  console.error("Sitemap generation failed:", err);
  if (err.cause) console.error("Cause:", err.cause);
  process.exit(1);
});