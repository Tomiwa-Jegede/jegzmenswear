# Product Roadmap

## Purpose

Sequences how Jegzmenswear ships from catalog foundation to storefront, checkout, admin CMS, growth, and AI assistant — tracking each milestone's dependency order and current delivery status.

## Product North Star

A shopper in Nigeria can discover a curated menswear fit, trust the product detail, check out in under 60 seconds with Flutterwave, and get reliable delivery or pickup — while an admin can manage the entire catalog and campaign surface without engineering help.

## Product Surfaces

### Current Core Surfaces

- `frontend/src/pages/Home.jsx` + `Hero` `CampaignEditorial` — brand landing with hero/campaign carousels and SEO
- `frontend/src/pages/Shop.jsx` + `CollectionPage.jsx` — faceted browsing by collection, active product filtering
- `frontend/src/pages/ProductPage.jsx` — product detail with `ProductImage` focal crops, `ProductVariant` size/color/sku, `MeasurementForm`
- `frontend/src/pages/CartPage.jsx` + `Checkout.jsx` + `OrderSuccess.jsx` — session cart, delivery/pickup, Flutterwave payment, order confirmation
- `frontend/src/pages/admin/*` — admin CMS (login + 8 consoles: hero, campaign, products, collections, site-content, music, orders, subscribers)
- `ArewaWidget` + `POST /api/arewa/chat` — session-scoped conversational shopping assistant
- `backend/src/routes/*` — 14 API slices under `/api/*` with Prisma 7 + PostgreSQL

### Planning Focus Areas

- Catalog image fidelity: desktop/mobile focal crops, `ZoomFocalEditor`, Cloudinary transforms
- Checkout reliability: pending → confirm → webhook idempotency, `Decimal(10,2)` pricing, discount code validation
- Admin velocity: single-screen CRUD for every surface without redeploy
- Growth loop: subscriber verification → Brevo sync → discount code → order attribution
- Arewa personalization: `ArewaConfig` featured/excluded products, greeting/personality tuning, event logging

## Architecture Boundary

- `frontend/` — React SPA (Vite) owns routing, session injection (`x-session-id`), admin JWT (`Authorization: Bearer`), UI/SEO, and storefront surfaces; never owns DB schema
- `backend/src/routes` + `controllers` — Express owns validation, auth (`requireAdmin`/`requireSession`), and route orchestration
- `backend/prisma/schema.prisma` — PostgreSQL is source of truth for `Collection`/`Product`/`Variant`/`Image`/`Cart`/`Order`/`Subscriber`/`Arewa`; code follows schema, not the reverse
- `backend/src/lib` (Cloudinary, Flutterwave, Brevo) — external integrations owned behind service modules; no secrets in code
- `backend/src/server.js` — cron ownership: `autoArchiveStaleProducts` (midnight) + `deleteStaleUnverifiedSubscribers` (*/5 min)

Product semantics stay in the correct layer: price math in backend, display formatting in frontend.

## Milestone Map

Each subsection mirrors a `milestone-{n}.md` tracker file. Numbering is stable.

### Milestone 1: Catalog Foundation

- Goal: Admin can create collections and products with variants/images that persist correctly in PostgreSQL.
- Includes: `Collection`/`Product`/`ProductVariant`/`ProductImage` Prisma models, `POST/PUT/GET/DELETE` collections & products routes, `isActive`/`isFeatured` filtering, `renewedAt` auto-archive groundwork.
- Status summary: DELIVERED — schema and CRUD live; used by all later milestones.
- Tracker: see [`milestone-1.md`](./milestone-1.md)

### Milestone 2: Storefront Browsing

- Goal: Anonymous shopper can browse Shop, open a collection, and view a product detail with correct images/pricing.
- Includes: `Shop` `CollectionPage` `ProductPage`, `GET /api/collections` `GET /api/products` `GET /api/products/:slug`, `DesktopCrop*`/`MobileCrop*` rendering, SEO (`Helmet`, OG tags, sitemap scripts).
- Status summary: DELIVERED — core browsing plus Home editorial (`FeaturedCollections`, `RugbyPoloSpotlight`, `CampaignEditorial`, `BrandPhilosophy`) re-enabled in `Home.jsx:31`.
- Tracker: see [`milestone-2.md`](./milestone-2.md)

### Milestone 3: Cart, Checkout & Payments

- Goal: Shopper can add variants to a session cart, check out with delivery/pickup, and pay via Flutterwave.
- Includes: `Cart`/`CartItem` session (`x-session-id` via `requireSession`), `POST /api/cart/items` `PUT/DELETE`, `POST /api/orders/pending` → Flutterwave → `POST /api/flutterwave/webhook` / `POST /api/orders/confirm`, `Order`/`OrderItem` with `PaymentStatus`/`OrderStatus`/`FulfillmentMethod`, `Decimal` pricing + `discountCodes` validation.
- Status summary: DELIVERED — end-to-end purchase path live; pending→PAID idempotency verified.
- Tracker: see [`milestone-3.md`](./milestone-3.md)

