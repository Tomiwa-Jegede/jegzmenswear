const fs = require("fs");
const path = require("path");

const API_URL = "https://jegzmenswear.onrender.com/api";

async function fetchWithRetry(url, options = {}, retries = 3, delayMs = 5000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`Fetch attempt ${attempt} failed for ${url}, retrying in ${delayMs / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

function optimizedUrl(url, width) {
  if (!url || !url.includes("/upload/")) return url;
  const stripped = url.replace(/\/upload\/[^/]*\/v/, "/upload/v");
  const b = width <= 400 ? 400 : 800;
  return stripped.replace("/upload/", `/upload/f_auto,q_auto:eco,w_${b}/`);
}

async function injectHeroPreload() {
  const res = await fetchWithRetry(`${API_URL}/hero-images`);
  if (!res.ok) throw new Error(`Failed to fetch hero images: ${res.status}`);
  const images = await res.json();

  if (!images.length) {
    console.log("No active hero images found — skipping preload injection.");
    return;
  }

  const firstImage = images[0];
  const preloadUrl = optimizedUrl(firstImage.url, 800);

  const htmlPath = path.join(__dirname, "..", "dist", "index.html");
  let html = fs.readFileSync(htmlPath, "utf8");

  const preloadTag = `    <link rel="preconnect" href="https://res.cloudinary.com" crossorigin />\n    <link rel="preload" as="image" href="${preloadUrl}" fetchpriority="high" />\n`;

  html = html.replace("</head>", `${preloadTag}  </head>`);
  fs.writeFileSync(htmlPath, html);

  console.log(`Hero preload injected: ${preloadUrl}`);
}

injectHeroPreload().catch((err) => {
  console.error("Hero preload injection failed:", err);
  // Non-fatal — don't fail the whole build if this step has an issue
  process.exit(0);
});