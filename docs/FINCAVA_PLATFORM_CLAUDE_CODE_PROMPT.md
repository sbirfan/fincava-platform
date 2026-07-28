# FINCAVA PLATFORM — CLAUDE CODE EXECUTION PROMPT (FINAL)

You are Claude Code acting as senior full-stack engineer and technical lead for a brand-new build.

Repository: https://github.com/sbirfan/fincava-platform (empty — you are setting it up from scratch)

This is a clean strategic break from a previous platform. Do NOT reference, import, or recreate any prior FINCAVA architecture (marketplace, supplier onboarding, compliance engine, buyer matching, verification, graduation state machines). If you find yourself building any of those, stop — it is out of scope.

---

## 1. BUSINESS CONTEXT

FINCAVA is a Colombian green coffee export business. This platform is a **Green Coffee Buyer Relationship Platform** for professional buyers: specialty importers, roasters, brokers, distributors, and competition buyers.

The platform's strategic assets, in priority order:
1. Curated green coffee lot inventory (coffee passports)
2. Buyer profiles and preferences
3. RFQ, sample request, and sourcing request history
4. Market intelligence notes (internal, Accio.com-assisted research entered manually)
5. Lot alert preference data for manual outreach

**Core buyer journeys:**

*Push (FINCAVA has inventory):*
Buyer visits FINCAVA → understands it as a green coffee export partner → browses available lots (public) → views partial lot passport (public) → registers a free buyer account (email OTP) → unlocks full passport, pricing, RFQ, and sample requests → sets alert preferences → FINCAVA follows up manually → relationship develops.

*Pull (buyer needs something specific):*
Buyer doesn't see what they need → submits a Sourcing Request describing desired specs → FINCAVA searches its coop/farmer network → responds with matching options or lets the buyer know → may create a new lot if sourced → relationship develops.

**The platform is NOT:** roasted-coffee ecommerce, a consumer brand site, a multi-supplier marketplace, a supplier onboarding platform, a compliance/verification engine, a logistics automation tool, or multi-tenant SaaS. There is no cart, no checkout, no payments.

**Future:** Cacao may be added later. Use a `commodityType` field internally (`GREEN_COFFEE` now; `CACAO` reserved, inactive). Keep all public UX and content coffee-specific. Do not generalize beyond this one field.

**Manual-first operations:** The app organizes the work; it does not automate the business. Buyer follow-up, alert outreach, sample logistics, and quoting are all manual founder tasks. Do not build CRM automation, campaign sending, or autonomous agents.

---

## 2. NON-NEGOTIABLE RULES

1. No prior-platform architecture reuse of any kind.
2. No microservices, no event-driven architecture, no message queues.
3. No autonomous AI agents, no live Accio integration (manual admin notes only).
4. No payment/checkout of any kind.
5. Simple in *flow*, but production-grade in **security, data integrity, and scalability**. "Simple" never justifies a security shortcut.
6. Codebase must remain understandable and operable by a non-technical founder (clear README, documented manual processes).
7. GitHub is the source of truth. Replit is used only for testing, preview, and hosting — do not design around Replit-specific features (no Replit Auth, no Replit DB, no Replit filesystem storage).
8. Never commit secrets. All secrets via environment variables. Provide `.env.example`.

---

## 3. STACK (FIXED — do not substitute)

- **Frontend:** Vite + React + TypeScript + Tailwind CSS, react-router
- **Backend:** Node.js + Express + TypeScript (single server, serves API + built frontend in production)
- **Database:** Neon PostgreSQL (free tier) via **Drizzle ORM** + drizzle-kit migrations
- **Validation:** zod schemas shared between client and server (`/shared`)
- **Email:** Resend (transactional only)
- **Images:** Cloudinary (free tier) — admin uploads go directly to Cloudinary; only the secure URL + public ID are stored in Postgres. Nothing is ever written to the local filesystem or committed to git.
- **Auth/session:** Server-side sessions in Postgres, httpOnly + secure + sameSite=lax cookies. No JWT in localStorage.
- **Rate limiting:** express-rate-limit (per-IP and per-email where noted)

Project layout (single repo, npm workspaces or simple folders):

