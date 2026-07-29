# FINCAVA Platform

A Green Coffee Buyer Relationship Platform for professional buyers — specialty
importers, roasters, brokers, distributors, and competition buyers. FINCAVA
lists curated Colombian green coffee lots ("coffee passports"), takes RFQs,
sample requests, and open-ended sourcing requests from registered buyers, and
takes fee-based farm/lot verification requests from the public.

This is a clean, from-scratch build. It does not reuse code, schema, or
architecture from any prior FINCAVA platform.

**Status:** Feature-complete (Phases 0–5). Public site, buyer auth +
registration, RFQ/sample/sourcing/verification requests, and the full admin
back office are all live.

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
- **Sessions:** server-side sessions in Postgres, signed httpOnly/secure/
  sameSite=lax cookies — no JWT in localStorage

## Project layout

```
/client    — Vite React app (buyer-facing site + /admin back office)
/server    — Express API, auth, email, cloudinary
/shared    — zod schemas + enum/TS types used by both client and server
/drizzle   — generated SQL migrations
```

## Setup from zero

1. `npm install` (installs all three workspaces)
2. Copy `.env.example` to `.env` and fill in real values:
   - `DATABASE_URL` — Neon dashboard → Connection Details (pooled connection)
   - `SESSION_SECRET`, `OTP_HASH_SECRET` — generate each with
     `openssl rand -hex 32`. `SESSION_SECRET` is **required** — the server
     signs session cookies with it and refuses to start without it.
   - `ADMIN_PASSWORD` — your choice; checked with a constant-time comparison
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

`npm run dev` and `npm start` (in the `server` workspace) both run a
pre-flight check (`server/scripts/verify-shared-build.mjs`) before starting —
see "Fail-fast shared-package guard" below.

## Fail-fast shared-package guard

A stale or missing `@fincava/shared` build has caused two production
outages: `shared/dist` lagging behind `shared/src` produces a cryptic native
`SyntaxError: does not provide an export named '...'` at module-link time —
before any application code runs, so it can't be caught from inside the
server process itself.

`server/scripts/verify-shared-build.mjs` runs as a separate pre-flight step
(wired via npm's `predev`/`prestart` lifecycle hooks) that checks, in order:

1. Does `shared/dist/index.js` exist at all?
2. Is anything under `shared/src` newer than everything under `shared/dist`
   (i.e. is the build stale)?
3. Does `@fincava/shared` actually load without throwing?

Any failure prints a specific `FATAL:` message naming the problem and the
exact fix (`npm run build --workspace shared`), then exits non-zero —
**nothing starts, no routes are served in a broken state.** This is
deliberately a loud failure, not an auto-rebuild-and-continue: a stale
export is a real integrity risk (client and server could silently disagree
on validation or pricing logic), so masking it would be worse than the
current crash, just quieter.

This is a safety net, not a substitute for the build itself being correct —
the actual Replit Autoscale Deployment path (`build` then `run` as separate
deploy steps, per `.replit`) already guarantees a fresh `shared` build before
every `npm start`, since the root `build` script rebuilds `shared` first.
The guard exists for every other path that isn't guaranteed to (a bare
`npm run dev`, a manual `npm start`, anything invoked outside the deploy
pipeline).

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
3. **Manually confirm the live site actually reflects the change you just
   shipped — do not stop at "the deploy succeeded."** Open a real page on
   the live URL (the [Available Lots catalog](/lots) or a specific lot
   passport) and check it against what you expect after this push.
   `/api/health` responding is not enough: App Monitoring (and a bare
   health check) only catches a deployment that's fully down — a
   deployment that's up and responding but still silently serving the
   _previous_ build looks completely healthy to both. This has already
   caused two production outages; both would have been caught immediately
   by this step and weren't, because it was skipped.

Do this every time, no exceptions — a push landing in git is not the same
as it being live, and a successful "Publish" is not the same as the new
code actually running.

**App Monitoring** is enabled for this Deployment, but only catches a fully
down deployment (no response / errors). It does not detect a stale-but-
responding deployment — step 3 above is the only thing that catches that
failure mode.

Before considering a launch final, also re-confirm **Replit Publishing
access is set to Public** in the Deployment settings — there's no audit
trail if this gets toggled, so check it immediately before sign-off rather
than trusting an earlier confirmation.

## Founder operations guide

Everything below is done from `/admin` (env-password protected, separate
session from buyer accounts — see "Fail-fast..." note above for how the two
are kept apart). None of it requires touching code.

### Add or edit a lot (with images)

1. `/admin/lots` → **New lot** (or click an existing lot to edit).
2. Fill in the passport fields, pricing strategy, and status. Leave
   **Visible on public site** checked unless the pricing strategy is
   `INVITE_ONLY` (that one defaults to hidden on creation — flip it on once
   terms are settled with that buyer).
3. Save. For a new lot, you're taken to its edit page where the image
   uploader becomes available (images require the lot to exist first).
