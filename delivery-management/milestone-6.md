# Milestone 6: Arewa AI Assistant

## Goal

Give shoppers a warm, knowledgeable conversational assistant that guides discovery and keeps the session personal without losing cart context.

## Scope

- Models: `ArewaConversation` (`sessionId` unique) + `ArewaMessage` (`role` user|assistant) + `ArewaConfig` (name/greeting/personality/priceRange/filtered ids) + `ArewaEvent` (analytics)
- Backend: `backend/src/routes/arewa.js` (session-guarded `POST /chat`) + `backend/src/controllers/arewaController.js` (message history, config-driven prompt, product search/filtering, event logging)
- Config: `ArewaConfig` fields `name`, `greeting`, `personality`, `recommendedOccasions` (Json), `priceRangeMin`/`priceRangeMax` (Decimal), `featuredProductIds`/`excludedProductIds` (Json)
- Frontend: `frontend/src/components/ArewaWidget.jsx` (floating chat UI, session persistence), admin config surface (in `AdminHome` or dedicated)
- Session: shares `x-session-id` transport with cart (`frontend/src/lib/session.js` + `axios.js`)

## Non-Goals

- No general checkout/cart mutation via chat beyond product discovery (no order placement inside Arewa in this milestone).
- No external LLM provider abstraction beyond the current controller implementation.
- No persistent user accounts; everything is session-scoped.

## Ownership Boundaries

- `backend/src/controllers/arewaController.js` + `backend/src/routes/arewa.js` + `Arewa*` Prisma models — backend owns chat logic and persistence
- `frontend/src/components/ArewaWidget.jsx` — frontend owns widget UX and message rendering
- `ArewaConfig` — business-owned tuning; changes via backend, not direct DB edits

## Execution Order

1. Create `ArewaConversation`/`ArewaMessage`/`ArewaConfig`/`ArewaEvent` schema; implement `POST /api/arewa/chat` with `requireSession` and per-session conversation threading.
2. Build `ArewaWidget` (open/close, history list, input, typing indicator) wired to `POST /api/arewa/chat`.
3. Implement `ArewaConfig` defaults (greeting, personality) and surface them in the chat prompt; add `featuredProductIds`/`excludedProductIds` and price-range filtering.
4. Add `ArewaEvent` logging for session, eventType, and metadata.
5. Add admin tuning surface for `ArewaConfig` and regression-guard greeting/personality history.

## Value Outcome

Delivers `product-management/value-map.md` outcome V6 — Shopper: get trusted style guidance instantly. Visible moment is opening `ArewaWidget`, sending "What should I wear to a wedding in Lagos?", and receiving a personalized, on-brand response with relevant product links; proof is `ArewaMessage` history persisted under the same `sessionId` as the cart and `ArewaEvent` rows logged.

## Status

Complete

- Current status summary: `POST /api/arewa/chat` session-scoped with history + config; `ArewaWidget` live; greeting/personality/feature filters driven by `ArewaConfig`.
- Remaining work: expand admin UI for `ArewaConfig` tuning UI polish and add analytics dashboard over `ArewaEvent` (opportunity).

## Verification / Definition of Done

- `GET /api/health` still ok with Arewa routes mounted.
- Two successive `POST /api/arewa/chat` calls with same `x-session-id` return `ArewaMessage` history length incrementing under the same `ArewaConversation`.
- `ArewaConfig` update (e.g., change greeting) reflects in next chat response's system instruction.
- `excludedProductIds` products are never suggested; `featuredProductIds` are prioritized.
- `ArewaEvent` rows are created per chat turn with `eventType` and session linkage.

## Regression Guardrails

- Must keep `requireSession` on `POST /api/arewa/chat`; no unauthenticated global chat.
- `ArewaConversation.sessionId` unique constraint must not be weakened.
- Session id transport must stay `x-session-id` consistent with cart; diverging headers breaks persistence.