```
/client        — Vite React app
/server        — Express API, auth, email, cloudinary
/shared        — zod schemas + TS types used by both
/drizzle       — migrations
```

---

## 4. AUTHENTICATION DESIGN

### Buyer auth — passwordless email OTP (self-owned, no third-party identity provider)

- Buyer enters email → server generates a 6-digit numeric code → emails it via Resend → buyer enters code → session created.
- Registration and login are the same flow. First successful OTP for a new email creates the BuyerProfile shell and routes them to complete their profile.
- OTP rules (enforce server-side):
  - Code stored **hashed** (sha256 with server secret is acceptable for 6-digit short-lived codes), never plaintext.
  - 10-minute expiry. One active code per email (new request invalidates prior).
  - Max 5 verification attempts per code, then invalidated.
  - Rate limits: max 3 OTP requests per email per 15 min; max 10 per IP per 15 min.
  - Generic responses — do not reveal whether an email is registered.
- Sessions: buyer sessions use 30-day rolling expiry; stored in DB; logout endpoint destroys session.
- Cleanup: expired otpCodes and sessions rows are purged lazily (opportunistically on OTP request and session validation) — no cron jobs or schedulers.

### Admin auth — separate from buyer auth entirely

- Single admin login page at `/admin/login`. Password checked server-side against `ADMIN_PASSWORD` env var using constant-time comparison.
- Successful login creates an **admin session** (separate session type/flag) with 24-hour expiry, no rolling extension. Buyer sessions can never access admin routes; enforce with distinct middleware.
- Rate limit: 5 attempts per IP per 15 min.
- All `/admin/*` pages and `/api/admin/*` routes require admin session middleware. Return 404 (not 401) on unauthenticated admin API access to avoid advertising the surface.

### API-level access enforcement (critical)

Field gating must happen **on the server**, not in the UI:
- Anonymous requests to lot endpoints receive only the public field subset (defined in §6).
- Authenticated buyer requests receive the full passport.
- The public lot list endpoint must never return lots where `visible = false`.
- Internal-only fields (`priceNotesInternal`, `inventoryType`, `internalNotes` on any model) are returned **only** on admin endpoints — never in any buyer-facing response, authenticated or not.

---

## 5. DATA MODEL (Drizzle schema)

Use enums where listed. All tables get `id` (uuid), `createdAt`, `updatedAt`.

### enums
- `commodity_type`: GREEN_COFFEE, CACAO (CACAO unused for now)
- `inventory_type`: FINCAVA_OWNED, FINCAVA_CONTROLLED, EXCLUSIVE_PARTNER, BROKERED, FUTURE_HARVEST
- `lot_status`: COMING_SOON, SAMPLE_AVAILABLE, AVAILABLE, LIMITED_QUANTITY, RESERVED, SOLD
- `pricing_strategy`: PUBLIC, STARTING_FROM, MARKET_RANGE, RFQ_ONLY, INVITE_ONLY
- `buyer_type`: IMPORTER, SPECIALTY_ROASTER, BROKER, DISTRIBUTOR, COMPETITION_BUYER, OTHER
- `request_status`: NEW, REVIEWING, REPLIED, SAMPLE_SENT, QUOTED, CLOSED (used by RFQs and sample requests)
- `sourcing_status`: NEW, REVIEWING, SOURCING, MATCHED, QUOTED, CLOSED (used by sourcing requests — SOURCING = actively searching coop network, MATCHED = found candidate lots)
- `intended_use`: HOUSE_BLEND, SINGLE_ORIGIN, ESPRESSO_BLEND, COMPETITION, PRIVATE_LABEL, RESALE_DISTRIBUTION, OTHER
- `volume_flexibility`: EXACT, APPROXIMATE, FLEXIBLE
- `delivery_window`: ASAP, WITHIN_1_MONTH, WITHIN_3_MONTHS, NEXT_HARVEST, FLEXIBLE
- `contact_method`: EMAIL, WHATSAPP, PHONE

