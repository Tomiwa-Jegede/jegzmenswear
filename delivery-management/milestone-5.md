# Milestone 5: Growth — Subscribers, Discounts, Campaigns

## Goal

Turn visitors into returning customers through email capture, verified discount incentives, and product campaign notifications.

## Scope

- Subscribers: `Subscriber` + `DiscountCode` models (`email` unique, `verificationToken` unique, `isUsed`), `backend/src/routes/subscribers.js` (`POST /` with `express-rate-limit` `subscribeLimiter`, `GET /verify/:token`, `GET /` admin), `backend/src/controllers/subscribersController.js` (token generation, `Brevo` sync, `deleteStaleUnverifiedSubscribers` cron every 5 min)
- Discount codes: `backend/src/routes/discountCodes.js` `GET /:code` validation, `DiscountCode` linking `subscriberId` unique + `orderId` unique + `percentage` `Decimal(5,2)` + `isUsed`/`usedAt`
- Campaigns: `backend/src/routes/campaigns.js` `POST /notify-product/:productId` (`requireAdmin`) + `backend/src/controllers/campaignsController.js` (notify subscribers of new/featured product)
- Frontend capture: `frontend/src/components/EmailCapture.jsx` `NewsletterPopup.jsx` + `frontend/src/pages/Checkout.jsx` discount field + `DiscountBadge.jsx`
- Integration: Brevo sync via `backend/src/lib/brevo.js` (if present), `frontend/src/components/WhatsAppBubble.jsx` as auxiliary channel

## Non-Goals

- No cart or payment core logic changes (M3).
- No admin CMS beyond subscribers view (M4).
- No Arewa logic (M6).

## Ownership Boundaries

- `backend/src/controllers/subscribersController.js` `discountCodesController.js` `campaignsController.js` — backend owns subscriber lifecycle and discount logic
- `backend/src/routes/subscribers.js` `discountCodes.js` `campaigns.js` — route ownership with rate limiting
- `frontend/src/components/EmailCapture.jsx` `NewsletterPopup.jsx` + checkout discount field — frontend owns capture/apply UX
- `frontend/wrangler.jsonc` + `netlify.toml` — no infra change in this milestone

## Execution Order

1. Implement `Subscriber`/`DiscountCode` schema and `POST /api/subscribers` with validator + rate limiter + token email.
2. Implement `GET /api/subscribers/verify/:token` → `verified=true` → generate `DiscountCode` (10% default) → Brevo sync (`brevoSynced` flag).
3. Implement `GET /api/discount-codes/:code` validation (existence, not used, subscriber verified) and checkout apply/redeem at `POST /api/orders/confirm`.
4. Implement `POST /api/campaigns/notify-product/:productId` admin trigger for new product announcements.
5. Wire `cron.schedule("*/5 * * * *")` for `deleteStaleUnverifiedSubscribers` (>10 min unverified) and frontend capture components.

## Value Outcome

Delivers `product-management/value-map.md` outcome V5 — Subscriber: get real value for joining the list. Visible moment is subscribing via `EmailCapture`, clicking the verify link, seeing a discount code, and redeeming it at checkout for a reduced `totalAmount`; proof is a `verified` subscriber row with `brevoSynced=true` and an `isUsed=true` discount tied to the order.

## Status

Complete

- Current status summary: Subscribe→verify→discount→redeem loop live; Brevo sync and stale-subscriber cron running.
- Remaining work: validate Brevo production keys and expand campaign segmentation (tracked as opportunity).

## Verification / Definition of Done

- `POST /api/subscribers` with invalid email returns 400; valid email creates `verified=false` row and sends token.
- `GET /api/subscribers/verify/:token` with bad token 400; with good token flips `verified=true` and creates `DiscountCode`.
- `GET /api/discount-codes/:code` returns correct `percentage` and marks `isUsed=false` before redeem, `true` after `POST /api/orders/confirm`.
- Checkout apply: entering invalid code is rejected; entering valid code reduces `totalAmount` by `discountAmount`.
- `deleteStaleUnverifiedSubscribers` removes unverified rows older than 10 min; rate limiter blocks brute-force subscribe.

## Regression Guardrails

- Keep `express-rate-limit` on `POST /api/subscribers`; never disable throttling.
- `Subscriber.email` uniqueness and `verificationToken` expiry must stay enforced.
- `DiscountCode` must stay single-use and tied to a single `Order`; reuse must fail.
