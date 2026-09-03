# Value Chain Opportunities Map

## Purpose
Unexplored gaps and expansion opportunities; value not yet delivered. Ranked by stakeholder value, not effort.

## How this map is used

- Opportunities are ranked by stakeholder value, not effort
- Each entry names the value gap and the delivery milestone or exploration that would close it
- Keep entries concise
- Delete entries when the gap closes

## Opportunity Index

| # | Opportunity | Value gap it closes | Rank rationale | Owning delivery | Status |
|---|---|---|---|---|---|
| 1 | E2E Playwright hardening + CI gate | V7 reliability gap: no automated proof that `/shop`→`product`→`cart`→`checkout`→`OrderSuccess` stays green across deploys | Highest trust leverage: prevents silent regression of revenue path; blocks deploy on failure | M7 — Hardening | In progress — config wired (`playwright.config.js`, `site.spec.cjs` `BASE_URL` fix, `npx playwright test --list` 11 specs) |
| 2 | Re-enable Home editorial sections (FeaturedCollections, Spotlight, CampaignEditorial, BrandPhilosophy) | V1 editorial storytelling PARTIAL: Home is hero-only while collection imagery/story exists | Direct lift to discovery and time-on-site; data already available via collections/hero APIs | M2 + M7 | Delivered — re-enabled in `Home.jsx:31`, build now includes 12.63 kB Home chunk |
| 3 | Arewa admin tuning UI polish + analytics dashboard | V6 config visibility gap: `ArewaConfig` tuning requires raw DB/key edits; `ArewaEvent` not surfaced | Unlocks non-engineering iteration on greeting/personality/featured ids and proves guidance value | M6 | Scoped |
| 4 | Image CDN perf audit + responsive sizing | V1/V7 perf gap: oversized `CampaignImage`/`ProductImage` payloads hurt LCP on mobile | Revenue-adjacent: faster hero load → higher checkout entry; Cloudinary transforms underused | M7 | Idea |
| 5 | Webhook signature verification + retry/backoff | V3 payment trust gap: idempotency is delivered but provider signature not validated, no retry on failed webhook | Protects against spoofed/forged `POST /api/flutterwave/webhook` and transient failures | M3 + M7 | Scoped |
| 6 | Campaign segmentation + bulk notify analytics | V5 growth gap: `POST /notify-product/:productId` is single-blast; no segments or delivery analytics | Increases repeat-purchase rate; Brevo sync is DELIVERED but targeted campaigns are not | M5 | Idea |
| 7 | Bulk product import + drag-reorder in admin | V4 ops friction: product management is one-by-one without CSV import or drag `position` ordering | Scales admin velocity as catalog grows past 100 products | M4 | Idea |
| 8 | SEO expansion (structured data, sitemap automation) | V1 discovery gap: `generate-sitemap.cjs` exists but lacks dynamic product/collection URLs + JSON-LD per product | Organic acquisition lever; low effort relative to catalog size | M7 | Idea |
| 9 | PWA / installability + offline cart resilience | Shopper gap: cart lost on `x-session-id` expiry/clear without persistence fallback | Convenience; keeps in-flight cart through refresh/offline | M3 + M7 | Idea |
| 10 | Arewa checkout action (add-to-cart from chat) | V6 guidance→purchase gap: advice does not yet mutate cart | Closes loop from guidance to revenue in one session | M6 + M3 | Idea |

Re-rank periodically as live metrics (conversion, admin time, webhook success rate) shift stakeholder priorities. Delete rows when the owning milestone closes the gap.
