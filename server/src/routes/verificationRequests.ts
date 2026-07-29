import { verificationRequestInputSchema } from '@fincava/shared';
import { Router } from 'express';
import { env } from '../env.js';
import { getDb } from '../db/index.js';
import { verificationRequests } from '../db/schema.js';
import {
  verificationFounderNotificationEmail,
  verificationRequesterConfirmationEmail,
} from '../email/templates/verification.js';
import { sendEmail } from '../email/send.js';
import { logger } from '../logger.js';
import { verificationRateLimiter } from '../middleware/rateLimit.js';

export const verificationRequestsRouter = Router();

function normalize(value: string | undefined): string | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

verificationRequestsRouter.post('/', verificationRateLimiter, async (req, res, next) => {
  try {
    const parsed = verificationRequestInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid submission' });
      return;
    }

    const input = parsed.data;

    // Honeypot: real visitors never see or fill this field (hidden via CSS
    // on the client). A non-empty value means a bot filled the form. Return
    // the same success shape a real submitter would get — never persist,
    // never email, and never reveal to the caller that anything was
    // different, so scrapers don't learn to detect and strip the field.
    if (input.website && input.website.trim() !== '') {
      logger.warn({ ip: req.ip }, 'verification request honeypot triggered — dropped silently');
      res.status(201).json({ status: 'received' });
      return;
    }

    const db = getDb();
    const [record] = await db
      .insert(verificationRequests)
      .values({
        requesterName: input.requesterName,
        requesterEmail: input.requesterEmail,
        requesterCompany: input.requesterCompany,
        requesterPhone: normalize(input.requesterPhone),
        country: normalize(input.country),
        farmOrLotOfInterest: normalize(input.farmOrLotOfInterest),
        regionOfInterest: normalize(input.regionOfInterest),
        message: normalize(input.message),
      })
      .returning({ id: verificationRequests.id });

    res.status(201).json({ status: 'received' });

    if (!record) {
      return;
    }

    // Fire after the DB commit, non-blocking — a Resend outage must never
    // fail the user's request (the response above has already been sent).
    void sendEmail(
      verificationRequesterConfirmationEmail({
        requesterEmail: input.requesterEmail,
        requesterName: input.requesterName,
      }),
    );

    if (env.FOUNDER_EMAIL) {
      void sendEmail(
        verificationFounderNotificationEmail({
          founderEmail: env.FOUNDER_EMAIL,
          requestId: record.id,
          requesterName: input.requesterName,
          requesterEmail: input.requesterEmail,
          requesterCompany: input.requesterCompany,
          farmOrLotOfInterest: normalize(input.farmOrLotOfInterest),
          regionOfInterest: normalize(input.regionOfInterest),
        }),
      );
    } else {
      logger.warn('FOUNDER_EMAIL not configured — skipping founder notification email');
    }
  } catch (err) {
    next(err);
  }
});