### greenCoffeeLots
lotCode (unique), title, commodityType (default GREEN_COFFEE), inventoryType, status, `visible` boolean (default true; INVITE_ONLY lots default to false on creation — admin can flip to true later, in which case the lot shows "Contact FINCAVA" with no price), variety, process, region, farm, producer, altitude, harvestDate, harvestWindow, availableKg, cupScore (numeric, nullable), moisture, waterActivity, screenSize, tastingNotes, certifications (text[]), exportReadiness, sampleAvailable boolean, images (jsonb array of {url, publicId, alt}), pricingStrategy (default RFQ_ONLY), currency (default USD), **pricePerKg** (single canonical price — per-lb is derived for display at 1 kg = 2.20462 lb, computed, never stored), priceRangeLowPerKg, priceRangeHighPerKg, incoterm, priceNotesPublic, priceNotesInternal.

**Pricing display logic (single source of truth, implemented once in /shared and used by both UI and any server rendering):**

| pricingStrategy | Buyer sees |
|---|---|
| PUBLIC | Exact FOB price (per kg + derived per lb) + incoterm |
| STARTING_FROM | "Starting at {pricePerKg}/kg" |
| MARKET_RANGE | "Estimated {low}–{high}/kg" |
| RFQ_ONLY | "Request Quote" (no numbers) — **default** |
| INVITE_ONLY | "Contact FINCAVA" (no numbers); lot hidden from catalog unless admin sets visible=true |

Pricing is shown **only to authenticated buyers** (it is part of the gated passport section). Anonymous users see "Register to view pricing & full specs".

### buyerProfiles
email (unique, citext or lowercased), emailVerifiedAt, name, company, phone, country, buyerType, website, preferredContactMethod, preferredVarieties (text[]), preferredProcesses (text[]), preferredScoreMin, preferredScoreMax, preferredVolumeMinKg, preferredVolumeMaxKg, targetOrigins (text[]), certificationsNeeded (text[]), destinationCountries (text[]), **alertOptIn** boolean, alertCompetitionLots boolean, marketingOptIn boolean, consentTimestamp, internalNotes (admin-only), lastLoginAt.

(Alert preferences live here — there is **no** separate FutureLotAlert model.)

### rfqs
buyerProfileId (FK, required — RFQs require login), lotId (FK), requestedVolumeKg, destinationCountry, preferredIncoterm, requiredCertifications (text[]), targetDeliveryTimeline, message, status (default NEW), internalNotes.

### sampleRequests
buyerProfileId (FK, required), lotId (FK), sampleDestination, courierAccount, evaluationTimeline, message, status (default NEW), internalNotes.

### sourcingRequests
buyerProfileId (FK, required — auth gated), intendedUse (enum), varietyPreferences (text[]), processPreferences (text[]), minCupScore (numeric, nullable), requestedVolumeKg (numeric, required), volumeFlexibility (enum), targetDeliveryWindow (enum), destinationCountry (required), altitudePreference (text, nullable), regionPreferences (text[]), certificationsNeeded (text[]), maxBudgetPerKg (numeric, nullable — optional; visible to the submitting buyer (their own request history) and admin; never shown to producers, other buyers, or any external party), budgetCurrency (default USD), additionalNotes (text — free-form: flavor goals, packaging needs, exclusivity, past lots loved, constraints), status (sourcing_status enum, default NEW), matchedLotId (FK to greenCoffeeLots, nullable — admin links when a sourced lot is found/created), internalNotes (admin-only).

**Sourcing request form UX guidance:**
- Structured fields for what buyers always know; free-form for everything else.
- Every structured select includes an "open to suggestions" or "no preference" option — do not force artificial precision.
- Budget field: optional, labeled "Helps us narrow the search — kept confidential, never shared with producers."
- Do NOT include screen size, moisture, water activity (QC specs evaluated after sourcing, not sourcing criteria).
- Do NOT include incoterm (negotiation detail for after coffee is found — RFQ handles that).
- Do NOT allow file uploads (paste relevant spec details into additionalNotes instead).
- Form intro copy: "Tell us what you're looking for. We'll search our network of Colombian cooperatives and farms and respond within 10 business days with available options — or let you know if we can't match your requirements right now."
- Confirmation email reinforces: this is not a guarantee; we'll be in touch with what we find.
- Buyers cannot edit or cancel a submitted request (RFQ, sample, or sourcing) in MVP — deliberate, manual-first: they contact FINCAVA by email. Do not build edit/cancel flows.

