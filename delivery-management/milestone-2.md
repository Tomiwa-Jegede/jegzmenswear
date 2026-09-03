# Milestone 2: Storefront Browsing

## Goal

Anonymous shopper can discover collections and inspect a product's details with correct imagery and pricing before any cart or purchase step.

## Scope

- Pages: `frontend/src/pages/Home.jsx`, `Shop.jsx`, `CollectionPage.jsx`, `ProductPage.jsx`, `Info.jsx`, `Welcome.jsx`
- Components: `Hero.jsx`, `FeaturedCollections.jsx`, `Spotlight.jsx` (`RugbyPoloSpotlight`), `CampaignEditorial.jsx`, `BrandPhilosophy.jsx`, `BreadcrumbTabs.jsx`, `FadeImage.jsx`, `ZoomFocalEditor` rendering
- API consumption: `GET /api/collections`, `GET /api/products`, `GET /api/products/:slug`, `GET /api/collections/:slug`, `GET /api/hero-images`, `GET /api/campaign-images`, `GET /api/site-content`, `GET /api/music`
- Frontend infra: `frontend/src/router.jsx` lazy routes + `MainLayout` + `RouteErrorBoundary`, `axios.js` base `VITE_API_URL`, `react-helmet-async` + OG tags in `frontend/index.html`, `scripts/generate-sitemap.cjs`
- Image fidelity: `ProductImage`/`Collection`/`HeroImage`/`CampaignImage` `desktopCrop*`/`mobileCrop*`/`isPlaceholder`/`isActive` filtering (`isActive` only for public)

## Non-Goals

- No cart, checkout, or payment (M3).
- No admin editing UI (M4).
- No subscriber capture or discount logic (M5).

## Ownership Boundaries

- `frontend/src/pages/` + `frontend/src/components/` + `frontend/src/router.jsx` — frontend owns shopper surfaces
- `backend/src/routes/collections.js` `products.js` `heroImages.js` `campaignImages.js` `siteContent.js` `music.js` (GET paths) — backend owns reads
- `frontend/src/lib/axios.js` `frontend/src/lib/session.js` — session/transport not mutated here beyond reads

## Execution Order

1. Implement `GET` collection/product public routes with `isActive` filtering and slug resolution; seed test data.
2. Build `router.jsx` with lazy pages and `MainLayout` shell.
3. Build `Shop` (grid + collection tabs) and `CollectionPage` (filtered product list).
4. Build `ProductPage` (image gallery with focal crop, `ProductVariant` picker, price, `MeasurementForm`/`SizeGuideModal` read-only display).
5. Wire `Home` hero/campaign editorial, `Helmet` titles/canonical, and `generate-sitemap.cjs` + `preload-hero.cjs`.

## Value Outcome

Delivers `product-management/value-map.md` outcome V1 — Shopper: discover and trust what to buy. Visible moment is opening `/shop` and `/products/:slug` and seeing correct collection, images, and price; proof is page-level Helmet/OG tags present and `GET /api/products/:slug` payload matches rendered content.

## Status

Complete

- Current status summary: Shop, collection, and product detail routes live; public GET APIs filtered correctly; editorial sections re-enabled in `frontend/src/pages/Home.jsx:31` (`FeaturedCollections`, `RugbyPoloSpotlight`, `CampaignEditorial`, `BrandPhilosophy`) and verified via `npm run build` (Home chunk 12.63 kB).
- Remaining work: image CDN/perf audit moved to M7.

## Verification / Definition of Done

- `GET /api/products` returns only `isActive` products; `GET /api/products/:slug` returns single product with ordered `images` (`position`) and `variants`.
- Navigate to `/shop` → `/collections/:slug` → `/products/:slug` renders without 500; invalid slug hits `RouteErrorBoundary` / 404.
- `VITE_API_URL` missing fallback to `http://localhost:5000/api` does not break local dev.
- `npm run build` produces `frontend/dist/` with `index.html` and assets; Lighthouse OG tags present.
- `npx playwright test` shop/product navigation passes (when enabled).

## Regression Guardrails

- Do not expose `isActive: false` or `isPlaceholder` products to public reads.
- Slug routes must stay URL-stable; renaming `slug` is a breaking change.
- `desktopCrop*`/`mobileCrop*` JSON must not be dropped or coerced to numbers incorrectly.
