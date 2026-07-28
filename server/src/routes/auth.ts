import { otpRequestInputSchema, otpVerifyInputSchema } from '@fincava/shared';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { Router } from 'express';
import { getDb } from '../db/index.js';
import { buyerProfiles, otpCodes } from '../db/schema.js';
import { env } from '../env.js';
import { otpCodeEmail } from '../email/templates/otp.js';
import { sendEmail } from '../email/send.js';
import { logger } from '../logger.js';
import {
  OTP_EXPIRY_MS,
  OTP_MAX_ATTEMPTS,
  generateOtpCode,
  hashOtpCode,
  purgeExpiredOtpCodes,
  verifyOtpHash,
} from '../lib/otp.js';
import {
  SESSION_COOKIE_NAME,
  clearSessionCookie,
  createBuyerSession,
  destroySession,
  purgeExpiredSessions,
  setSessionCookie,
} from '../lib/session.js';
import { otpEmailRateLimiter, otpIpRateLimiter } from '../middleware/rateLimit.js';

export const authRouter = Router();

// One generic message for every verify failure mode (no code found,
// expired, exhausted attempts, wrong code) — an attacker shouldn't be able
// to distinguish "wrong code" from "too late" from "too many tries" by
// response text alone.
const GENERIC_VERIFY_ERROR = 'Invalid or expired code.';

authRouter.post('/otp/request', otpIpRateLimiter, otpEmailRateLimiter, async (req, res, next) => {
  try {
    const parsed = otpRequestInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }
    const input = parsed.data;

    // Honeypot: silently no-op, same pattern as the verification form.
    // Never reveal to the caller that anything was different.
    if (input.website && input.website.trim() !== '') {
      logger.warn({ ip: req.ip }, 'otp request honeypot triggered — dropped silently');
      res.json({ status: 'sent' });
      return;
    }

    await purgeExpiredOtpCodes();
    await purgeExpiredSessions();

    const db = getDb();
    const email = input.email;

    // One active code per email — a new request invalidates any prior
    // unconsumed code outright.
    await db.delete(otpCodes).where(and(eq(otpCodes.email, email), isNull(otpCodes.consumedAt)));

    const code = generateOtpCode();
    const codeHash = hashOtpCode(email, code);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await db.insert(otpCodes).values({ email, codeHash, expiresAt, attempts: 0 });

    // Non-blocking, same pattern as every other email in the app — a
    // Resend outage must not fail this request.
    void sendEmail(otpCodeEmail({ email, code }));

    // Dev-only convenience: the plaintext code only ever exists in this
    // function's memory (only the HMAC is persisted) — with no local
    // Resend credentials there is no other way to read it while testing.
    // Never logged in production.
    if (env.NODE_ENV !== 'production') {
      logger.debug({ email, code }, 'DEV ONLY: otp code (never logged in production)');
    }

    // Generic response regardless of whether this email already has a
    // buyer profile — never reveal registration status.
    res.json({ status: 'sent' });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/otp/verify', async (req, res, next) => {
  try {
    const parsed = otpVerifyInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }
    const { email, code } = parsed.data;

    const db = getDb();
    const [otpRow] = await db
      .select()
      .from(otpCodes)
      .where(and(eq(otpCodes.email, email), isNull(otpCodes.consumedAt)))
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    if (!otpRow) {
      res.status(400).json({ error: GENERIC_VERIFY_ERROR });
      return;
    }

    if (otpRow.expiresAt.getTime() <= Date.now()) {
      res.status(400).json({ error: GENERIC_VERIFY_ERROR });
      return;
    }

    if (otpRow.attempts >= OTP_MAX_ATTEMPTS) {
      // Already exhausted on a prior request — invalidate defensively.
      await db.update(otpCodes).set({ consumedAt: new Date() }).where(eq(otpCodes.id, otpRow.id));
      res.status(400).json({ error: GENERIC_VERIFY_ERROR });
      return;
    }

    const isMatch = verifyOtpHash(email, code, otpRow.codeHash);

    if (!isMatch) {
      const newAttempts = otpRow.attempts + 1;
      const exhausted = newAttempts >= OTP_MAX_ATTEMPTS;
      await db
        .update(otpCodes)
        .set({
          attempts: newAttempts,
          // 5th wrong attempt invalidates the code outright ("then
          // invalidated" per §4), not just incrementing toward a limit
          // checked next time.
          ...(exhausted ? { consumedAt: new Date() } : {}),
        })
        .where(eq(otpCodes.id, otpRow.id));
      res.status(400).json({ error: GENERIC_VERIFY_ERROR });
      return;
    }

    await db.update(otpCodes).set({ consumedAt: new Date() }).where(eq(otpCodes.id, otpRow.id));

    const [existingProfile] = await db
      .select({ id: buyerProfiles.id })
      .from(buyerProfiles)
      .where(eq(buyerProfiles.email, email))
      .limit(1);

    let buyerProfileId: string;
    let isNewProfile: boolean;
    const now = new Date();

    if (existingProfile) {
      buyerProfileId = existingProfile.id;
      isNewProfile = false;
      await db
        .update(buyerProfiles)
        .set({ emailVerifiedAt: now, lastLoginAt: now })
        .where(eq(buyerProfiles.id, buyerProfileId));
    } else {
      const [created] = await db
        .insert(buyerProfiles)
        .values({ email, emailVerifiedAt: now, lastLoginAt: now })
        .returning({ id: buyerProfiles.id });
      if (!created) throw new Error('Failed to create buyer profile');
      buyerProfileId = created.id;
      isNewProfile = true;
    }

    const session = await createBuyerSession(buyerProfileId);
    setSessionCookie(res, session.id, session.expiresAt);

    res.json({ isNewProfile });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/logout', async (req, res, next) => {
  try {
    const sessionId = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    await destroySession(sessionId);
    clearSessionCookie(res);
    res.json({ status: 'ok' });
  } catch (err) {
    next(err);
  }
});
