import { eq, lt } from 'drizzle-orm';
import type { Response } from 'express';
import { getDb } from '../db/index.js';
import { sessions } from '../db/schema.js';
import { env } from '../env.js';

export const SESSION_COOKIE_NAME = 'fincava_session';

// Buyer sessions: 30-day rolling — every validated request pushes expiresAt
// forward, so an active buyer never gets logged out mid-use.
export const BUYER_SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

// Admin sessions: 24-hour fixed — set once at login, never extended. A
// single shared password warrants a short, non-renewing window.
export const ADMIN_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

export interface SessionRow {
  id: string;
  buyerProfileId: string | null;
  isAdmin: boolean;
  expiresAt: Date;
}

export async function createBuyerSession(buyerProfileId: string): Promise<SessionRow> {
  const db = getDb();
  const expiresAt = new Date(Date.now() + BUYER_SESSION_DURATION_MS);
  const [row] = await db
    .insert(sessions)
    .values({ buyerProfileId, isAdmin: false, expiresAt })
    .returning({
      id: sessions.id,
      buyerProfileId: sessions.buyerProfileId,
      isAdmin: sessions.isAdmin,
      expiresAt: sessions.expiresAt,
    });
  if (!row) throw new Error('Failed to create buyer session');
  return row;
}

// Not wired into any route yet — the admin login endpoint itself is Phase 4
// work (see docs/FINCAVA_PLATFORM_HANDOVER.md admin-auth notes). This exists
// now so the session-validation middleware's fixed-vs-rolling behavior is
// testable ahead of that, per the Phase 2 exit-test requirement.
export async function createAdminSession(): Promise<SessionRow> {
  const db = getDb();
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_DURATION_MS);
  const [row] = await db
    .insert(sessions)
    .values({ buyerProfileId: null, isAdmin: true, expiresAt })
    .returning({
      id: sessions.id,
      buyerProfileId: sessions.buyerProfileId,
      isAdmin: sessions.isAdmin,
      expiresAt: sessions.expiresAt,
    });
  if (!row) throw new Error('Failed to create admin session');
  return row;
}

// Looks up a session by id, lazily purging it if expired. Buyer sessions
// are rolled forward on every valid lookup; admin sessions are left
// untouched (fixed expiry, no rolling extension).
export async function getValidSession(
  sessionId: string | undefined | null,
): Promise<SessionRow | null> {
  if (!sessionId) return null;
  const db = getDb();

  const [row] = await db
    .select({
      id: sessions.id,
      buyerProfileId: sessions.buyerProfileId,
      isAdmin: sessions.isAdmin,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!row) return null;

  if (row.expiresAt.getTime() <= Date.now()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  if (!row.isAdmin) {
    const newExpiresAt = new Date(Date.now() + BUYER_SESSION_DURATION_MS);
    await db.update(sessions).set({ expiresAt: newExpiresAt }).where(eq(sessions.id, row.id));
    row.expiresAt = newExpiresAt;
  }

  return row;
}

export async function destroySession(sessionId: string | undefined | null): Promise<void> {
  if (!sessionId) return;
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

// Opportunistic cleanup — called from the OTP request path per §4's "no
// cron jobs" rule. Deletes any session that has already expired, regardless
// of whose request triggered the sweep.
export async function purgeExpiredSessions(): Promise<void> {
  const db = getDb();
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}

export function setSessionCookie(res: Response, sessionId: string, expiresAt: Date): void {
  res.cookie(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    signed: true,
    expires: expiresAt,
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
}
