# FINCAVA Platform — Project Memory

This file is durable project memory, reloaded at the start of every Claude Code session. If
you're reading this after a `/compact` or `/clear`, treat everything below as settled ground
truth — not something to re-derive or second-guess from conversation history.

## Source of truth, in order of authority

1. `docs/FINCAVA_PLATFORM_HANDOVER.md` — the *why* behind every architectural decision, and an
   explicit list of what to avoid (old-platform patterns, overengineering signals).
2. `docs/FINCAVA_PLATFORM_CLAUDE_CODE_PROMPT.md` — the execution spec: stack, data model, pages,
   phased plan, exit tests.
3. `docs/FINCAVA_PLATFORM_ADDENDUM_VERIFICATION.md` — amends the execution spec, adding
   verification requests as a first-class entity with a deliberate exception to the auth pattern
   (see below).
4. `docs/FINCAVA_Wireframes_dc_v2.html` — visual and copy source of truth for the public pages.

If anything in this file conflicts with those docs, the docs win — update this file to match,
don't silently follow this file instead.

## Non-negotiable rules

- No prior-platform architecture reuse (compliance modules, supplier onboarding, graduation state
  machines, buyer-matching algorithms — if you find yourself building any of these, stop).
- No microservices, event buses, message queues, or autonomous agents.
- Stack is fixed: Vite+React+TS+Tailwind / Node+Express+TS / Neon Postgres+Drizzle / Resend
  (transactional only) / Cloudinary / server-side sessions in Postgres.
- Field gating (public / gated-buyer / admin-only) is enforced server-side, verified via raw JSON,
  never assumed correct because the UI hides something.
- Never commit secrets. `.env.example` documents variable names only.
- Phase-gate discipline: do not start a phase until the previous phase's exit tests pass with
  actual evidence.

## The reporting standard (this is the one most likely to erode under context pressure — hold it)

- Report exit tests **per item, with evidence** — exact numbers, exact commands run, exact
  results. A summary claim ("all tests pass," "phase is closed") is not acceptable on its own.
- Rate-limit tests must show the exact request number where blocking starts, not just "it
  eventually blocks."
- Email delivery claims require confirmation two ways: Resend logs/message ID **and** actual
  physical inbox confirmation for anything correctness-critical (OTP, sourcing confirmation with
  legally-relevant "not a guarantee" language). A "sent" status alone is not sufficient for those.
- When something is found to be wrong, name the actual root cause — don't just re-run the same
  check until it passes.
- Before citing a commit hash as evidence for something, confirm it with `git show <hash> --stat`
  or an actual diff — don't cite from memory. Misattributed commit hashes have caused real
  confusion in this project before.
- Security-relevant changes get their own commit, separate from unrelated infra/build fixes —
  bundling them makes it too easy for a security fix to go unmentioned in a report built around
  the other change's narrative.
- If asked to resolve N items and only M < N are actually done, say so explicitly. Do not report
  "all items resolved" unless every item actually has a corresponding change.

## Deliberate decisions — do not "fix" these without asking first

- **Verification requests (`/verification`) do not require buyer authentication.** This is the
  only public, unauthenticated write endpoint on the site, by design — verification exists
  specifically for buyers not ready to commit to a full registration. It has its own separate
  rate-limit bucket (10/hour/IP), independent from the buyer-authenticated forms, specifically so
  an anonymous actor hammering it can't exhaust a real buyer's quota on RFQ/sample/sourcing.
- **Admin auth is real session-based auth as of Phase 4.** A Bearer-token stopgap existed earlier
  and was fully retired — if you ever see a Bearer-token check anywhere in the codebase again,
  that's a regression, not a feature to preserve.
- **The lot deletion guard**: a lot referenced by any RFQ, sample request, sourcing
  `matchedLotId`, or verification `linkedLotId` cannot be deleted — status goes to SOLD instead.
- **Buyer deletion is a real hard delete**, cascading to all their RFQs/samples/sourcing
  requests/sessions, with their session cookie confirmed invalidated immediately. Verification
  requests are NOT linked to buyerProfileId (per the no-auth design above) and are unaffected by
  buyer deletion.
- **Terms of Service and Privacy Policy are on their full B2B-focused legal version** (both
  replaced in full — not the earlier short-form copy). Terms.tsx has 14 sections: B2B-only scope,
  listings-not-offers, requests-don't-create-a-contract, pricing, platform disclaimer, liability
  cap (greater of US$100 or trailing-12-months payments), IP, acceptable use, governing law/venue
  (Texas, Williamson County, jury-trial waiver, **plus an international-buyer acknowledgment
  clause** — Texas law/forum governs even for non-US buyers except where a non-waivable mandatory
  law of their jurisdiction says otherwise), changes, severability, no-waiver, entire agreement,
  and contact. Privacy.tsx has 14 sections covering collection/use/legal bases/cookies/disclosure/
  international transfer/retention/rights/account deletion/security/children/third-party
  services/changes/contact. Both use a real Effective Date (not a placeholder) and
  info@fincava.com as the contact email throughout. Don't re-flag this content as pending, and
  don't silently shorten or re-derive it — treat the current file content as the finalized text.
