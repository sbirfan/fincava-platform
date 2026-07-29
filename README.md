# FINCAVA Platform

A Green Coffee Buyer Relationship Platform for professional buyers — specialty
importers, roasters, brokers, distributors, and competition buyers. FINCAVA
lists curated Colombian green coffee lots ("coffee passports"), takes RFQs,
sample requests, and open-ended sourcing requests from registered buyers, and
takes fee-based farm/lot verification requests from the public.

This is a clean, from-scratch build. It does not reuse code, schema, or
architecture from any prior FINCAVA platform.

**Status:** Phase 1 (Public site) complete — Home, Available Lots, Lot
Passport, About, Contact, Privacy, Terms, and the public Verification form are
all live, on top of Phase 0's schema/migration/seed. See "Current status"
below.

---

## Stack

- **Frontend:** Vite + React + TypeScript + Tailwind CSS, react-router
- **Backend:** Node.js + Express + TypeScript — a single server serves the
  API and, in production, the built frontend
- **Database:** Neon PostgreSQL via Drizzle ORM + drizzle-kit migrations
- **Validation:** zod schemas shared between client and server (`/shared`)
- **Email:** Resend (transactional only)
- **Images:** Cloudinary (admin uploads only; nothing is written to the local
  filesystem or committed to git)
- **Sessions:** server-side sessions in Postgres, httpOnly/secure/sameSite=lax
  cookies — no JWT in localStorage

## Project layout

```
/client    — Vite React app
/server    — Express API, auth, email, cloudinary
/shared    — zod schemas + enum/TS types used by both client and server
/drizzle   — generated SQL migrations
```

## Setup from zero

1. `npm install` (installs all three workspaces)
2. Copy `.env.example` to `.env` and fill in real values:
   - `DATABASE_URL` — Neon dashboard → Connection Details (pooled connection)
   - `SESSION_SECRET`, `OTP_HASH_SECRET` — generate each with `openssl rand -hex 32`
   - `ADMIN_PASSWORD` — your choice
   - `RESEND_API_KEY`, `EMAIL_FROM` — Resend dashboard (sending domain must be verified)
   - `FOUNDER_EMAIL` — where operational notifications go
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — Cloudinary dashboard
3. Apply the database migration: `npm run db:migrate`
4. Load seed data (6 sample lots): `npm run db:seed`
5. Start local dev — see "Local development" below

## Local development

`npm run dev` only starts the Express API (on `PORT`, default `5000`). The
React app runs as its own Vite dev server and needs a second terminal:

```bash
# Terminal 1 — API
npm run dev

# Terminal 2 — client (proxies /api to the server above)
npm run dev --workspace client
```

The client dev server (port 5173) proxies `/api/*` requests to the backend.
It reads the backend's port from the same root `.env`'s `PORT` value, so the
two stay in sync automatically. If you need the client to point at a
different backend port than what's in `.env` (e.g. running two servers side
by side), override it explicitly for that one terminal:

```bash
API_PORT=5050 npm run dev --workspace client
```

In production (`npm start`), there's no second server or proxy — the one
Express process serves both the API and the built client from `client/dist`.

## Commands

| Command               | What it does                                      |
| --------------------- | ------------------------------------------------- |
| `npm run dev`         | Runs the Express server in watch mode             |
| `npm run build`       | Builds `/shared`, then `/client`, then `/server`  |
| `npm start`           | Runs the built server (serves API + built client) |
| `npm run db:generate` | Generates a new migration from schema changes     |
| `npm run db:migrate`  | Applies pending migrations to `DATABASE_URL`      |
| `npm run db:seed`     | Loads the 6-lot seed dataset                      |
| `npm run lint`        | Runs ESLint across the repo                       |
| `npm run format`      | Runs Prettier across the repo                     |

## Deploying

**⚠️ Every push to `main` requires a manual redeploy — there is no
auto-redeploy on push.** Confirmed directly against Replit's own
documentation (docs.replit.com, checked July 2026): Autoscale Deployments
have no native GitHub-triggered redeploy. Pushing to `main` updates the
repo and the workspace's own dev preview, but the separate published
Deployment (the live `fincava.com` / `*.replit.app` URL) keeps serving
whatever was last explicitly published until someone redeploys it —
confirmed the hard way, twice, during Phase 3 and Phase 4 (a push landed,
the live site kept serving the old build, then 500'd once that instance
was recycled).

