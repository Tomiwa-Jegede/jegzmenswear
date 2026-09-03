# Milestone 1: Catalog Foundation

## Goal

Admin can create and persist collections, products, variants, and images so every later surface has trustworthy catalog data.

## Scope

- Prisma models `Collection`, `Product`, `ProductVariant`, `ProductImage` in `backend/prisma/schema.prisma` (unique `slug`, unique `sku`, `Decimal(10,2)` price, `Json` crop/measurements)
- Collections routes: `GET /api/collections`, `GET /api/collections/:slug`, `GET /api/collections/admin/all`, `POST /api/collections`, `PUT /api/collections/:id`, `DELETE /api/collections/:id`
- Products routes: `GET /api/products`, `GET /api/products/:slug`, `GET /api/products/admin/all`, `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`, `PATCH /api/products/:id/renew`, `DELETE /api/products/archived`
- Nested routes: `POST /api/products/:id/images`, `PUT /api/products/images/:imageId`, `DELETE /api/products/images/:imageId`, `POST /api/products/:id/variants`, `PUT /api/products/variants/:variantId`, `DELETE /api/products/variants/:variantId`
- Fields: `isActive`, `isFeatured`, `renewedAt`, `position`, `desktopCrop*`/`mobileCrop*`/`isPlaceholder`, `stock`
- `autoArchiveStaleProducts` service + midnight `node-cron` schedule in `backend/src/server.js`

## Non-Goals

- No shopper-facing pages beyond API (browsing is M2).
- No cart, orders, or payments (M3).
- No admin UI polish beyond raw CRUD (UI is M4).
- No Cloudinary transforms or focal editor UX (added in M4).

## Ownership Boundaries

- `backend/prisma/schema.prisma` + `backend/src/controllers/collectionsController.js` `productsController.js` `productImagesController.js` `productVariantsController.js` — backend owns schema and route logic
- `backend/src/routes/collections.js` `products.js` + `backend/src/middleware/requireAdmin.js` — Express routing + auth guard
- `frontend/` — not in scope for this milestone

## Execution Order

1. Lock Prisma schema for `Collection`/`Product`/`Variant`/`Image` (unique constraints, indexes, `Decimal`, `Json`); run `npx prisma validate && npx prisma generate`.
2. Implement collections controller + routes (public reads + admin writes) and verify slug uniqueness returns 409 via `P2002` handler.
3. Implement products controller + routes (public filtered reads `isActive` + admin unfiltered reads) and `GET /:slug` resolution.
4. Implement nested image/variant CRUD with `onDelete: Cascade` and `sku` uniqueness.
5. Implement `renewedAt`/`isActive` + `autoArchiveStaleProducts` and wire `cron.schedule("0 0 * * *")` in `server.js`.

## Value Outcome

Delivers `product-management/value-map.md` outcome V2 — Store Admin: curate the catalog without engineering help. Delivery status is not a claim of visible value; the milestone is done only when the admin can create a product with variants/images via API and see it persist and round-trip correctly.

## Status

Complete

- Current status summary: Schema + all catalog routes + archiving cron live and used by every later milestone.
- Remaining work: none; maintenance only (schema migrations need `prisma validate`).

## Verification / Definition of Done

- `npx prisma validate` passes; `GET /api/health` returns `{status:"ok"}`.
- `POST /api/collections` with duplicate `slug` returns 409; `GET /api/collections/:slug` returns 200 with correct payload.
- `POST /api/products` with valid `collectionId` creates row; `GET /api/products/:slug` resolves; admin routes 401 without `Authorization: Bearer` JWT.
- Variant creation with duplicate `sku` returns 409; image `position` ordering persists.
- `autoArchiveStaleProducts` runs on startup and at midnight without throwing.

## Regression Guardrails

- Never weaken unique constraints on `Collection.slug`, `Product.slug`, `ProductVariant.sku`.
- Price must stay `Decimal(10,2)`; no float math in controllers.
- `P2025`→404 and `P2002`→409 error handler in `server.js` must remain.
