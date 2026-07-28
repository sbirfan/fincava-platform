import type { NextFunction, Request, Response } from 'express';
import { SESSION_COOKIE_NAME, getValidSession, setSessionCookie } from '../lib/session.js';

// Runs on every request. Looks up the session cookie (if any), lazily
// purges it if expired, rolls a valid buyer session's expiry forward, and
// attaches the result to req.authSession for downstream routes/middleware.
export async function attachSession(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const sessionId = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  const session = await getValidSession(sessionId);
  req.authSession = session;

  if (session && !session.isAdmin) {
    setSessionCookie(_res, session.id, session.expiresAt);
  }

  next();
}
