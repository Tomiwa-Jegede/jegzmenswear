# DOX framework

- DOX is highly performant AGENTS.md hierarchy installed here
- Agent must follow DOX instructions across any edits

## Core Contract

- AGENTS.md files are binding work contracts for their subtrees
- Work products, source materials, instructions, records, assets, and durable docs must stay understandable from the nearest applicable AGENTS.md plus every parent AGENTS.md above it

## Read Before Editing

1. Read the root AGENTS.md
2. Identify every file or folder you expect to touch
3. Walk from the repository root to each target path
4. Read every AGENTS.md found along each route
5. If a parent AGENTS.md lists a child AGENTS.md whose scope contains the path, read that child and continue from there
6. Use the nearest AGENTS.md as the local contract and parent docs for repo-wide rules
7. If docs conflict, the closer doc controls local work details, but no child doc may weaken DOX

Do not rely on memory. Re-read the applicable DOX chain in the current session before editing.

## Update After Editing

Every meaningful change requires a DOX pass before the task is done.

Update the closest owning AGENTS.md when a change affects:

- purpose, scope, ownership, or responsibilities
- durable structure, contracts, workflows, or operating rules
- required inputs, outputs, permissions, constraints, side effects, or artifacts
- user preferences about behavior, communication, process, organization, or quality
- AGENTS.md creation, deletion, move, rename, or index contents

Update parent docs when parent-level structure, ownership, workflow, or child index changes. Update child docs when parent changes alter local rules. Remove stale or contradictory text immediately. Small edits that do not change behavior or contracts may leave docs unchanged, but the DOX pass still must happen.

## Hierarchy

- Root AGENTS.md is the DOX rail: project-wide instructions, global preferences, durable workflow rules, and the top-level Child DOX Index
- Child AGENTS.md files own domain-specific instructions and their own Child DOX Index
- Each parent explains what its direct children cover and what stays owned by the parent
- The closer a doc is to the work, the more specific and practical it must be

## Child Doc Shape

- Create a child AGENTS.md when a folder becomes a durable boundary with its own purpose, rules, responsibilities, workflow, materials, or quality standards
- Work Guidance must reflect the current standards of the project or user instructions; if there are no specific standards or instructions yet, leave it empty
- Verification must reflect an existing check; if no verification framework exists yet, leave it empty and update it when one exists

Default section order:
- Purpose
- Ownership
- Local Contracts
- Work Guidance
- Verification
- Child DOX Index

## Style

- Keep docs concise, current, and operational
- Document stable contracts, not diary entries
- Put broad rules in parent docs and concrete details in child docs
- Prefer direct bullets with explicit names
- Do not duplicate rules across many files unless each scope needs a local version
- Delete stale notes instead of explaining history
- Trim obvious statements, repeated rules, misplaced detail, and warnings for risks that no longer exist

## Closeout

1. Re-check changed paths against the DOX chain
2. Update nearest owning docs and any affected parents or children
3. Refresh every affected Child DOX Index
4. Remove stale or contradictory text
5. Run existing verification when relevant
6. Report any docs intentionally left unchanged and why

## User Preferences

- Communication: concise, factual, cite `file_path:line_number` for code refs, no emojis unless requested
- Code conventions: ESLint for frontend (`frontend/eslint.config` via `npm run lint`), Prisma `prisma/schema.prisma` is DB source of truth, `x-session-id` header for cart/arewa session, `Authorization: Bearer` JWT for admin (`localStorage.onfleek_admin_token`)
- Verification commands: `frontend: npm run lint && npm run build`, `frontend E2E: npx playwright test`, `backend: npx prisma validate && node src/server.js` (health at `GET /api/health`)
- Branch: `main` is deploy branch; Netlify builds `frontend/dist`, backend runs on Node host, Cloudflare via `wrangler deploy`

## Project Overview

Jegzmenswear — Premium menswear e-commerce platform for curated streetwear and tailored fits with seamless browsing, cart, and nationwide delivery in Nigeria.

**Stack:** JavaScript · Node.js 20 · Express 5 · React 19 + Vite 8 + React Router 7 · Tailwind CSS 4 · Prisma 7 + PostgreSQL (pg + @prisma/adapter-pg) · Cloudinary (images/audio) · Flutterwave (payments) · JWT + bcryptjs · Wrangler (Cloudflare SPA) · Axios · Framer Motion · Helmet · npm · ESLint · Playwright · Node-cron

**Repo layout:**
- `frontend/` — React SPA (Vite, `src/pages/`, `src/components/`, `src/context/`, `src/lib/`, `public/`, `scripts/`, `dist/`)
- `backend/` — Express API (`src/server.js`, `src/routes/`, `src/controllers/`, `src/middleware/`, `src/lib/`, `prisma/schema.prisma`, `prisma.config.ts`)
- `delivery-management/` — engineering sequencing: `roadmap.md` + `milestone-*.md`
- `product-management/` — value workspace: `value-map.md` + `value-chain-opportunities/MAP.md`
- Root configs: `netlify.toml` (SPA redirects), `frontend/wrangler.jsonc`, `.gitignore`, `test-results/`

## Repository Layout Contract

- Git: `main` is source of truth; feature branches short-lived; commit includes both `frontend/` and `backend/` changes when cross-cutting; never commit secrets or `dist/` beyond build output
- Ignores: `node_modules/`, `frontend/dist/`, `.wrangler/`, `.env` (both `frontend/.env` `VITE_API_URL` and `backend/.env` `DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_*`, `FLUTTERWAVE_*`, `CLIENT_URL`) are gitignored; see `frontend/.gitignore` and repo `.gitignore`
- Secrets: env vars only via `.env` locally and Netlify / host env in prod; admin token stored as `localStorage.onfleek_admin_token`; session id via `frontend/src/lib/session.js` → `x-session-id` header
- Build outputs: `frontend/dist/` generated by `vite build`; `backend` has no build step — runs `node src/server.js`; `prisma generate` runs on `postinstall`
- Single repo, two deployables: Netlify serves `frontend`, Node host serves `backend`; CORS allow-list from `backend/src/server.js:allowedOrigins` using `CLIENT_URL` / `DEV_ALLOWED_ORIGIN`