### marketIntelligenceNotes (admin-only, Accio-assisted manual research)
lotId (FK, nullable), variety, process, targetMarkets, demandTrend, estimatedRateLowPerKg, estimatedRateHighPerKg, currency, comparableOfferings, suggestedBuyerCategories, pricingRecommendation, researchSource, researchDate, internalNotes.

### auth tables
otpCodes (email, codeHash, expiresAt, attempts, consumedAt), sessions (token/id, buyerProfileId nullable, isAdmin boolean, expiresAt).

---

## 6. PUBLIC vs GATED FIELD MATRIX (enforce server-side)

**Public (anonymous) — catalog cards + partial passport:**
lotCode, title, variety, process, region, altitude, status, cupScore, tastingNotes, harvestWindow, images, sampleAvailable (boolean only).

**Gated (authenticated buyer) — adds:**
farm, producer, harvestDate, availableKg, moisture, waterActivity, screenSize, certifications, exportReadiness, incoterm, priceNotesPublic, and pricing per strategy table.

**Admin only — adds:**
inventoryType, priceNotesInternal, visible flag, all internalNotes everywhere.

The partial passport page shows the locked section explicitly: "Technical specs, pricing & sample availability — create a free buyer account" with the register CTA. This is the primary conversion mechanism.

---

## 7. PAGES

### Public
1. **Home** — FINCAVA as Colombian green coffee export partner. Core message: "FINCAVA helps professional buyers access traceable, ready-to-roast Colombian green coffee lots." Featured available lots. Professional B2B tone throughout the site: no consumer-cafe styling, no ecommerce patterns, no startup hype.
2. **Available Lots** — card grid: lotCode, title, variety, process, region, altitude, cupScore, status badge, "View Lot" CTA. Only `visible=true` lots. Simple filters: variety, process, status.
3. **Lot Detail / Coffee Passport** — public fields + locked gated section (register CTA). For authenticated buyers: full passport, pricing per strategy, CTAs: Request Quote, Request Sample (only if sampleAvailable), Update Alert Preferences. Also: a persistent "Can't find what you need?" link to the Sourcing Request form (visible on passport and catalog pages for authenticated buyers).
4. **About** — export focus, Colombian origin, traceability, buyer-first sourcing, explicitly not consumer/roasted retail.
5. **Contact** — email, WhatsApp placeholder, location, inquiry CTA.
6. **Privacy Policy** — plain-language: what is collected (profile, preferences, request history), why (responding to requests, lot alerts if opted in), consent basis, no sale of data, contact for data deletion, cookie/session note. GDPR-aware wording (EU buyers are a target market).
7. **Terms of Service** — key protective clauses: platform is informational; lot listings are invitations to treat, not binding offers; RFQ/sample submissions do not form contracts — all sales concluded via separately negotiated contracts; pricing shown is indicative unless confirmed in a written quote; availability subject to change; limitation of liability; governing law placeholder for founder to confirm with counsel.
8. **Login / Register** — single email-OTP flow (enter email → enter code → if new, complete profile).

### Buyer (authenticated)
9. **My Profile** — edit all profile fields, alert preferences (varieties, processes, score range, volume range, certifications, regions, competition-lot interest), opt-in toggles with consent timestamps, view own RFQ/sample/sourcing request history with statuses.
10. **Sourcing Request** — form per §5 sourcingRequests UX guidance. Accessible from: dedicated nav item for authenticated buyers, "Can't find what you need?" CTA on catalog and passport pages. Prefills buyer name/company/email/country from profile.