### Milestone 4: Admin CMS

- Goal: Admin can manage every shopper-visible surface without engineering help.
- Includes: `AdminLogin` JWT (`POST /api/admin/login`), `AdminHeroImages`/`AdminCampaignImages`/`AdminProducts` (with `ZoomFocalEditor` + Cloudinary signature)/`AdminCollections`/`AdminSiteContent`/`AdminMusic`/`AdminOrders`/`AdminSubscribers`, `requireAdmin` guard, CRUD for `HeroImage` `CampaignImage` `SiteContent` `Music`.
- Status summary: DELIVERED — 8 admin consoles live under `ProtectedAdminRoute`.
- Tracker: see [`milestone-4.md`](./milestone-4.md)

### Milestone 5: Growth — Subscribers, Discounts, Campaigns

- Goal: Visitor can subscribe, verify email, receive a discount code, and redeem it at checkout; admin can run campaign notifications.
- Includes: `POST /api/subscribers` (rate-limited) → `GET /api/subscribers/verify/:token` → Brevo sync + `DiscountCode` generation, `GET /api/discount-codes/:code` validation, `POST /api/campaigns/notify-product/:productId`, `NewsletterPopup`/`EmailCapture`, cron `deleteStaleUnverifiedSubscribers`.
- Status summary: DELIVERED — subscribe→verify→discount→redeem loop live.
- Tracker: see [`milestone-5.md`](./milestone-5.md)

### Milestone 6: Arewa AI Assistant

- Goal: Shopper can chat with Arewa for style advice and product discovery within the same session.
- Includes: `ArewaWidget` float, `ArewaConversation`/`ArewaMessage`/`ArewaConfig`/`ArewaEvent`, `POST /api/arewa/chat` (session-scoped), `ArewaConfig` admin tuning (greeting, personality, `featuredProductIds`/`excludedProductIds`, price ranges, recommended occasions).
- Status summary: DELIVERED — session chat live; config tuning in admin.
- Tracker: see [`milestone-6.md`](./milestone-6.md)

### Milestone 7: Hardening & Operations

- Goal: Platform is fast, observable, and safe to operate in production.
- Includes: `vite build` + `generate-sitemap.cjs` + `preload-hero.cjs`, Wrangler SPA deploy, `netlify.toml` redirects, `GET /api/health`, `morgan` logging, CORS allow-list (debug logs removed `backend/src/server.js:27`), error handler (P2025→404, P2002→409), `autoArchiveStaleProducts` cron, GTAG + TikTok pixel, `Helmet` + canonical tags, `eslint.config.js:1` + `playwright.config.js:1`.
- Status summary: IN PROGRESS — health + CORS hardened + `npm run lint` green + `npm run build` + `playwright.config.js` wired with `BASE_URL` local/preview; remaining: cache headers, image CDN audit, cron alerting, Brevo/Flutterwave rotation.
- Tracker: see [`milestone-7.md`](./milestone-7.md)

## Sequencing Rules

- Foundation first: M1 (schema/CRUD) must land before M2/M3 can be built or tested.
- Visible value before next build: no milestone starts until prior milestone has a shopper-visible surface (not backend-only).
- Dependency order: M2 (browse) → M3 (cart/pay) → M5 (discount redeem) → M4 can parallelize with M3 after M1; M6 needs M1+M2 product data.
- Admin follows shopper: admin CRUD ships after the shopper surface it manages is stable.
- External integrations last: Flutterwave/Brevo/Cloudinary wiring behind service modules; never block internal catalog value.
- Cron and observability last: `autoArchive` / `deleteStaleUnverified` and analytics only after core purchase path is trustworthy.

## Regression Guardrails

- No product/collection change may break `Collection.slug`/`Product.slug` URL stability or `/collections/:slug` `/products/:slug` routing.
- Cart and Arewa must keep `x-session-id` header contract; regression test: add item anonymously, refresh, cart persists.
- Admin JWT (`onfleek_admin_token`) + `requireAdmin` must stay enforced for all `/admin/*` and mutating `/api/*` routes; unauthenticated PUT/POST/DELETE must 401.
- Order financial invariants: `subtotal` + `deliveryFee` - `discountAmount` = `totalAmount`; `paymentReference` unique; `P2002` → 409, `P2025` → 404.
- Image crop metadata (`desktopCrop*`/`mobileCrop*`) must survive round-trip; `ZoomFocalEditor` edit → save → reload must return same focal/zoom.
