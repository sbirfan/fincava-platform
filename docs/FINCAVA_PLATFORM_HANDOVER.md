# FINCAVA PLATFORM — PROJECT HANDOVER

This document captures every architectural decision, design resolution, and operational agreement made during the planning phase. The full execution prompt (`FINCAVA_PLATFORM_CLAUDE_CODE_PROMPT.md`) is already in this project's knowledge files — that is the source of truth for what to build. This handover covers the *why* behind every decision and flags what to watch for.

---

## CONTEXT

FINCAVA previously existed as a complex marketplace/compliance platform (repos: `sbirfan/FinCava` and `sbirfan/FinCava-Hub`). That platform failed due to: too many complex features, too expensive to run, hard to maintain, impossible for a non-technical founder to operate. It is being archived — not migrated, not refactored, not referenced.

The new platform (`sbirfan/fincava-platform`) is a **Green Coffee Buyer Relationship Platform** — a completely different product. No code, schema, architecture, or workflow from the old platform should influence this build.

---

## DECISIONS MADE (with reasoning)

### Repo strategy
- **Decision:** Brand new repo (`sbirfan/fincava-platform`), not a branch reset on the old repo.
- **Why:** The original prompt proposed archiving to a branch and resetting main in the same repo. That keeps legacy git history, invites accidental reuse, and a force-push to main is the riskiest git operation available. Old repos will be archived read-only on GitHub separately by the founder.

### Database
- **Decision:** Neon PostgreSQL (free tier) + Drizzle ORM. Not SQLite.
- **Why:** The original prompt proposed SQLite or "lightweight persistence." Replit's filesystem is ephemeral — SQLite files vanish on redeploy. Buyer profiles and RFQ history are the platform's strategic asset; storing them in a place that can silently disappear is unacceptable. Neon free tier is zero-cost and persistent.

### Authentication
- **Decision:** Passwordless email OTP (self-owned via Resend). Not Replit Auth. Not passwords.
- **Why:** Replit Auth was considered and rejected — it couples your buyer identity layer to Replit hosting, which contradicts the explicit goal of minimal Replit dependency. If hosting costs climb or you outgrow Replit, every buyer account is stranded. Self-owned OTP also eliminates password hashing, reset flows, and "forgot password" support. One mechanism handles both registration and login. B2B buyers on company email are comfortable with OTP.
- **Admin auth** is completely separate: single env-var password, distinct session type, distinct middleware.

### Image storage
- **Decision:** Cloudinary (free tier) from day one, with admin form upload. Not git-committed images. Not local filesystem uploads.
- **Why:** The original prompt proposed repo-committed images. The founder asked for form upload with "move to cloud later." But "upload to local filesystem now" has the same Replit-ephemeral problem as SQLite — images vanish on redeploy. Starting with Cloudinary avoids both data loss and a future migration. Admin uploads via form, URL + publicId stored in Postgres, nothing touches the filesystem.

### Buyer access model (tiered passport)
- **Decision:** Public teaser + registered full detail. Not a full registration wall. Not fully open.
- **Why:** The founder initially wanted full registration before seeing any lot detail. A hard wall before any detail creates massive bounce risk with zero brand trust. The compromise: public visitors see enough to create desire (variety, process, region, altitude, cup score, tasting notes, images), but technical specs, pricing, certifications, export readiness, RFQ, and sample requests require a free account. The locked section on the passport page is the primary conversion mechanism — it shows *what* they're missing.
- **Field gating is enforced server-side**, not just hidden in the UI. Anonymous API responses exclude gated fields. This was made an explicit exit test.

### Pricing
- **Decision:** Single canonical field `pricePerKg`. Per-lb is derived for display (÷ 2.20462), never stored. Five pricing strategies as an enum, default `RFQ_ONLY`.
- **Why:** Dual price fields (perKg + perLb) drift out of sync. One source of truth, one derivation.
- **Invite Only behavior:** Lot defaults to `visible=false` on creation. Admin can flip to visible if no takers — lot then appears in catalog showing "Contact FINCAVA" with no price. This was the founder's explicit request: "initially hidden with option to display if no takers."

