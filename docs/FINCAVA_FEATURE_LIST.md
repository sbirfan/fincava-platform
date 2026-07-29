# FINCAVA Platform — Feature List

**Product:** Green Coffee Buyer Relationship Platform  
**Repo:** `sbirfan/fincava-platform`  
**Last updated:** 2026-07-28  

This document inventories platform capabilities by phase. MVP scope is defined in `docs/FINCAVA_PLATFORM_CLAUDE_CODE_PROMPT.md`. Post-MVP items require separate approval and FRDs.

---

## Strategic assets (priority order)

1. Curated green coffee lot inventory (coffee passports)
2. Buyer profiles and alert preferences
3. RFQ, sample request, and sourcing request history
4. Market intelligence notes (internal research)
5. Lot alert preference data for manual outreach

---

## Phase 0 — Foundation ✅

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| F-001 | Monorepo scaffold (`/client`, `/server`, `/shared`, `/drizzle`) | Shipped | Vite + React, Express, Drizzle on Neon |
| F-002 | Full data model + migrations | Shipped | Lots, buyers, requests, market intel, auth |
| F-003 | Seed dataset (6 lots, all pricing strategies) | Shipped | Includes hidden `INVITE_ONLY` lot |
| F-004 | Environment config + `.env.example` | Shipped | No secrets in git |

---

## Phase 1 — Public site ✅

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| F-010 | Home, About, Contact | Shipped | B2B tone, Colombian export focus |
| F-011 | Available Lots catalog + filters | Shipped | Variety, process, status; excludes `visible=false` |
| F-012 | Lot passport (partial + locked CTA) | Shipped | Server-side field gating on API |
| F-013 | Shared pricing display module | Shipped | `pricePerKg` canonical; five strategies |
| F-014 | Privacy Policy + Terms of Service | Shipped | GDPR-aware; governing law placeholder |
| F-015 | Public verification request form | Shipped | Addendum; rate-limited unauthenticated write |

---

## Phase 2 — Buyer auth + profile (planned)

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| F-020 | Passwordless email OTP (register + login) | Planned | Resend; hashed codes; rate limits |
| F-021 | Buyer sessions (30-day rolling) | Planned | Postgres-backed; httpOnly cookies |
| F-022 | Profile completion + My Profile | Planned | Alert preferences folded into profile |
| F-023 | Full passport unlock (gated fields) | Planned | Enforced server-side, not UI-only |
| F-024 | Login placeholder → real OTP flow | Planned | Replace `/login` stub |

---

## Phase 3 — RFQ + samples + sourcing (planned)

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| F-030 | RFQ form + history | Planned | Auth-required; lot-linked |
| F-031 | Sample request form + history | Planned | Only when `sampleAvailable=true` |
| F-032 | Sourcing request form + history | Planned | Pull channel; optional budget |
| F-033 | Buyer confirmation emails | Planned | Non-blocking Resend sends |
| F-034 | Founder notifications (RFQ/sample/sourcing/register) | Planned | To `FOUNDER_EMAIL` |
| F-035 | "Can't find what you need?" CTAs | Planned | Catalog + passport |

---

## Phase 4 — Admin (planned)

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| F-040 | Admin login (env password, separate session) | Planned | 404 on unauthenticated admin API |
| F-041 | Dashboard (counts + lot status) | Planned | |
| F-042 | Lots CRUD + Cloudinary image upload | Planned | Deletion guard when referenced |
| F-043 | Buyers list/detail + GDPR hard delete | Planned | Cascade requests + sessions |
| F-044 | Unified request queue (RFQ / sample / sourcing) | Planned | Distinct status workflows |
| F-045 | Sourcing matched-lot linking | Planned | `matchedLotId` FK |
| F-046 | Market Intelligence CRUD | Planned | Manual Accio-assisted research |
| F-047 | Alert outreach filter + CSV export | Planned | No automated campaign sending |

---

## Phase 5 — Polish + deploy (planned)

| ID | Feature | Status | Notes |
|----|---------|--------|-------|
| F-050 | Empty states, errors, loading, SEO | Planned | OpenGraph per lot |
| F-051 | Founder operations README | Planned | End-to-end manual workflows |
| F-052 | Deploy verification + backup docs | Planned | Weekly `pg_dump` command |

---

## Post-MVP — Proposed enhancements

| ID | Feature | Status | FRD | Notes |
|----|---------|--------|-----|-------|
| **FIN-PVA-001** | **Price Validation Agent** | **Proposed** | [`PRICE_VALIDATION_AGENT_FRD.md`](./features/PRICE_VALIDATION_AGENT_FRD.md) | Admin-assist; public market benchmarks; variance alerts |
| FIN-PM-002 | Activity log (admin audit trail) | Idea | — | Deferred from MVP schema |
| FIN-PM-003 | Buyer watchlists | Idea | — | Explicitly rejected for MVP |
| FIN-PM-004 | Cacao commodity support | Idea | — | Enum reserved; UX stays coffee |
| FIN-PM-005 | Automated lot alert campaigns | Idea | — | Conflicts with manual-first ops unless re-scoped |

---

## Explicitly out of scope (all phases unless re-approved)

- Multi-supplier marketplace / supplier onboarding
- Compliance engine / verification automation beyond intake form
- Payments, checkout, cart
- CRM automation or autonomous buyer-facing agents
- Microservices, message queues, event buses
- Live Accio.com API integration (MVP uses manual market intel notes)
- Buyer-facing market rate display or auto-pricing

---

## Manual-first operations (by design)

| Operation | How it runs today / in MVP |
|-----------|----------------------------|
| RFQ quoting | Founder manual |
| Sample logistics | Founder manual |
| Sourcing fulfillment | Founder searches coop network |
| Alert outreach | Admin filter → CSV → external email |
| Market research | Admin enters notes (Accio-assisted, manual) |
| Buyer follow-up | Founder manual |

The Price Validation Agent (FIN-PVA-001) **extends** admin market research — it does not replace founder judgment or expose rates to buyers.

---

## Document map

| Document | Purpose |
|----------|---------|
| `FINCAVA_PLATFORM_CLAUDE_CODE_PROMPT.md` | MVP execution spec (source of truth) |
| `FINCAVA_PLATFORM_HANDOVER.md` | Decision rationale |
| `FINCAVA_FEATURE_LIST.md` | This file — capability inventory |
| `features/PRICE_VALIDATION_AGENT_FRD.md` | Post-MVP price validation requirements |
