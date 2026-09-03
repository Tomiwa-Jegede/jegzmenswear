# Value Map — Value to Deliver

> Canonical value artifact for Jegzmenswear. Tracks what value is delivered, to whom, and how it is proven — separately from how engineering delivers it (`delivery-management/`).

## How to read this map

- A value outcome is delivered only when a stakeholder can feel it
- Status is value status, not engineering status
- Each row carries a stable Outcome ID (e.g. `V1`) that delivery milestone trackers reference as their proof-of-value target
- Each row names the owning delivery milestone(s) and the must-not-fail promise

## Value by stakeholder

| Outcome ID | Stakeholder | Value to deliver | Visible moment | Proof measure | Status | Owning delivery | Must-not-fail promise |
|---|---|---|---|---|---|---|---|
| V1 | Shopper — Discovery | Discover curated menswear by collection and product with accurate imagery and price | Opening `/shop`, `/collections/:slug`, `/products/:slug` and seeing correct active products, ordered images, and `Decimal(10,2)` price | Public `GET /api/products/:slug` payload matches rendered page; Helmet OG/canonical tags present; zero `isActive:false` leakage | DELIVERED | M2 — Storefront Browsing (`delivery-management/milestone-2.md`) | Slug URLs stay stable; public reads never expose inactive/placeholder products |
| V2 | Store Admin — Catalog | Curate collections, products, variants, and images without engineering help | Creating a collection + product with variants/images via admin and seeing it persist and round-trip | `POST /api/collections` + `POST /api/products` create rows; variant `sku` unique; image `position`/`desktopCrop*`/`mobileCrop*` round-trips | DELIVERED | M1 — Catalog Foundation (`delivery-management/milestone-1.md`) | Unique `slug`/`sku` invariants; `Decimal(10,2)` pricing never floats |
| V3 | Shopper — Purchase | Add variants to cart and complete a purchase with delivery/pickup and Flutterwave payment | Going `CartPage` → `Checkout` → `OrderSuccess` with a valid `paymentReference` and confirmed order | End-to-end `POST /api/cart/items` → `POST /api/orders/pending` → webhook/confirm → `PaymentStatus PAID` with `OrderItem`s persisted and idempotent webhook | DELIVERED | M3 — Cart, Checkout & Payments (`delivery-management/milestone-3.md`) | Session cart persists via `x-session-id`; `paymentReference` unique; financial math exact |
| V4 | Store Admin — Operations | Operate hero, campaigns, site content, music, orders, and subscribers daily | Logging into `/admin/login` and publishing a hero image, tuning a product's focal crop in `ZoomFocalEditor`, advancing an order's `OrderStatus` | Admin JWT (`onfleek_admin_token`) + `requireAdmin` gate; `GET /cloudinary-signature` issued; `PATCH /orders/:id/status` transitions persisted | DELIVERED | M4 — Admin CMS (`delivery-management/milestone-4.md`) | All mutating `/api/*` admin routes stay 401 without JWT; `isActive` public filtering preserved |
| V5 | Subscriber — Incentive | Get tangible value for sharing email — verified discount redeemable at checkout | Subscribing via `EmailCapture`/`NewsletterPopup`, clicking verify link, receiving code, redeeming at `Checkout` for reduced total | `Subscriber verified=true` + `brevoSynced=true` → generated `DiscountCode` (10%) → `GET /api/discount-codes/:code` validates → `discountAmount` applied → `isUsed=true` after order | DELIVERED | M5 — Growth (`delivery-management/milestone-5.md`) | Rate-limit on subscribe; discount single-use; no reuse across orders |
| V6 | Shopper — Guidance | Receive warm, on-brand style guidance and discovery help in-session | Opening `ArewaWidget`, asking for occasion-based fit advice, receiving config-aware recommendation with product links | Two `POST /api/arewa/chat` calls with same `x-session-id` share `ArewaConversation` history; `ArewaConfig` greeting/personality + `featured`/`excludedProductIds` respected; `ArewaEvent` logged | DELIVERED | M6 — Arewa AI (`delivery-management/milestone-6.md`) | Session-scoped (`ArewaConversation.sessionId` unique); `requireSession` enforced |
| V7 | Business Owner — Reliability | Trust the store runs correctly overnight and under real traffic | Waking up to correct archiving, passing health checks, and stable deploys without CORS/payment regression | `GET /api/health` 200, `autoArchiveStaleProducts` + `deleteStaleUnverifiedSubscribers` crons run without throw; `vite build` green, `npm run lint` 0 errors, `playwright.config.js` 11 specs wired; idempotent webhook; CORS debug leakage removed | PARTIAL | M7 — Hardening & Ops (`delivery-management/milestone-7.md`) | CORS prod allow-list; `P2025→404`/`P2002→409`; crons non-blocking |

## Cross-cutting value gaps

1. **Playwright coverage wired but not yet run in CI** — `frontend/playwright.config.js:1` + `frontend/tests/site.spec.cjs:34` now respect `BASE_URL` with local `webServer` preview (11 specs); remaining is to run full suite against preview in CI gate — owned by M7.
2. **Brevo/campaign segmentation depth** — subscriber→Brevo sync is DELIVERED for single-list; targeted segmentation and bulk notify analytics are gaps — owned by M5 and MAP opportunity.
3. **Image CDN/cache headers** — `preload-hero.cjs` and Cloudinary transforms live but response `Cache-Control` and `w_*` sizing audit still pending — owned by M7.

## Sequencing principle

- Every delivery milestone must make a named stakeholder feel a value outcome before the next big delivery begins
- Value decisions are argued here by stakeholder value and sequenced by dependency in delivery-management
- External integration is delivered only after internal value is trustworthy (catalog before Flutterwave/Brevo/Cloudinary wiring)

## Deliberately not promised

- Native iOS/Android apps — web SPA only via Netlify + Wrangler
- Multi-vendor marketplace — single-brand Jegzmenswear catalog only
- In-house logistics fleet — delivery via third-party `deliveryFee` + `pickup` option
- ERP/warehouse management — inventory is single-field `stock` per `ProductVariant`
- AI recommendations beyond Arewa conversational assistant