### Admin (`/admin`, env-password)
11. **Dashboard** — counts: new RFQs, new sample requests, new sourcing requests, new registrations (7 days), lots by status.
12. **Lots** — full CRUD with a **deletion guard**: a lot referenced by any RFQ, sample request, or sourcing matchedLotId cannot be deleted (show "This lot has N linked requests — set status to SOLD instead"); true deletion allowed only for unreferenced lots. The lot lifecycle ends at SOLD, not delete. Create/edit form covers every passport field, pricing strategy, visible toggle, status, and **image upload direct to Cloudinary** (multi-image, preview, delete). Lot list with status/strategy columns.
13. **Buyers** — list + detail: profile, preferences, opt-in status, request history (all three types), internalNotes editing. Includes **"Delete buyer"** action (for GDPR deletion requests; confirmation step required, irreversible): hard-deletes the buyer profile and cascade-deletes all their RFQs, sample requests, sourcing requests, and sessions.
14. **Requests** — unified queue with tabs/filters for RFQs, sample requests, and sourcing requests. Each type has its own status workflow: RFQs/samples use request_status (NEW → REVIEWING → REPLIED → SAMPLE_SENT/QUOTED → CLOSED); sourcing requests use sourcing_status (NEW → REVIEWING → SOURCING → MATCHED → QUOTED → CLOSED). All types support internalNotes. Sourcing requests additionally support **linking a matched lot** (matchedLotId) — admin can select from existing lots or note that a new lot was created to fulfill the request.
15. **Market Intelligence** — CRUD for research notes, filter by variety/lot.
16. **Alert Outreach** — filter buyers by alertOptIn + preference criteria (variety, process, score range, certification, region), view matching list, copy/export emails as CSV for manual outreach. No automated sending.

---

## 8. EMAIL (Resend)

All templates: clean, professional, plain layout, FINCAVA sender identity from `EMAIL_FROM` env var (founder has already verified the sending domain in Resend).

1. **OTP code** — 6-digit code, 10-minute validity note, ignore-if-not-you line.
2. **RFQ confirmation (to buyer)** — "We received your quote request for lot {lotCode}. We respond within 2 business days."
3. **Sample request confirmation (to buyer)** — same pattern (2 business days).
4. **Sourcing request confirmation (to buyer)** — "We received your sourcing request. We'll search our network and respond within 10 business days with available options — or let you know if we can't match your requirements right now." Explicitly: this is not a guarantee.
5. **Founder notification (to `FOUNDER_EMAIL`)** — fired on: new RFQ, new sample request, new sourcing request, new buyer registration. Include summary + link to the admin record.

No campaign/bulk sending. No automated lot alerts (manual via Alert Outreach module).

