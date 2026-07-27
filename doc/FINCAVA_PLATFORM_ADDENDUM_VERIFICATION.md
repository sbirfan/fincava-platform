# FINCAVA PLATFORM — ADDENDUM: FARM & LOT VERIFICATION REQUESTS

Add this file to the `fincava-platform` project's knowledge files alongside
`FINCAVA_PLATFORM_HANDOVER.md` and `FINCAVA_PLATFORM_CLAUDE_CODE_PROMPT.md`.
It documents a gap discovered after those two files were finalized: the
public site now has a live "Request Farm Verification" call to action, but
the original data model, admin queue, and notification pattern only cover
RFQs, sample requests, and sourcing requests. This addendum brings
verification requests up to the same standard, and should be read as an
amendment to both source documents — not a replacement.

---

## WHY THIS EXISTS

Verification (fee-based farm, producer, origin, and lot documentation) is
one of Fincava's two active revenue lines from day one, alongside
procurement/resale. The public About page now includes a "Request Farm
Verification" button. Without a backing entity, that button submits into
nothing. This addendum specifies what's needed so it doesn't.

---

## KEY DECISION: NOT GATED BEHIND BUYER AUTH (deliberate divergence)

RFQs, sample requests, and sourcing requests all require an authenticated
buyer session — reasonable, since those buyers are already committed
enough to register. Verification exists specifically **for buyers who
aren't ready to commit to that yet.** Requiring a full email-OTP
registration before someone can ask "can you check out this farm for me"
reintroduces the exact friction the service is meant to remove.

**Decision: verification requests are a public, unauthenticated form** —
closer in spirit to the Contact page than to RFQ/Sample/Sourcing. This is
a deliberate exception to the platform's "buyer auth required" pattern
used everywhere else, and should be called out as such in code review —
it is not an oversight if a reviewer notices the inconsistency.

Because this is the platform's only public, unauthenticated write
endpoint, it carries higher spam/abuse exposure than any other form.
Treat rate limiting and the honeypot field as non-negotiable here, more so
than on the buyer-gated forms.

If you'd rather keep the platform's auth-everywhere consistency instead,
the alternative is: show the public CTA, but route it to
"enter your email to get started" with a lightweight session (not full
OTP) — flag this back to Irfan as an open decision if preferred over the
public-form approach above.

---

## SCHEMA ADDITIONS

### New enum: `verification_status`
`NEW, REVIEWING, SCHEDULED, REPORT_DELIVERED, CLOSED`

- `NEW` — just submitted.
- `REVIEWING` — founder is scoping the request (which farm/region, what level of visit, pricing).
- `SCHEDULED` — a visit or remote session has a date.
- `REPORT_DELIVERED` — findings sent to the requester.
- `CLOSED` — done, whether or not it converted to a purchase.

### New table: `verificationRequests`
All tables get `id` (uuid), `createdAt`, `updatedAt`, per the existing convention.

| Field | Type | Notes |
|---|---|---|
| `requesterName` | text, required | |
| `requesterEmail` | text, required | |
| `requesterCompany` | text, required | |
| `requesterPhone` | text, nullable | |
| `country` | text, nullable | |
| `farmOrLotOfInterest` | text, nullable | Free text — a specific farm/lot name, or blank for a general capability inquiry |
| `regionOfInterest` | text, nullable | |
| `message` | text, nullable | What they want verified and why |
| `linkedLotId` | FK → `greenCoffeeLots`, nullable | Admin can link this after the fact if it concerns an existing catalog lot |
| `status` | `verification_status`, default `NEW` | |
| `internalNotes` | text, admin-only | |
| `reportDeliveredAt` | timestamp, nullable | |

No `buyerProfileId` — see the auth decision above. If the requester later
registers as a buyer, that's a separate, unlinked record for MVP; don't
build a merge/link flow for this now (matches the platform's existing
"don't overbuild" discipline).

---

## EMAIL (Resend) — extends the existing transactional-only pattern

1. **Requester confirmation** — "We received your verification request.
   We'll respond within 5 business days to discuss scope, timing, and
   pricing." Same non-blocking pattern as every other confirmation email
   (fires after DB commit, logs on failure, never fails the user's
   request). The "5 business days" figure is a placeholder for Irfan to
   confirm or change — do not ship a different number without his sign-off,
   and do not leave it as `[X]` (same exit-test rule as the rest of the spec).
2. **Founder notification** — fires on every new verification request,
   same as the other three request types. Include requester details and a
   link to the admin record.

---

## PAGES

### Public (no auth) — new page
**Farm & Lot Verification** (`/verification`) — the destination for the
"Request Farm Verification" button on the About page. A short intro
(reuse the About page's verification copy — "not certification,
field verification and documentation" language) plus the request form
(name, email, company, phone, country, farm/lot of interest, region,
message). Same rate limiting and honeypot requirements as other public
forms (10/hour/IP), but flagged above as the higher-priority case since
it's the only unauthenticated one.

### Admin (`/admin`, env-password) — extends existing pages
- **Dashboard** — add a fifth stat: **New verification requests (7d)**,
  alongside the existing RFQ/sample/sourcing/registration counts.
- **Requests queue** — add a fourth tab: **Verification**, alongside
  RFQ/Sample/Sourcing. Own status workflow (`verification_status`),
  `internalNotes` editing, and the ability to link a `matchedLotId`-style
  reference (`linkedLotId`) to an existing catalog lot if relevant.

---

## WHERE THIS SLOTS INTO THE PHASED PLAN

- **Phase 1 (Public site)** — add the `/verification` page and form. It
  has no auth dependency, so it can ship alongside the rest of the public
  site rather than waiting for Phase 2/3's buyer-auth work.
- **Phase 4 (Admin)** — add the Verification tab to the Requests queue and
  the Dashboard stat, alongside the other admin work already scoped there.

Exit test additions:
- Phase 1: verification form submits without any auth session; rate limit
  and honeypot both verified with scripted repeat calls, same as other
  public forms.
- Phase 4: verification requests appear in the admin queue with correct
  status transitions; Dashboard stat count matches; linking a
  `linkedLotId` persists correctly.

---

## WHAT THIS ADDENDUM DELIBERATELY DOES NOT ADD

- No buyer-facing "my verification requests" history — since there's no
  buyer account tied to the request, there's nothing to show on a My
  Profile page. If a registered buyer later submits a verification
  request through the same public form, it stays a standalone, unlinked
  record for MVP.
- No pricing/payment collection on the form itself. Verification is
  fee-based, but scope and price are worked out manually after the
  `REVIEWING` step (same manual-first philosophy as RFQ quoting and
  sourcing fulfillment elsewhere in the spec) — not something to automate
  into a checkout flow.
- No changes to the `greenCoffeeLots`, `buyerProfiles`, `rfqs`,
  `sampleRequests`, or `sourcingRequests` tables. This is additive only.