After every push you intend to go live:

1. Open Replit → **Deployments** → **Publish** (or "Redeploy").
2. Confirm the new build succeeds.
3. Hit `/api/health` on the live URL and confirm it responds.

Do this every time, no exceptions — a push landing in git is not the same
as it being live.

## Current status (Phase 1 — complete)

**Phase 0 (Foundation):**

- Full Drizzle schema: all tables/enums from the execution spec, plus
  `verificationRequests` / `verification_status` from the verification
  addendum. Migration applied to Neon; seed loaded (6 lots, all five pricing
  strategies, one hidden `INVITE_ONLY` lot). `rfqs`, `sampleRequests`,
  `sourcingRequests`, `verificationRequests`, and `buyerProfiles` are
  confirmed empty — they only ever hold real submissions.

**Phase 1 (Public site):**

- Public pages: Home, Available Lots (filters), Lot Passport (locked vs.
  gated sections), About (incl. Field Verification CTA), Contact, Privacy,
  Terms, and the addendum's public `/verification` form. `/login` is a
  placeholder page — the real OTP flow ships in Phase 2.
- Design tokens (`client/src/styles/tokens.css`): real values for every
  `--fc-*` token the wireframe references.
- Shared pricing-display module (`shared/src/pricing.ts`): single source of
  truth for all five pricing-strategy display rules, used by the server's
  field-gating layer.
- Server-side field gating: anonymous lot responses never include gated or
  admin-only fields — verified against raw JSON, not just UI hiding.
- Verification request endpoint: 10/hour/IP rate limit, honeypot (silent
  no-op), zod `.strict()` rejecting unknown fields — this is the platform's
  only unauthenticated write endpoint, so these are held to a higher bar.
- Reusable Resend email utility (`server/src/email/`): non-blocking
  send-after-commit pattern. Verification confirmation and founder
  notification templates are built and wired up, but **real delivery is not
  yet verified** — `RESEND_API_KEY`/`EMAIL_FROM`/`FOUNDER_EMAIL` are still
  blank in `.env`.
- `trust proxy` is set in production so rate limiting and secure cookies see
  the real client IP behind Replit's reverse proxy.

## Go-live checklist (Phase 5)

Items confirmed during build that must be explicitly checked before
`fincava.com` goes live — not assumed to resolve on their own:

- **Disable Replit Deployment protection, if a formal Replit Deployment is
  used to publish this app.** As of Phase 2, the app has only ever been
  tested against the Replit _workspace preview_ URL (`*.replit.dev`), which
  has no platform-level access gate — confirmed directly by fetching it with
  a clean, cookie-free, header-free request and getting the app's real JSON
  back. A formal Replit _Deployment_ (`*.replit.app` or a custom domain) is a
  separate feature with its own settings, and Replit deployments can have a
  "Deployment protection" / password-gate option. If that's ever turned on
  for this project, it would block real anonymous buyers from the public
  site entirely. Check Replit's Deployment settings and confirm this is off
  before launch.
- ~~Replace the admin Bearer-token auth with real session-cookie admin
  auth~~ — **done in Phase 4.** Session-cookie auth (404-not-401,
  constant-time comparison, 5/15min rate limit) is live;
  `grep -ri bearer` across the repo returns zero hits.
- **Redeploy manually after every push** — see "Deploying" above. No native
  auto-redeploy exists for this Deployment; confirm App Monitoring's actual
  coverage (see "Deploying" section) before assuming an outage would page
  anyone.

## Founder operations guide

This section will be filled in as each admin feature ships (Phase 4):
adding/editing a lot and its images, handling an RFQ/sample/sourcing/
verification request end-to-end, recording Accio market research, running an
alert-outreach export, handling a GDPR data-deletion request, and the weekly
`pg_dump` backup command.

## What stays manual by design

FINCAVA organizes the work; it does not automate the business. Buyer
follow-up, alert outreach, sample logistics, RFQ/verification quoting, and
sourcing fulfillment are all manual, founder-run tasks — see
`docs/FINCAVA_PLATFORM_HANDOVER.md` for the full reasoning.

## Cacao

Built for green coffee; cacao may be added later as a parallel
`commodityType` — intentionally out of MVP scope.