Email sends must be non-blocking for the user (fire after DB commit; a Resend failure logs an error but never fails the user's request).

---

## 9. SECURITY REQUIREMENTS (all phases)

- zod validation on **every** API input; reject unknown fields.
- Parameterized queries only (Drizzle default) — no raw string SQL.
- Rate limits: OTP endpoints (§4), form submissions (10/hour/IP), admin login (5/15min/IP), global sane default.
- Honeypot field on registration/OTP-request forms.
- httpOnly/secure/sameSite cookies; session secret from env; regenerate session on login.
- Helmet middleware; CORS locked to same origin.
- No stack traces or internal errors leaked to clients; structured server logging.
- Cloudinary upload: server-signed upload or server-proxied upload with file-type (jpeg/png/webp) and size (≤5MB) validation; admin-only.
- Constant-time comparisons for admin password and OTP hash checks.

---

## 10. PHASED EXECUTION PLAN

Work phase by phase. **Do not start a phase until the previous phase's exit tests pass.** Small, safe commits with clear messages; push after each phase.

### Phase 0 — Foundation
Tasks: repo scaffold (client/server/shared/drizzle), tooling (TS strict, eslint, prettier), Express skeleton + helmet + logging + error handler, Drizzle schema (all tables/enums from §5), initial migration against Neon, `.env.example` (DATABASE_URL, SESSION_SECRET, ADMIN_PASSWORD, RESEND_API_KEY, EMAIL_FROM, FOUNDER_EMAIL, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, OTP_HASH_SECRET), seed script with 6 realistic Colombian lots covering **all five pricing strategies** and at least one visible=false INVITE_ONLY lot, README stub, Replit-compatible run scripts (`npm run dev`, `npm run build`, `npm start`).
Exit tests: fresh clone installs and boots; migration applies cleanly to empty Neon DB; seed loads; health endpoint responds; no secrets in git.

### Phase 1 — Public site
Tasks: layout/nav/footer, Home, About, Contact, Privacy, ToS, Available Lots (filters), partial passport page with locked-section CTA, shared pricing-display module, responsive pass.
Exit tests: catalog excludes visible=false lots; anonymous lot API response contains **no gated fields** (assert on raw JSON, not UI); all five pricing strategies render correctly for an authenticated stub; locked section renders for anonymous; mobile layouts usable; all static/legal pages render.

### Phase 2 — Buyer auth + profile
Tasks: OTP request/verify endpoints with all §4 rules, Resend OTP email, session middleware, register-completion flow (new emails), login flow (existing), My Profile page (all fields + alert preferences + consent timestamps), full-passport unlock, logout.
Exit tests: new-email flow creates profile and session; existing-email flow logs in; expired/reused/6th-attempt codes rejected; OTP rate limits enforced (verify with scripted repeat calls); gated fields present in authenticated lot response and absent in anonymous; profile edits persist; consentTimestamp set on opt-in changes; session cookie flags correct; buyer session extends on activity (rolling) and expires after 30 days idle; admin session expires at 24 hours with no rolling extension.

### Phase 3 — RFQ + sample + sourcing requests
Tasks: RFQ form + endpoint (auth-required, lot-linked, prefilled from profile), sample request form + endpoint (only when sampleAvailable), sourcing request form + endpoint (auth-required, standalone — not lot-linked, per §5 UX guidance, prefilled from profile), "Can't find what you need?" CTAs on catalog and passport pages, buyer confirmation emails (all three types), founder notification emails (all three types), buyer request history on My Profile (all three types with statuses), rate limiting + honeypots.
Exit tests: anonymous submission rejected at API level for all three form types; submissions persist with correct FKs; all three confirmation emails fire per submission type (verify via Resend dashboard/logs); sourcing request confirmation includes "not a guarantee" language; Resend outage does not fail the user request; history shows correct statuses per type; rate limit triggers; sourcing request form "no preference" options work for every structured field; budget field is optional and submits correctly when empty.

### Phase 4 — Admin
Tasks: admin login (env password, separate session), all admin modules from §7 including Cloudinary image upload in lot form, unified request queue with tabs for RFQ/sample/sourcing, distinct status workflows per type, sourcing request matched-lot linking, buyer internalNotes, market intelligence CRUD, alert-outreach filter + CSV export.
Exit tests: buyer session cannot reach any /api/admin route (404); wrong password rate-limited; lot created via admin (with uploaded image) appears correctly on public site; INVITE_ONLY visible toggle behaves per spec; RFQ/sample status transitions persist (request_status); sourcing status transitions persist (sourcing_status); admin can link a matchedLotId to a sourcing request; CSV export matches filter; image >5MB or wrong type rejected; deleting a buyer removes their profile and all their requests and sessions (assert on raw DB rows) and their session cookie no longer works; a lot referenced by any request cannot be deleted, an unreferenced lot can; no "[X]" or placeholder text remains in any buyer-facing copy or email template.

### Phase 5 — Polish + deploy
Tasks: empty states, 404/error pages, loading states, SEO meta + OpenGraph per lot, favicon, final README (per §11), Replit deployment verification, `pg_dump` backup command documented, final security pass against §9 checklist.
Exit tests: full manual walkthrough of the §1 buyer journey on the deployed Replit URL; founder can complete every admin task without touching code; README accurate from a cold start; backup command produces a restorable dump.

---

## 11. README REQUIREMENTS

Project purpose + clean-break statement; stack; setup from zero (Neon, Resend, Cloudinary, env vars); dev/build/run commands; Replit deploy steps; **founder operations guide**: add/edit a lot (incl. images), handle an RFQ end-to-end, handle a sample request, handle a sourcing request end-to-end (review → search coop network → match to lot or create new lot → link matchedLotId → respond to buyer), record Accio market research, run an alert outreach export, handle a GDPR data-deletion request (admin Delete buyer action, what it removes, irreversibility warning), weekly `pg_dump` backup (exact command); what remains manual by design; future cacao note: "Built for green coffee; cacao may be added later as a parallel commodityType — intentionally out of MVP scope."

---

## 12. FINAL DELIVERABLE SUMMARY

On completion report: app structure; commands; deployed/preview URL steps; admin access instructions; env var checklist with which founder accounts they come from; what remains manual; per-phase test results; recommended next small improvements; any risks or incomplete items.

Do not overengineer. The correct result is a simple-to-operate, secure, credible green coffee buyer relationship platform that one founder can run.
