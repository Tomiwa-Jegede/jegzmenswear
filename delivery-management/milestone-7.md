# Milestone 7: Hardening & Operations

## Goal

Make Jegzmenswear fast, observable, and safe to operate as a nationwide storefront under real traffic.

## Scope

- Performance/perf: `frontend/scripts/generate-sitemap.cjs`, `preload-hero.cjs`, `vite build` chunking, Cloudinary image sizing (`frontend/src/lib/cloudinary.js:6` allowlist `400/800` + `q_auto:eco` to stay <25 credits), `Wrangler` SPA fallback (`not_found_handling: single-page-application`), `netlify.toml` SPA redirects
- Observability: `GET /api/health` (`status:"ok"`), `morgan("dev")` logging, error handler normalizing `P2025→404` `P2002→409`, `ArewaEvent` metadata (CORS debug logs removed for prod)
- Security/CORS: `backend/src/server.js` `allowedOrigins` from `CLIENT_URL`, prod strict allow-list vs dev `localhost:\d+` + `DEV_ALLOWED_ORIGIN`, admin JWT via `requireAdmin`, `express.json({limit:"10mb"})`
- Jobs: `autoArchiveStaleProducts` (midnight `0 0 * * *`) and `deleteStaleUnverifiedSubscribers` (`*/5 * * * *`) via `node-cron`, both with startup + scheduled error logging
- Analytics/SEO: `react-helmet-async` canonical links, OG/twitter cards in `frontend/index.html`, GTAG `G-XZCX0DQGLD`, TikTok pixel `D9V18P3C77UE58FDAQJ0`, `manifest.json` + favicons
- Quality gates: `frontend/eslint.config.js:1` (0 errors) + `frontend/playwright.config.js:1` (11 specs, `BASE_URL` local/prod) + `frontend/src/components/Spotlight.jsx:35` fix (`setLoadFailed`) + `FadeImage.jsx:1` fallback (`Image unavailable` placeholder)

## Non-Goals

- No new shopper or admin features (scope is hardening only).
- No data migration or schema redesign unless guardrail violation found.

## Ownership Boundaries

- `backend/src/server.js` + `frontend/vite.config.js` `netlify.toml` `frontend/wrangler.jsonc` — platform/infra ownership
- `frontend/scripts/*` + `frontend/index.html` + `frontend/src/components/RouteErrorBoundary.jsx` — frontend SEO/perf ownership
- `backend/src/middleware/*` + `backend/src/controllers/productsController.js` `subscribersController.js` (crons) — backend reliability ownership

## Execution Order

1. Re-verify CORS allow-list (prod = `CLIENT_URL` exact match, dev = localhost regex) and remove secret leakage from logs before deploy — done: debug logs removed in `backend/src/server.js:27`.
2. Harden `GET /api/health` and structured error handling; ensure build (`npm run build`) emits `frontend/dist/` deterministically — done: build verified.
3. Add lint gate `frontend/eslint.config.js:1` and ensure `npm run lint` is 0 errors (33 warnings allowed) — done.
4. Add Playwright config `frontend/playwright.config.js:1` with `BASE_URL` env + local `webServer` preview on 4173 and patch `frontend/tests/site.spec.cjs:34` to respect baseURL — done (`npx playwright test --list` 11 specs).
5. Fix Cloudinary credit overage (25.53/25): bucket all `optimizedImageUrl()` to allowlist `[400,800]` + `q_auto:eco` in `frontend/src/lib/cloudinary.js:6` (was 9 widths) and `frontend/scripts/preload-hero.cjs:18` `w_1600→w_800`; add `FadeImage.jsx:1` 1x1 gif detection + `Image unavailable` placeholder — done, `Hero preload injected: …/f_auto,q_auto:eco,w_800/…` verified.
6. Confirm crons run on startup without throw and on schedule; add monitoring/alerting for missed midnight run.
7. Prune storage: delete archived products via `DELETE /api/products/archived` and review `HeroImages`/`CampaignImages` `isActive` to reduce storage credits.

## Value Outcome

Delivers `product-management/value-map.md` outcome V7 — Business Owner: trust the store runs itself overnight. Visible moment is waking up to correct archiving, accurate health checks, and no CORS/payment regressions after a deploy; proof is sustained 200s on `GET /api/health`, zero 5xx on Flutterwave webhook, and Playwright suite green.

## Status

In progress

- Current status summary: Health endpoint, CORS hardened, `npm run lint` 0 errors, `npm run build` green, `playwright.config.js` wired (11 specs), Cloudinary credit fix live (bucket `400/800` + `q_auto:eco`, was 9 widths → 2; `Hero preload …/w_800` verified; `FadeImage` placeholder for disabled account), crons, error handler, Netlify/Wrangler SPA deploys, GTAG/TikTok, sitemap scripts live. Home editorial re-enabled.
- Remaining work: validate <25 credits after next 30-day reset (monitor Cloudinary Usage), cron alerting, production Brevo/Flutterwave key rotation, and full Playwright run against preview.

## Verification / Definition of Done

- `npm run lint` passes (0 errors, 33 warnings) — verified in `frontend/eslint.config.js`; `npm run build` succeeds and `frontend/dist/` contains `index.html` + hashed `assets/` without errors.
- `npx playwright test --list` shows 11 specs; `BASE_URL=https://jegzmenswear.store npx playwright test` or local `npx playwright test` via `playwright.config.js` passes for public browsing + cart + checkout + admin-guard specs.
- `npx prisma validate --schema=backend/prisma/schema.prisma` passes; `node backend/src/server.js` logs `Onfleek backend running on http://localhost:5000` and startup cron runs without error (debug logs no longer leak `allowedOrigins`).
- Prod `CLIENT_URL` origin succeeds via CORS, unknown origin is rejected with `Not allowed by CORS`.
- `/api/flutterwave/webhook` idempotent replay returns 200 and does not duplicate order rows.

## Regression Guardrails

- Never weaken CORS: prod must remain explicit allow-list, not `*`.
- Never remove `express.json` limit or `morgan` dev logging without replacement.
- Health endpoint must stay unauthenticated and lightweight; no auth guard on `GET /api/health`.
- Crons must not run synchronously blocking the event loop; keep `catch` chains with prefixed log tags (`[auto-archive]`, `[stale-subscribers]`).
- Never add new Cloudinary widths outside allowlist `[400,800]` or revert `q_auto:eco` → `q_auto`; check `frontend/src/lib/cloudinary.js:6` `ALLOWED_WIDTHS` and `frontend/scripts/preload-hero.cjs:18` before any width change — prevents re-exceeding 25 credits.