### Pricing strategy display:
| Strategy | Buyer sees |
|---|---|
| PUBLIC | Exact FOB price (per kg + derived per lb) + incoterm |
| STARTING_FROM | "Starting at {price}/kg" |
| MARKET_RANGE | "Estimated {low}–{high}/kg" |
| RFQ_ONLY | "Request Quote" (default) |
| INVITE_ONLY | "Contact FINCAVA" (lot hidden unless admin sets visible=true) |

Pricing is visible **only to authenticated buyers** (gated section).

### Lot statuses
- **Decision:** COMING_SOON, SAMPLE_AVAILABLE, AVAILABLE, LIMITED_QUANTITY, RESERVED, SOLD. Six total.
- **Why:** Original prompt had both "Limited Quantity" and "Nearly Reserved" which would be applied inconsistently. Collapsed to "Limited Quantity" only per founder agreement.

### Sourcing requests (the "pull" channel)
- **Decision:** Buyers can submit a Sourcing Request describing specs they need; FINCAVA searches its coop/farmer network and responds.
- **Why:** The platform originally only supported "push" (FINCAVA lists, buyers browse). This adds "pull" — the buyer describes what they need, FINCAVA sources it. This is the missing half of the business model and a real differentiator against static catalogs.
- **Design choices:**
  - Structured fields for what buyers always know (intended use, variety, process, volume, timeline, destination); free-form `additionalNotes` for everything else.
  - Every structured select includes "open to suggestions" / "no preference" — never force artificial precision that wastes sourcing time.
  - Budget field (`maxBudgetPerKg`) is **optional** — buyers hate giving a number first; if they volunteer it, it saves sourcing time. Labeled as confidential, never shared with producers.
  - Screen size, moisture, water activity **excluded** — these are QC specs evaluated after sourcing, not sourcing criteria. Including them turns the form into a grading sheet.
  - Incoterm **excluded** — negotiation detail for after coffee is found; RFQ handles that.
  - No file uploads — spec details go in `additionalNotes`. Avoids storage/validation/scanning complexity.
  - **Expectation management is critical:** form intro and confirmation email both state this is not a guarantee. "We'll search our network and respond within [X] business days with available options — or let you know if we can't match your requirements right now."
- **Separate status workflow:** NEW → REVIEWING → SOURCING → MATCHED → QUOTED → CLOSED. SOURCING = actively searching coop network. MATCHED = found candidate lots. Admin can link `matchedLotId` to close the loop.
- **Not a separate phase:** slots into Phase 3 (alongside RFQ/sample) for buyer forms and Phase 4 for admin queue.

### Alert preferences
- **Decision:** Folded into `buyer_profiles` table. No separate `FutureLotAlert` model.
- **Why:** Registration gating means no anonymous alert subscriptions. Alert preferences (varieties, processes, score range, volume, certifications, regions, competition-lot interest) are profile fields. One model deleted, one duplicate-data problem avoided, alert outreach queries are single-table filters.

### Email (Resend)
- **Transactional only in MVP:** OTP codes, RFQ/sample/sourcing confirmations to buyer, founder notifications on new RFQ/sample/sourcing request/registration.
- **No automated campaign sending.** Alert outreach is manual (admin filters matching buyers, exports CSV, sends manually).
- **Email sends are non-blocking:** fire after DB commit, log errors, never fail the user's request.
- **Founder already has Resend account and verified sending domain.**

### Notifications
- **Buyer receives:** OTP code, RFQ submission confirmation, sample request confirmation, sourcing request confirmation (with "not a guarantee" language).
- **Founder receives:** notification on every new RFQ, new sample request, new sourcing request, and new buyer registration (with summary + admin link).
- **Why founder notifications matter:** manual-first operations mean the founder must know immediately when a lead comes in. A hot RFQ seen three days late is a dead lead.