## Frontend Direction

- Routing: `frontend/src/router.jsx` with `MainLayout` + `RouteErrorBoundary` + lazy pages; public: `Home` `Shop` `CollectionPage` `ProductPage` `CartPage` `Checkout` `OrderSuccess` `Info` `Welcome`; admin under `ProtectedAdminRoute` (`AdminHome`, `AdminHeroImages`, `AdminCampaignImages`, `AdminProducts`, `AdminCollections`, `AdminSiteContent`, `AdminMusic`, `AdminOrders`, `AdminSubscribers`)
- State: `CartContext` (session cart via `x-session-id`), `AdminAuthContext`, `ToastContext`; API via `frontend/src/lib/axios.js` (base `VITE_API_URL`, injects session + admin token)
- Styling: Tailwind 4 via `@tailwindcss/vite`; `framer-motion` for motion; `ZoomFocalEditor` for image crop focal control
- SEO/perf: `react-helmet-async`, sitemap + hero preload scripts (`frontend/scripts/generate-sitemap.cjs`, `preload-hero.cjs`), OG tags in `frontend/index.html`, analytics (GTAG + TikTok pixel)
- Quality: `npm run lint` must pass; `npm run build` must produce `dist/` without errors; Playwright specs in `frontend/tests/`

## Backend Direction

- Entry: `backend/src/server.js` — Express + CORS (prod=`CLIENT_URL` allow-list, dev=`localhost` regex + `DEV_ALLOWED_ORIGIN`) + `express.json` + `morgan` + mount routers under `/api/*` + error handler (P2025→404, P2002→409) + cron jobs (midnight `autoArchiveStaleProducts`, every-5-min `deleteStaleUnverifiedSubscribers`)
- Routes (`backend/src/routes/`): `collections`, `products` (incl `images` + `variants` sub-routes), `cart` (session-guarded), `admin` (login + cloudinary-signature), `heroImages`, `campaignImages`, `campaigns`, `siteContent`, `music`, `orders` (pending → confirm → flutterwave webhook), `flutterwave`, `subscribers` (subscribe + verify + brevo sync), `discountCodes` (validate), `arewa` (session chat)
- DB: `backend/prisma/schema.prisma` (PostgreSQL) — models: `Collection`, `Product`, `ProductVariant`, `ProductImage`, `Cart`/`CartItem`, `CampaignImage`, `HeroImage`, `Music`, `SiteContent`, `Order`/`OrderItem` (enums `PaymentStatus`/`OrderStatus`/`FulfillmentMethod`), `Subscriber`/`DiscountCode`, `ArewaConversation`/`ArewaMessage`/`ArewaConfig`/`ArewaEvent`; use `Decimal` for prices, `Json` for measurements/crop metadata
- Auth: admin JWT via `backend/src/middleware/` (`requireAdmin`), session id via `requireSession` (`x-session-id`); `bcryptjs` + `jsonwebtoken` + `validator`; rate-limit on `subscribers` via `express-rate-limit`
- Media/payments: Cloudinary upload via `multer` + signed uploads (`admin/cloudinary-signature`), Flutterwave webhook at `POST /api/flutterwave/webhook`
- Verification: `npx prisma validate`, `npx prisma generate` after schema edit, `GET /api/health` returns `{status:"ok"}`

## Cross-Module Contracts

- API contract: frontend `VITE_API_URL` → backend `/api/*`; every cart/arewa/chat request carries `x-session-id`; admin requests carry `Authorization: Bearer <JWT>`; CORS must allow the deployed frontend origin in `CLIENT_URL`
- Data contract: `Collection.slug` / `Product.slug` are unique and URL-stable (`/collections/:slug`, `/products/:slug`); `ProductVariant.sku` unique; `Order.paymentReference` unique; `Subscriber.email` + `DiscountCode.code` unique; prices as `Decimal(10,2)` strings over JSON
- Media contract: images carry `desktopCrop*` + `mobileCrop*` + `position` + `isActive`/`isPlaceholder`; Cloudinary `publicId` stored for `Music` and image transforms; no raw file paths in DB
- Order contract: `POST /api/orders/pending` → Flutterwave → `POST /api/flutterwave/webhook` or `POST /api/orders/confirm` → `PaymentStatus PAID/FAILED`, `OrderStatus PENDING→PROCESSING→DELIVERED`; discount validation via `GET /api/discount-codes/:code` before confirm
- Arewa contract: `POST /api/arewa/chat` is session-scoped (`ArewaConversation.sessionId` unique), `ArewaConfig` drives greeting/personality/featured exclusions; events logged to `ArewaEvent`

## Child DOX Index

This root doc owns:
- `frontend/` — React SPA storefront and admin console
- `backend/` — Express + Prisma API and job runners
- `delivery-management/` — engineering delivery planning and milestone sequencing
- `product-management/` — product value workspace and opportunity mapping
- Root configs — `netlify.toml`, `frontend/wrangler.jsonc`, `.gitignore`, env contracts

Child docs:
- `delivery-management/AGENTS.md` — delivery planning, roadmap and milestone tracking rules
- `product-management/AGENTS.md` — value workspace, value map and value-chain opportunity rules
