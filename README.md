# FINCAVA Platform

A Green Coffee Buyer Relationship Platform for professional buyers — specialty
importers, roasters, brokers, distributors, and competition buyers. FINCAVA
lists curated Colombian green coffee lots ("coffee passports"), takes RFQs,
sample requests, and open-ended sourcing requests from registered buyers, and
takes fee-based farm/lot verification requests from the public.

This is a clean, from-scratch build. It does not reuse code, schema, or
architecture from any prior FINCAVA platform.

**Status:** Phase 0 (Foundation) complete — repo scaffold, Express skeleton,
full Drizzle schema, migration applied to Neon, and seed data loaded. See
"Current status" below.

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
5. `npm run dev` — starts the API on port 5000 and the Vite dev server on 5173

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

## Current status (Phase 0 — complete)

- Full Drizzle schema is written: all tables and enums from the execution
  spec, plus `verificationRequests` / `verification_status` from the
  verification addendum.
- The initial migration (`drizzle/0000_fresh_sir_ram.sql`) has been applied
  to the Neon database.
- The seed script has run: 6 realistic Colombian lots, all five pricing
  strategies, one hidden `INVITE_ONLY` lot. `rfqs`, `sampleRequests`,
  `sourcingRequests`, `verificationRequests`, and `buyerProfiles` are
  confirmed empty — they only ever hold real submissions.
- No pages beyond a placeholder home screen exist yet — Phase 1 builds out
  the public site.

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
