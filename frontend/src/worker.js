const API_BASE = "https://jegzmenswear.onrender.com/api";
const SITE = "https://jegzmenswear.store";

const BOT_UA_REGEX = /googlebot|bingbot|yandex|baiduspider|duckduckbot|slurp|facebookexternalhit|twitterbot|linkedinbot|embedly|slackbot|whatsapp|telegrambot/i;

function esc(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function focal(val) {
  return val && val !== "auto" && val !== "manual" ? val : "center center";
}

function page(head, body) {
  return `<!doctype html><html lang="en"><head><meta charset="UTF-8" />${head}</head><body>${body}</body></html>`;
}

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) return null;
  return res.json();
}

async function renderHome() {
  const head = `
    <title>Jegzmenswear | Men's Fashion Nigeria | Trendy Streetwear &amp; Premium Fits</title>
    <meta name="description" content="Shop premium men's fashion at Jegzmenswear — hoodies, jeans, leather jackets, sneakers, bags, caps, watches &amp; full fits. Fast nationwide delivery." />
    <link rel="canonical" href="${SITE}/" />
  `;
  const body = `
    <h1>Jegzmenswear</h1>
    <p>Shop premium men's fashion — hoodies, jeans, leather jackets, sneakers, bags, caps, watches &amp; full fits. Fast nationwide delivery.</p>
    <nav><a href="/shop">Shop All</a></nav>
  `;
  return page(head, body);
}

async function renderShop() {
  const data = await fetchJson("/products?page=1&limit=12");
  const products = data?.products || [];
  const head = `
    <title>Shop All | Jegzmenswear</title>
    <meta name="description" content="Browse the full Jegzmenswear catalog — hoodies, jackets, jeans, sneakers, bags, caps, watches and more. Filter by collection, search, and price." />
    <link rel="canonical" href="${SITE}/shop" />
  `;
  const items = products.map((p) => {
    const img = p.images?.[0];
    return `
      <li>
        <a href="/products/${esc(p.slug)}">
          ${img ? `<img src="${esc(img.url)}" alt="${esc(img.altText || p.name)}" />` : ""}
          <h3>${esc(p.name)}</h3>
          <p>₦${Number(p.price).toLocaleString()}</p>
        </a>
      </li>`;
  }).join("");
  const body = `<h1>Shop All</h1><ul>${items}</ul>`;
  return page(head, body);
}

async function renderProduct(slug) {
  const product = await fetchJson(`/products/${slug}`);
  if (!product) return null;
  const desc = product.description ? product.description.slice(0, 160) : `Shop ${product.name} at Jegzmenswear.`;
  const ld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images?.map((img) => img.url) || [],
    sku: product.id,
    offers: {
      "@type": "Offer",
      url: `${SITE}/products/${product.slug}`,
      priceCurrency: "NGN",
      price: Number(product.price),
      availability: product.variants?.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  });
  const head = `
    <title>${esc(product.name)} | Jegzmenswear</title>
    <meta name="description" content="${esc(desc)}" />
    <link rel="canonical" href="${SITE}/products/${esc(product.slug)}" />
    <meta property="og:title" content="${esc(product.name)} | Jegzmenswear" />
    <meta property="og:description" content="${esc(desc)}" />
    ${product.images?.[0] ? `<meta property="og:image" content="${esc(product.images[0].url)}" />` : ""}
    <script type="application/ld+json">${ld}</script>
  `;
  const images = (product.images || []).map((img) =>
    `<img src="${esc(img.url)}" alt="${esc(img.altText || product.name)}" style="object-position:${esc(focal(img.desktopCropMode))}" />`
  ).join("");
  const sizes = (product.variants || []).map((v) =>
    `<span>${esc(v.size)}${v.stock < 1 ? " (Out of Stock)" : ""}</span>`
  ).join(" ");
  const body = `
    <h1>${esc(product.name)}</h1>
    <p>${esc(product.collection?.name || "")}</p>
    <div>${images}</div>
    <p>₦${Number(product.price).toLocaleString()}</p>
    <p>${esc(product.description || "")}</p>
    <div>Sizes: ${sizes}</div>
  `;
  return page(head, body);
}

async function renderCollection(slug) {
  const collection = await fetchJson(`/collections/${slug}`);
  if (!collection) return null;
  const desc = collection.description
    ? collection.description.slice(0, 160)
    : `Shop the ${collection.name} collection at Jegzmenswear.`;
  const ld = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collection.name,
    description: collection.description,
    url: `${SITE}/collections/${collection.slug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: (collection.products || []).map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE}/products/${p.slug}`,
        name: p.name,
      })),
    },
  });
  const head = `
    <title>${esc(collection.name)} | Jegzmenswear</title>
    <meta name="description" content="${esc(desc)}" />
    <link rel="canonical" href="${SITE}/collections/${esc(collection.slug)}" />
    <meta property="og:title" content="${esc(collection.name)} | Jegzmenswear" />
    <meta property="og:description" content="${esc(desc)}" />
    <script type="application/ld+json">${ld}</script>
  `;
  const items = (collection.products || []).map((p) => {
    const img = p.images?.[0];
    return `
      <li>
        <a href="/products/${esc(p.slug)}">
          ${img ? `<img src="${esc(img.url)}" alt="${esc(img.altText || p.name)}" />` : ""}
          <p>${esc(p.name)}</p>
          <p>₦${Number(p.price).toLocaleString()}</p>
        </a>
      </li>`;
  }).join("");
  const body = `
    <h1>${esc(collection.name)}</h1>
    ${collection.description ? `<p>${esc(collection.description)}</p>` : ""}
    <ul>${items}</ul>
  `;
  return page(head, body);
}

export default {
  async fetch(request, env, ctx) {
    const ua = request.headers.get("User-Agent") || "";
    if (!BOT_UA_REGEX.test(ua)) {
      return env.ASSETS.fetch(request);
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      let html = null;
      if (path === "/") html = await renderHome();
      else if (path === "/shop") html = await renderShop();
      else if (path.startsWith("/products/")) html = await renderProduct(path.slice("/products/".length));
      else if (path.startsWith("/collections/")) html = await renderCollection(path.slice("/collections/".length));

      if (!html) return env.ASSETS.fetch(request);

      return new Response(html, {
        headers: { "content-type": "text/html; charset=UTF-8" },
      });
    } catch (err) {
      return env.ASSETS.fetch(request);
    }
  },
};