- **Contact page**: WhatsApp 512-360-0118, email info@fincava.com — finalized, not placeholders.
- **Verification confirmation email's "5 business days" response time is finalized.**
- **Replit Autoscale Deployments do not auto-redeploy on push** — confirmed directly against
  Replit's docs, no native option exists. Manual redeploy is required after every single push,
  documented in README's "Deploying" section, along with a required post-redeploy smoke test
  (hit a real page, not just confirm the deploy succeeded) since App Monitoring only catches a
  fully-down deployment, not a stale-but-still-responding one.
- **The shared-package startup guard must fail loudly**, with a specific error naming what's
  missing/stale and how to fix it — never silently continue in a degraded state. A missing export
  from `@fincava/shared` is a real client/server integrity risk, not something to paper over.
- **Verification's service-limitation disclaimer is finalized** (Verification.tsx and
  `server/src/email/templates/verification.ts`, both the pre-submission copy and the confirmation
  screen/email): the service is fee-based; it is not a certification, an accredited audit, a legal
  due-diligence opinion, or a guarantee; reports distinguish what FINCAVA directly observed, what
  the producer reported, records reviewed, and anything that couldn't be confirmed; and FINCAVA
  discloses — as a factual, non-categorical statement — that it has a commercial interest in some
  verified coffee via its other revenue line (sourcing/procurement/resale). **Do not use the phrase
  "independent third party" (or any rephrasing that claims or denies independence) anywhere in this
  copy** — a prior draft used it and it was deliberately removed as overclaiming; the current
  wording states facts, not a categorical independence claim in either direction.
- **The per-request commercial-relationship disclosure (item 5 of the verification disclaimer) is
  a known, deliberately incomplete gap, not a bug.** The page states the general structural fact
  (FINCAVA's dual business lines), but there is no schema field or admin workflow that checks or
  discloses whether a *specific* farm/producer/lot in a given verification request has an existing
  commercial relationship with FINCAVA. This is a pending business/product decision — don't "fix"
  it by inventing a disclosure workflow, and don't re-flag it as a newly-discovered gap; it's
  already known and intentionally left open.
- **`scripts/validate-copy.mjs` exists** — a dependency-free Node script (no test framework exists
  in this repo) that checks response-time figures, the verification-disclaimer wording limits
  above, the protected sourcing confirmation text, USD budget labeling, and that admin pages use
  formatted labels instead of raw enum values. Run it with `node scripts/validate-copy.mjs`. **Re-run
  it after each phase (A–F) of the upcoming UX/form-enhancement work** — those phases will touch
  many of the same confirmation strings and admin labels this script checks, and it's a cheap way
  to catch the same class of regression (a "verified lots" or "independent" phrase creeping back
  in, a response-time figure drifting, a raw enum reappearing) before it ships.
- **The "Buyer type" and "Preferred contact method" dropdowns in Profile.tsx render raw,
  underscore-stripped enum casing** (e.g. "SPECIALTY ROASTER", "WHATSAPP" instead of "Specialty
  roaster", "WhatsApp") — found during manual verification of the copy-review work. This predates
  both copy-review passes and was deliberately left alone rather than expanding either pass's
  scope. It's intentionally deferred to the upcoming UX/form-enhancement work, not something to fix
  ad hoc or re-report as newly found.

## Current status

Phases 0–4 closed with verified exit-test evidence. Phase 5 (Polish + deploy), the final phase,
landed in commit `f6b9f37` ("Add Phase 5: polish, SEO, fail-fast guard, final README, security
pass") on top of `984d1c5` (finalize 5-business-days copy + document manual-redeploy), and is also
closed: `globalRateLimiter`/`verificationRateLimiter`/`buyerFormRateLimiter` are separate instances
in `server/src/middleware/rateLimit.ts`; zero `bearer` hits anywhere in the codebase; session
cookies are signed (`cookieParser(requireEnv('SESSION_SECRET'))` in `server/src/app.ts`,
`req.signedCookies` used consistently); `server/scripts/verify-shared-build.mjs` is wired via
`predev`/`prestart`; README has a "Deploying" section with the manual-redeploy + post-redeploy
smoke-test steps and a full founder operations guide; Contact.tsx has the real email/WhatsApp; and
Terms.tsx/Privacy.tsx carry the full legal-pages replacement, including the governing-law,
business-use, and international-buyer clauses in Terms.tsx — all present and finalized, per the
"Deliberate decisions" section above (a stale sentence here previously claimed the international
clause didn't exist; that was wrong and has been corrected).

Two copy-review passes have since landed on top of the closed Phase 5 work, each in its own
commit, separate from this file's own correction: `c59d84a` (the initial editorial pass — public/
buyer pages, forms, admin labels, email templates) and `90b2b10` (a follow-up addressing that
pass's own findings — the verification-disclaimer rewrite, the "documented"/"known" terminology
audit, 19 admin error messages made actionable). `e984325` added `scripts/validate-copy.mjs` as a
separate commit (new tooling, not content). See the "Deliberate decisions" bullets above for what's
now finalized from that work (the verification disclaimer, the deliberately-incomplete item-5 gap,
and the deferred buyer-type/contact-method casing issue). There is no remaining known-open Phase 5
work. If new work starts, treat this section as stale until re-verified — don't assume it stays
accurate as the repo moves on.

<!-- Claude Code: when you reconcile this file against the actual repo, update this section with
the real current state and note anything above that conflicts with what you find in code. -->
