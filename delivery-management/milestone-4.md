# Milestone 4: Admin CMS

## Goal

Store admin can manage every shopper-visible surface — catalog, imagery, content, music, and orders — without engineering involvement.

## Scope

- Auth: `backend/src/routes/admin.js` (`POST /login`, `GET /cloudinary-signature`) + `backend/src/controllers/adminController.js` (`bcryptjs` + `jsonwebtoken`) + `backend/src/middleware/requireAdmin.js`; frontend `frontend/src/pages/admin/AdminLogin.jsx` + `frontend/src/context/AdminAuthContext.jsx` + `frontend/src/components/ProtectedAdminRoute.jsx` + `localStorage.onfleek_admin_token`
- Products admin: `frontend/src/pages/admin/AdminProducts.jsx` with `ZoomFocalEditor` + Cloudinary signed uploads, variant/ image CRUD via `backend/src/routes/products.js` nested paths
- Collections admin: `frontend/src/pages/admin/AdminCollections.jsx`
- Hero/Campaign: `frontend/src/pages/admin/AdminHeroImages.jsx` `AdminCampaignImages.jsx` + `backend/src/routes/heroImages.js` `campaignImages.js` (`GET /` public + `GET /all` admin + `POST/PUT/DELETE` admin)
- Site content & music: `frontend/src/pages/admin/AdminSiteContent.jsx` `AdminMusic.jsx` + `backend/src/routes/siteContent.js` (`GET /`, `PUT /`) + `music.js` (`GET /`, `GET /all`, `POST` with `multer` `upload.single("audio")`, `PATCH /:id/activate`, `DELETE /:id`)
- Orders & subscribers admin: `frontend/src/pages/admin/AdminOrders.jsx` `AdminSubscribers.jsx` + `backend/src/routes/orders.js` `subscribers.js` admin reads + `PATCH /:id/status`
- Shared: `HeroImage` `CampaignImage` `SiteContent` `Music` models; `position`/`isActive` toggles

## Non-Goals

- No shopper browsing logic changes (M2).
- No payment/subscriber growth wiring (M3/M5) beyond admin read surfaces.
- No Arewa config UI (M6).

## Ownership Boundaries

- `backend/src/routes/admin.js` `heroImages.js` `campaignImages.js` `siteContent.js` `music.js` `orders.js` `subscribers.js` + their controllers — backend owns admin-auth-gated mutations
- `frontend/src/pages/admin/*` + `ProtectedAdminRoute.jsx` `AdminAuthContext.jsx` — frontend owns admin UX and guard
- `backend/src/middleware/requireAdmin.js` + `cloudinary` service via `multer` — shared infra

## Execution Order

1. Implement admin login + JWT + `requireAdmin` and `getCloudinarySignature` for signed uploads.
2. Build `ProtectedAdminRoute` + `AdminHome` navigation shell.
3. Implement `AdminProducts` + `AdminCollections` (CRUD + `ZoomFocalEditor` crop persistence `desktopCrop*`/`mobileCrop*`).
4. Implement `AdminHeroImages` `AdminCampaignImages` `AdminSiteContent` `AdminMusic` with `isActive`/`position` ordering.
5. Implement `AdminOrders` (list, detail, `PATCH /:id/status`) and `AdminSubscribers` read surface.

## Value Outcome

Delivers `product-management/value-map.md` outcome V4 — Store Admin: operate the store daily without engineers. Visible moment is an admin logging into `/admin/login` and publishing a hero image, updating a product's focal crop, and marking an order as PROCESSING — all persisting without a redeploy.

## Status

Complete

- Current status summary: All 8 admin consoles live (`admin` index + `hero`, `campaign`, `products`, `collections`, `site-content`, `music`, `orders`, `subscribers`); JWT guard enforced; Cloudinary signature flow works.
- Remaining work: none for core CMS; polish pending on bulk upload and drag-reorder (tracked as opportunities in `product-management/value-chain-opportunities/MAP.md`).

## Verification / Definition of Done

- `POST /api/admin/login` with wrong password 401; with correct password returns JWT; unauthenticated `POST /api/products` returns 401.
- `GET /api/admin/cloudinary-signature` requires admin JWT; response contains valid timestamp/signature.
- `PUT /api/hero-images/:id` toggles `isActive`; public `GET /api/hero-images` filters correctly.
- `POST /api/products/:id/images` with `ZoomFocalEditor` crop payload persists `desktopCropX/Y/Width/Height/Zoom` and round-trips.
- `PATCH /api/orders/:id/status` advances `OrderStatus` and is visible in `AdminOrders`.

## Regression Guardrails

- Keep `requireAdmin` on all admin-muted routes; never open `POST/PUT/DELETE` to public.
- Cloudinary `publicId` for `Music` must remain stored; no local file path persistence.
- `isActive` filtering for public reads must stay; admin reads (`/all`) must stay unfiltered.
