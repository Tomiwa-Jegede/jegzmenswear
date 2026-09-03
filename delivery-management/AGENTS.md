# Delivery Management

## Purpose

Planning, roadmap, and milestone tracking for cross-team engineering delivery. The engineering half of product planning: how value is built, sequenced by dependency, and shipped. The value thesis lives in `product-management/`.

## Ownership

Owned by the repository root `AGENTS.md`. Value-to-deliver lives in `product-management/`; this folder owns how engineering delivers value, not what the value is.

## Local Contracts

- Use this folder for durable delivery artifacts, not scratch notes.
- `roadmap.md` is the top-level sequencing document.
- Milestone trackers use numbered filenames `milestone-1.md` onward.
- Milestone docs state scope, non-goals, ownership boundaries, execution order, and regression guardrails.
- When a milestone is split/deferred/reprioritized, reflect changes in both `roadmap.md` and the affected milestone files in the same change.
- Milestone docs name the value outcome they deliver by referencing `product-management/value-map.md`.
- Delivery status is not a claim of visible value.

## Work Guidance

- Keep planning docs concrete enough to drive execution.
- Prefer milestone-oriented breakdowns over brainstorming lists.
- Update roadmap and milestone docs when scope, sequencing, or ownership changes.
- Do not duplicate implementation detail owned by code-local AGENTS docs.
- Do not resolve "what value to build next" here — raise it to `product-management/`.

## Verification

- Check links, filenames, and milestone numbering.
- Ensure the root `AGENTS.md` child index references this folder and stays current.

## Child DOX Index

| Path | Owner | Purpose |
| --- | --- | --- |
| `roadmap.md` | delivery-management/ | Top-level sequencing document across milestones M1–M7 |
| `milestone-1.md` | delivery-management/ | M1 — Catalog foundation: collections, products, images, variants |
| `milestone-2.md` | delivery-management/ | M2 — Storefront browsing: shop, collections, product detail, SEO |
| `milestone-3.md` | delivery-management/ | M3 — Cart, checkout, and payments: cart session, Flutterwave, orders |
| `milestone-4.md` | delivery-management/ | M4 — Admin CMS: hero, campaigns, products, collections, site content, music |
| `milestone-5.md` | delivery-management/ | M5 — Growth: subscribers, discount codes, campaigns, Brevo |
| `milestone-6.md` | delivery-management/ | M6 — Arewa AI assistant: chat, config, personalization |
| `milestone-7.md` | delivery-management/ | M7 — Hardening: performance, analytics, cron jobs, regression guardrails |
