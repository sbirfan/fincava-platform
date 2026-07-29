import { sampleRequestInputSchema } from '@fincava/shared';
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { getDb } from '../db/index.js';
import { buyerProfiles, greenCoffeeLots, sampleRequests } from '../db/schema.js';
import { env } from '../env.js';
import {
  sampleRequestBuyerConfirmationEmail,
  sampleRequestFounderNotificationEmail,
} from '../email/templates/sampleRequest.js';
import { sendEmail } from '../email/send.js';
import { logger } from '../logger.js';
import { currentBuyerProfileId } from '../lib/authContext.js';
import { HttpError } from '../middleware/errorHandler.js';
import { formSubmissionRateLimiter } from '../middleware/rateLimit.js';
import { requireBuyerAuth } from '../middleware/requireBuyerAuth.js';

export const sampleRequestsRouter = Router();

sampleRequestsRouter.use(requireBuyerAuth);

sampleRequestsRouter.post('/', formSubmissionRateLimiter, async (req, res, next) => {
  try {
    const parsed = sampleRequestInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }
    const input = parsed.data;

    if (input.website && input.website.trim() !== '') {
      logger.warn({ ip: req.ip }, 'sample request honeypot triggered — dropped silently');
      res.status(201).json({ status: 'received' });
      return;
    }

    const buyerProfileId = currentBuyerProfileId(req)!;
    const db = getDb();

    const [lot] = await db
      .select({
        id: greenCoffeeLots.id,
        lotCode: greenCoffeeLots.lotCode,
        sampleAvailable: greenCoffeeLots.sampleAvailable,
      })
      .from(greenCoffeeLots)
      .where(eq(greenCoffeeLots.lotCode, input.lotCode))
      .limit(1);
    if (!lot) {
      throw new HttpError(404, 'Lot not found');
    }
    // Server-side enforcement, not just a hidden client-side button —
    // sample requests are only valid for lots that actually offer samples.
    if (!lot.sampleAvailable) {
      throw new HttpError(400, 'Samples are not available for this lot');
    }

    const [buyer] = await db
      .select({
        name: buyerProfiles.name,
        company: buyerProfiles.company,
        email: buyerProfiles.email,
      })
      .from(buyerProfiles)
      .where(eq(buyerProfiles.id, buyerProfileId))
      .limit(1);
    if (!buyer) {
      throw new HttpError(404, 'Buyer profile not found');
    }

    const [record] = await db
      .insert(sampleRequests)
      .values({
        buyerProfileId,
        lotId: lot.id,
        sampleDestination: input.sampleDestination,
        courierAccount: input.courierAccount ?? null,
        evaluationTimeline: input.evaluationTimeline ?? null,
        message: input.message ?? null,
      })
      .returning({ id: sampleRequests.id });

    res.status(201).json({ status: 'received' });

    if (!record) return;

    void sendEmail(
      sampleRequestBuyerConfirmationEmail({ buyerEmail: buyer.email, lotCode: lot.lotCode }),
    );

    if (env.FOUNDER_EMAIL) {
      void sendEmail(
        sampleRequestFounderNotificationEmail({
          founderEmail: env.FOUNDER_EMAIL,
          requestId: record.id,
          buyerName: buyer.name,
          buyerCompany: buyer.company,
          buyerEmail: buyer.email,
          lotCode: lot.lotCode,
          sampleDestination: input.sampleDestination,
        }),
      );
    } else {
      logger.warn('FOUNDER_EMAIL not configured — skipping founder notification email');
    }
  } catch (err) {
    next(err);
  }
});
