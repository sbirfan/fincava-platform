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

## Current status

Phases 0–5 are all closed. Phase 5 (Polish + deploy), the final phase, landed in commit `f6b9f37`
("Add Phase 5: polish, SEO, fail-fast guard, final README, security pass") on top of `984d1c5`
(finalize 5-business-days copy + document manual-redeploy). Verified directly against code as of
2026-07-29: `globalRateLimiter`/`verificationRateLimiter`/`buyerFormRateLimiter` are separate
instances in `server/src/middleware/rateLimit.ts`; zero `bearer` hits anywhere in the codebase;
session cookies are signed (`cookieParser(requireEnv('SESSION_SECRET'))` in `server/src/app.ts`,
`req.signedCookies` used consistently); `server/scripts/verify-shared-build.mjs` is wired via
`predev`/`prestart`; README has a "Deploying" section with the manual-redeploy + post-redeploy
smoke-test steps and a full founder operations guide; Contact.tsx has the real email/WhatsApp;
Terms.tsx has the finalized governing-law clause (see the correction above — no business-use/
international clause exists, contrary to an earlier draft of this file).

There is no remaining known-open Phase 5 work. If new work starts, treat this section as stale
until re-verified — don't assume it stays accurate as the repo moves on.

<!-- Claude Code: when you reconcile this file against the actual repo, update this section with
the real current state and note anything above that conflicts with what you find in code. -->
