import crypto from 'node:crypto';
import { adminLoginInputSchema } from '@fincava/shared';
import { Router } from 'express';
import { env } from '../env.js';
import {
  SESSION_COOKIE_NAME,
  clearSessionCookie,
  createAdminSession,
  destroySession,
  setSessionCookie,
} from '../lib/session.js';
import { adminLoginRateLimiter } from '../middleware/rateLimit.js';

export const adminAuthRouter = Router();

// Constant-time string comparison — same rationale as the OTP hash check in
// lib/otp.ts: response timing must not leak how much of a guess matched.
// Buffers of different lengths would make crypto.timingSafeEqual throw, so
// both are padded to a common length before comparing; the final length
// check happens after the constant-time byte comparison, not before it.
function timingSafeStringEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  const maxLen = Math.max(aBuf.length, bBuf.length, 1);
  const aPadded = Buffer.concat([aBuf, Buffer.alloc(maxLen - aBuf.length)]);
  const bPadded = Buffer.concat([bBuf, Buffer.alloc(maxLen - bBuf.length)]);
  const bytesEqual = crypto.timingSafeEqual(aPadded, bPadded);
  return bytesEqual && aBuf.length === bBuf.length;
}

adminAuthRouter.post('/login', adminLoginRateLimiter, async (req, res, next) => {
  try {
    const parsed = adminLoginInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    if (!env.ADMIN_PASSWORD) {
      res
        .status(503)
        .json({ error: 'Admin authentication is not configured (ADMIN_PASSWORD missing)' });
      return;
    }

    const isMatch = timingSafeStringEqual(parsed.data.password, env.ADMIN_PASSWORD);
    if (!isMatch) {
      res.status(401).json({ error: 'Incorrect password' });
      return;
    }

    const session = await createAdminSession();
    setSessionCookie(res, session.id, session.expiresAt);
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
});

adminAuthRouter.post('/logout', async (req, res, next) => {
  try {
    const sessionId = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    await destroySession(sessionId);
    clearSessionCookie(res);
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
});
