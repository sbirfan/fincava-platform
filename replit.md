# FINCAVA Platform

A Green Coffee Buyer Relationship Platform for professional buyers — specialty importers, roasters, brokers, distributors, and competition buyers.

## Stack

- **Frontend:** Vite + React + TypeScript + Tailwind CSS, react-router (port 5000 in dev)
- **Backend:** Node.js + Express + TypeScript (port 3000 in dev)
- **Database:** Neon PostgreSQL via Drizzle ORM
- **Validation:** Zod schemas shared between client and server (`/shared`)
- **Email:** Resend (transactional)
- **Images:** Cloudinary (admin uploads)
- **Sessions:** Server-side sessions in Postgres, httpOnly cookies

## Project layout

```
/client    — Vite React app
/server    — Express API, auth, email, cloudinary
/shared    — zod schemas + enum/TS types used by both client and server
/drizzle   — generated SQL migrations
```

## How to run

The dev workflow starts both services concurrently:

```
npm run dev
```

- Vite frontend → http://localhost:5000 (preview pane)
- Express API → http://localhost:3000 (proxied via `/api`)

## Key commands

| Command               | What it does                                        |
| --------------------- | --------------------------------------------------- |
| `npm run dev`         | Starts both Vite (5000) and Express (3000) in watch mode |
| `npm run build`       | Builds shared → client → server                    |
| `npm start`           | Runs the built server (serves API + built client)   |
| `npm run db:generate` | Generates a new migration from schema changes       |
| `npm run db:migrate`  | Applies pending migrations to DATABASE_URL          |
| `npm run db:seed`     | Loads the 6-lot seed dataset                        |

## Environment secrets (set in Replit Secrets)

| Key              | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `DATABASE_URL`   | Neon PostgreSQL connection string              |
| `SESSION_SECRET` | Signs session cookies                          |
| `OTP_HASH_SECRET`| Hashes OTP codes server-side                  |
| `ADMIN_PASSWORD` | Founder admin account password                 |
| `RESEND_API_KEY` | Transactional email (optional until Phase 3)   |
| `CLOUDINARY_*`   | Image uploads (optional until Phase 4)         |

## Checking email delivery health

Every `sendEmail()` call writes a row to the `email_logs` table (`status`: `sent` | `error` | `skipped`). If you suspect email is broken, run this query against the Neon database:

```sql
-- Last 20 send attempts, newest first
SELECT created_at, status, "to", subject, resend_id, error_message
FROM email_logs
ORDER BY created_at DESC
LIMIT 20;

-- Count failures in the last 24 hours
SELECT status, count(*)
FROM email_logs
WHERE created_at > now() - interval '24 hours'
GROUP BY status;
```

**`skipped`** rows mean `RESEND_API_KEY` or `EMAIL_FROM` is not set in Replit Secrets — no emails are going out at all.  
**`error`** rows include the Resend error message in `error_message` — check the value for domain verification issues, rate limits, or invalid recipients.  
**`sent`** rows include the Resend message ID in `resend_id` — paste it into the Resend dashboard → Logs to see delivery status (delivered / bounced / spam).

If all recent rows are `skipped`: add `RESEND_API_KEY`, `EMAIL_FROM`, and `FOUNDER_EMAIL` to Replit Secrets, then restart the workflow.

## Status

Phase 1 complete — public site, lot catalogue, verification request form, and email logging are live.

## User preferences

- Keep the project's existing monorepo structure (client / server / shared workspaces)
- Do not restructure or migrate the stack without an explicit request
