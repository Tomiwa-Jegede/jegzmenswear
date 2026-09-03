# Milestone 3: Cart, Checkout & Payments

## Goal

Shopper can add variant items to a persistent session cart, choose delivery or pickup, apply a discount, and pay securely via Flutterwave to create a real order.

## Scope

- Session: `frontend/src/lib/session.js` + `x-session-id` header (via `frontend/src/lib/axios.js` interceptor) + `backend/src/middleware/requireSession.js` (enforced on `cart` and `arewa` routes)
- Cart: `Cart`/`CartItem` models, `backend/src/routes/cart.js` (`GET /`, `POST /items`, `PUT /items/:itemId`, `PUT /items/:itemId/measurements`, `DELETE /items/:itemId`), `CartContext`, `CartDrawer`, `CartPage`
- Checkout: `frontend/src/pages/Checkout.jsx` + `OrderSuccess.jsx`, `MeasurementForm` + `MeasurementModal` capturing `Json` measurements per item, `FulfillmentMethod` (DELIVERY vs PICKUP), `deliveryAddress`/`deliveryFee` (`Decimal`) logic
- Orders: `Order`/`OrderItem` models with `PaymentStatus` (PENDING/PAID/FAILED) `OrderStatus` (PENDING→PROCESSING→DELIVERED/CANCELLED), `backend/src/routes/orders.js` (`POST /pending`, `POST /confirm`, `GET /`, `GET /:id`, `PATCH /:id/status`), `discountAmount`/`appliedDiscountCode`
- Payments: `backend/src/routes/flutterwave.js` `POST /webhook` + `backend/src/controllers/ordersController.js` confirm logic, `flutterwave` service, `paymentReference` unique idempotency
- Discount validation: `GET /api/discount-codes/:code` (`backend/src/routes/discountCodes.js`) applied at checkout

## Non-Goals

- No admin order management UI (M4 covers `AdminOrders`).
- No subscriber generation of discount codes (M5).
- No Arewa recommendations at checkout (M6).

## Ownership Boundaries

- `backend/src/controllers/cartController.js` `ordersController.js` `discountCodesController.js` + `backend/src/routes/cart.js` `orders.js` `discountCodes.js` `flutterwave.js` — backend owns cart/order/payment logic
- `frontend/src/context/CartContext.jsx` + `frontend/src/pages/CartPage.jsx` `Checkout.jsx` `OrderSuccess.jsx` + `frontend/src/components/CartDrawer.jsx` `MeasurementForm.jsx` — frontend owns cart state and checkout UX
- `frontend/src/lib/session.js` `axios.js` — session transport shared across cart/arewa

## Execution Order

1. Implement `x-session-id` generation/persistence and `requireSession` middleware; prove `GET /api/cart` returns per-session cart.
2. Implement `Cart`/`CartItem` CRUD with `@@unique([cartId, variantId])` and quantity/measurements upsert.
3. Build `CartContext` + `CartDrawer` + `CartPage` with quantity steppers and remove actions.
4. Build `Checkout` (delivery vs pickup, address, fee, discount-code field with `GET /api/discount-codes/:code` validation, `Decimal` totals).
5. Implement `POST /api/orders/pending` → Flutterwave init + `POST /api/flutterwave/webhook` / `POST /api/orders/confirm` with `paymentReference` idempotency and status transitions; route to `OrderSuccess`.

## Value Outcome

Delivers `product-management/value-map.md` outcome V3 — Shopper: complete a purchase end-to-end. Visible moment is placing an order from `Checkout` and landing on `OrderSuccess` with a confirmed `paymentReference`; proof is a `PAID` order row with `OrderItem`s persisted and idempotent webhook handling.

## Status

Complete

- Current status summary: Session cart, checkout with measurements/fulfillment, Flutterwave webhook + confirm, and order items all live; `DiscountCode` redeem validated at checkout.
- Remaining work: harden webhook signature verification and add retries for failed webhooks (tracked in M7).

## Verification / Definition of Done

- Add variant to cart anonymously, refresh browser, `GET /api/cart` returns same items (session persistence).
- `POST /api/orders/pending` returns `paymentReference`; `POST /api/flutterwave/webhook` with same reference is idempotent; `GET /api/orders/:id` as admin transitions `PENDING→PROCESSING`.
- `GET /api/discount-codes/:code` returns correct `percentage` and marks invalid/used codes appropriately.
- `PUT /api/cart/items/:itemId/measurements` persists `Json` and round-trips via `CartPage`.
- Unit math: `subtotal` + `deliveryFee` − `discountAmount` = `totalAmount` with `Decimal` precision.

## Regression Guardrails

- Never remove `x-session-id` header injection; cart must stay anonymous and session-scoped.
- `paymentReference` uniqueness must stay enforced; duplicate webhook must not create duplicate orders.
- Admin order status patch must keep allowed transitions; no silent `PENDING→DELIVERED` skip.