### Schema
- **Nine tables total:** otp_codes, sessions, green_coffee_lots, buyer_profiles, rfqs, sample_requests, sourcing_requests, market_intelligence_notes, plus enums.
- **Rejected tables from founder's proposed structure:**
  - `commodity_types` table → enum instead (two values don't need a lookup table)
  - `lot_images` table → JSONB array on lot (no independent image queries needed)
  - `buyer_preferences` table → folded into buyer_profiles (1:1 = unnecessary decomposition)
  - `buyer_watchlists` → unscoped feature, scope creep
  - `communications` → vague, risks becoming CRM automation (explicitly banned)
  - `variety_trends` → covered by market_intelligence_notes with different researchDate values
  - `admins` table → one founder, env-var password, no roles needed
  - `activity_log` → good idea, wrong phase; post-MVP enhancement
- **Domain grouping as comments in schema file** is fine for readability — but no Postgres schema namespaces (adds connection complexity for zero benefit at this scale).

### Pages
- **Public (no auth):** Home, About, Contact, Privacy Policy, Terms of Service, Available Lots (catalog), Lot Detail (partial passport with locked-section CTA), Login/Register (single OTP flow).
- **Buyer (authenticated):** Full passport, RFQ form, Sample Request form, Sourcing Request form ("Can't find what you need?" CTA on catalog and passport pages), My Profile (all fields + alert preferences + all three request type histories).
- **Admin (env-password, separate session):** Dashboard, Lots CRUD (with Cloudinary image upload), Buyers list/detail, Requests queue (RFQ + sample + sourcing, each with own status workflow, sourcing supports matched-lot linking), Market Intelligence CRUD, Alert Outreach (filter + CSV export).

### Legal pages
- **Privacy Policy:** plain-language, GDPR-aware (EU buyers are a target market), covers what's collected, why, consent basis, no data sale, deletion contact, cookie/session note.
- **Terms of Service:** listings are invitations to treat (not offers), RFQs don't form contracts, pricing is indicative, availability subject to change, limitation of liability, **governing law placeholder** (founder must confirm with counsel — Claude Code will not pick a jurisdiction).

### Security (non-negotiable, all phases)
- zod validation on every API input
- Parameterized queries only (Drizzle default)
- Rate limiting: OTP (3/email/15min, 10/IP/15min), forms (10/hour/IP), admin login (5/15min/IP)
- Honeypot fields on registration/OTP forms
- httpOnly/secure/sameSite=lax cookies
- Helmet middleware, CORS locked to same origin
- No stack traces leaked to clients
- Cloudinary uploads: server-validated (type + 5MB limit), admin-only
- Constant-time comparisons for admin password and OTP checks
- Admin API returns 404 (not 401) to unauthenticated requests — don't advertise the surface

### Cacao
- `commodityType` enum includes CACAO but it is inactive/unused.
- All public UX is coffee-specific.
- No generalization beyond the enum field.

### Manual-first operations (by design, not by omission)
- Buyer follow-up: manual
- Accio.com research: manually entered into market intelligence module
- Lot alert outreach: manual (filter buyers in admin, export CSV, email externally)
- RFQ quoting: manual
- Sample logistics: manual
- Sourcing fulfillment: manual (founder contacts coops/farmers, evaluates options, creates/matches lots, responds to buyer)
- The app **organizes the work**, it does not automate the business.

### Accio.com
- Internal research assistant only. No API integration.
- Admin records Accio-assisted research as market intelligence notes (variety, process, target markets, demand trend, estimated rates, comparable offerings, pricing recommendation, source, date).
- Never exposed to buyers.

### Response-time commitments (buyer-facing copy)
- **RFQ / sample confirmations:** "We respond within 2 business days."
- **Sourcing confirmation and form intro:** "We respond within 10 business days" (founder: sourcing can take up to two weeks) — plus explicit not-a-guarantee language.
- **Why:** unresolved "[X]" placeholders or invented numbers would otherwise ship to real buyers. Exit test asserts no placeholder text remains anywhere.

### GDPR deletion → simple hard delete
- **Decision:** Admin "Delete buyer" action — hard-deletes the profile and cascade-deletes all their requests and sessions, with a confirmation step. Anonymization was considered and dropped (founder decision: not worth the complexity; analytics residue value at this scale is marginal).
- **Why the capability must exist at all:** the Privacy Policy promises data deletion and EU buyers are a target market — the platform must be able to actually perform what the policy promises.

### Lot deletion guard
- **Decision:** Lots referenced by any RFQ, sample request, or sourcing matchedLotId cannot be deleted — admin is told to set status to SOLD instead. Unreferenced lots (created by mistake) can be truly deleted.
- **Why:** Request history is strategic asset #3; cascade-deleting it via lot removal would silently destroy it. The lot lifecycle ends at SOLD, not delete.

### Session expiry
- **Decision:** Buyer sessions = 30-day rolling (revised back from a briefly-considered 24h after Claude flagged the OTP re-auth friction it would impose on returning buyers). Admin sessions = 24-hour, no rolling extension (single shared password warrants a short window).

### Housekeeping decisions
- Expired otpCodes/sessions purged lazily on OTP request and session validation — no cron jobs.
- `maxBudgetPerKg` visibility clarified: visible to the submitting buyer and admin; never to producers, other buyers, or external parties.
- Buyers cannot edit or cancel submitted requests in MVP (deliberate, manual-first — they email FINCAVA). No edit/cancel flows built.

### Multi-tool workflow
- **Claude is the sole reviewer and decision authority.** ChatGPT was originally proposed as architecture/code reviewer but this was simplified to Claude only, avoiding conflicting architectural advice and relitigated decisions.

---

## PHASED EXECUTION

| Phase | Scope | Key risk |
|---|---|---|
| **0 — Foundation** | Repo scaffold, Express, Drizzle schema + migration, Neon connection, seed data (6 lots covering all 5 pricing strategies + 1 hidden INVITE_ONLY), env config, README stub | Migration failure if DATABASE_URL is wrong |
| **1 — Public site** | Home, About, Contact, Privacy, ToS, catalog, partial passport, pricing display, responsive | Field leaking — exit test asserts on raw JSON |
| **2 — Buyer auth** | OTP flow (register + login unified), sessions, profile completion, full passport unlock, My Profile, logout | Rate limiting and OTP security rules — test with scripted repeat calls |
| **3 — RFQ + samples + sourcing** | All three forms (auth-required), sourcing request with "Can't find what you need?" CTAs, buyer confirmation emails (all types), founder notifications (all types), request history, rate limiting | Email failure must not fail user request; sourcing confirmation must include "not a guarantee" |
| **4 — Admin** | All admin modules, Cloudinary image upload, unified request queue with tabs (RFQ/sample/sourcing), distinct status workflows, sourcing matched-lot linking, market intelligence, alert outreach export | Buyer session must never access admin routes (assert 404) |
| **5 — Polish** | Empty states, errors, SEO, README, deploy verification, backup command, security checklist | Full buyer journey walkthrough on deployed URL |

**Rule: no phase starts until the previous phase's exit tests pass.**

---

## ENV VARS (founder has all accounts ready)

| Variable | Source |
|---|---|
| `DATABASE_URL` | Neon dashboard → Connection Details (pooled) |
| `SESSION_SECRET` | `openssl rand -hex 32` (self-generated) |
| `OTP_HASH_SECRET` | `openssl rand -hex 32` (self-generated, different from above) |
| `ADMIN_PASSWORD` | Founder's choice |
| `RESEND_API_KEY` | Resend dashboard → API Keys |
| `EMAIL_FROM` | Verified sender in Resend (e.g. hello@fincava.com) |
| `FOUNDER_EMAIL` | Founder's personal email for notifications |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary dashboard |

---

## WHAT TO WATCH FOR

1. **Phase creep.** Claude Code will be tempted to rush phases or add "small" features. Hold it to phase gates — exit tests must pass before next phase starts.
2. **UI-only gating.** If lot detail fields are hidden in React but returned in the API response, the gating is fake. The exit test checks raw JSON, not what renders.
3. **Old-platform patterns.** If you see compliance modules, supplier onboarding, graduation state machines, buyer matching algorithms, or multi-tenant logic appearing — stop immediately. None of that belongs here.
4. **Overengineering signals.** Event buses, message queues, microservice boundaries, abstract factory patterns, autonomous agents — all explicitly banned. If the codebase stops being readable by a non-technical founder, it's wrong.
5. **Email deliverability.** If OTP emails hit spam, check Resend domain verification (SPF + DKIM green). This is a founder infrastructure task, not a code fix.

---

## PENDING FOUNDER TASKS (not code)

- [ ] Archive old repos (`FinCava`, `FinCava-Hub`) as read-only on GitHub when ready
- [ ] Confirm governing law for Terms of Service with legal counsel
- [ ] Verify Resend sending domain shows green SPF + DKIM
- [ ] Set up weekly `pg_dump` backup habit once live (command will be in README)