4. Upload images (JPEG/PNG/WebP, ≤5MB each) — they go straight to Cloudinary,
   nothing touches the server's disk. Add/remove as needed; changes are
   live on the public site immediately.
5. To retire a lot, set its status to `SOLD` rather than deleting it — a lot
   referenced by any RFQ, sample request, sourcing match, or verification
   link can't be deleted at all (the delete button will tell you exactly
   how many linked requests are blocking it). Only a lot with zero linked
   requests can be truly deleted.

### Handle an RFQ end-to-end

1. `/admin/requests` → **RFQ** tab. Each row shows the buyer, lot, volume,
   destination, and any message.
2. Respond to the buyer directly by email (their address is shown in the
   row) — quoting, negotiation, and the actual sale happen outside the
   platform, by design.
3. Update the status as it progresses: `NEW → REVIEWING → REPLIED →
QUOTED → CLOSED` (or `SAMPLE_SENT` if a sample goes out first). Add
   internal notes for anything worth remembering later — buyers never see
   these.

### Handle a sample request

Same queue pattern, **Sample** tab. Statuses share the same set
(`NEW → REVIEWING → REPLIED → SAMPLE_SENT → CLOSED`) — arrange the actual
shipment yourself (courier account, if provided, is shown in the row) and
update status as it moves.

### Handle a sourcing request end-to-end

1. `/admin/requests` → **Sourcing** tab. Each row shows what the buyer is
   looking for — intended use, preferences (or "open to suggestions" where
   they didn't specify), volume, delivery window, and budget (marked
   confidential — never share this figure with producers or other buyers).
2. Set status to `REVIEWING` while you scope it, then `SOURCING` while
   actively searching the cooperative network.
3. Once you find or arrange a matching lot — whether it's an existing
   catalog lot or one you create fresh (see "Add or edit a lot" above) —
   set status to `MATCHED` and use the **matched lot** dropdown on that
   same row to link it (`matchedLotId`). This is for your own tracking; it
   doesn't notify the buyer automatically.
4. Reply to the buyer by email with what you found. Set status to `QUOTED`
   once pricing is in their hands, `CLOSED` once resolved either way.

### Handle a verification request

`/admin/requests` → **Verification** tab. These come from the public,
unauthenticated `/verification` form (by design — see
`docs/FINCAVA_PLATFORM_ADDENDUM_VERIFICATION.md`), so there's no buyer
account attached, only the requester's contact details. Status flow:
`NEW → REVIEWING → SCHEDULED → REPORT_DELIVERED → CLOSED`. If the request
concerns an existing catalog lot, link it via **linked lot**
(`linkedLotId`) the same way sourcing requests link a matched lot.

### Record market research

`/admin/market-intelligence` → **New note**. Attach it to a specific lot or
leave it general; filter the list by variety or lot later. This is your own
research archive (comparable pricing, demand trends, suggested buyer
categories) — nothing here is buyer-facing.

### Run an alert outreach export

1. `/admin/alert-outreach`. Set any combination of filters (variety,
   process, certification, region, score range) — every filter is
   optional and only narrows the match; an unset one doesn't exclude
   anyone. Only buyers with `alertOptIn` on are ever considered.
2. **Search** to see the matching list, then **Export CSV** — the export
   always reflects exactly the filter you just searched with, never a
   stale or different set.
3. Outreach itself (drafting and sending the actual email) is manual, by
   design — there is no automated send.

### Handle a GDPR data-deletion request

1. Find the buyer at `/admin/buyers`, open their detail page.
2. **Delete buyer** → confirm. This is a hard, irreversible delete: it
   removes the buyer profile row and cascades to **all** of their RFQs,
   sample requests, sourcing requests, and active sessions (their session
   cookie stops working immediately, even mid-session).
3. Verification requests are **not** affected by this — they're never tied
   to a buyer account in the first place (public, unauthenticated form by
   design), so there's nothing to cascade there.
4. There is no undo. Confirm you have the right buyer before proceeding.

### Weekly backup (`pg_dump`)

Run from anywhere with `pg_dump` installed and network access to Neon
(the same `DATABASE_URL` from `.env`):

```bash
pg_dump "$DATABASE_URL" -Fc -f "fincava-backup-$(date +%Y%m%d).dump"
```

`-Fc` produces Postgres's custom compressed format, restorable with
`pg_restore` into a fresh database:

```bash
createdb fincava_restore_test
pg_restore -d fincava_restore_test "fincava-backup-YYYYMMDD.dump"
```

Store the `.dump` file somewhere outside Neon itself (this is a backup —
it needs to survive a Neon-side incident, not just a bad migration).

## What stays manual by design

FINCAVA organizes the work; it does not automate the business. Buyer
follow-up, alert outreach, sample logistics, RFQ/verification quoting, and
sourcing fulfillment are all manual, founder-run tasks — see
`docs/FINCAVA_PLATFORM_HANDOVER.md` for the full reasoning.

## Cacao

Built for green coffee; cacao may be added later as a parallel
`commodityType` — intentionally out of MVP scope.
