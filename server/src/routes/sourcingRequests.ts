import { sourcingRequestInputSchema } from '@fincava/shared';
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { getDb } from '../db/index.js';
import { buyerProfiles, sourcingRequests } from '../db/schema.js';
import { env } from '../env.js';
import {
  sourcingRequestBuyerConfirmationEmail,
  sourcingRequestFounderNotificationEmail,
} from '../email/templates/sourcingRequest.js';
import { sendEmail } from '../email/send.js';
import { logger } from '../logger.js';
import { currentBuyerProfileId } from '../lib/authContext.js';
import { HttpError } from '../middleware/errorHandler.js';
import { buyerFormRateLimiter } from '../middleware/rateLimit.js';
import { requireBuyerAuth } from '../middleware/requireBuyerAuth.js';

export const sourcingRequestsRouter = Router();

sourcingRequestsRouter.use(requireBuyerAuth);

sourcingRequestsRouter.post('/', buyerFormRateLimiter, async (req, res, next) => {
  try {
    const parsed = sourcingRequestInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }
    const input = parsed.data;

    if (input.website && input.website.trim() !== '') {
      logger.warn({ ip: req.ip }, 'sourcing request honeypot triggered — dropped silently');
      res.status(201).json({ status: 'received' });
      return;
    }

    const buyerProfileId = currentBuyerProfileId(req)!;
    const db = getDb();

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
      .insert(sourcingRequests)
      .values({
        buyerProfileId,
        intendedUse: input.intendedUse,
        varietyPreferences: input.varietyPreferences ?? [],
        processPreferences: input.processPreferences ?? [],
        minCupScore: input.minCupScore !== undefined ? String(input.minCupScore) : null,
        requestedVolumeKg: String(input.requestedVolumeKg),
        volumeFlexibility: input.volumeFlexibility,
        targetDeliveryWindow: input.targetDeliveryWindow,
        destinationCountry: input.destinationCountry,
        altitudePreference: input.altitudePreference ?? null,
        regionPreferences: input.regionPreferences ?? [],
        certificationsNeeded: input.certificationsNeeded ?? [],
        maxBudgetPerKg: input.maxBudgetPerKg !== undefined ? String(input.maxBudgetPerKg) : null,
        additionalNotes: input.additionalNotes ?? null,
      })
      .returning({ id: sourcingRequests.id });

    res.status(201).json({ status: 'received' });

    if (!record) return;

    void sendEmail(sourcingRequestBuyerConfirmationEmail({ buyerEmail: buyer.email }));

    if (env.FOUNDER_EMAIL) {
      void sendEmail(
        sourcingRequestFounderNotificationEmail({
          founderEmail: env.FOUNDER_EMAIL,
          requestId: record.id,
          buyerName: buyer.name,
          buyerCompany: buyer.company,
          buyerEmail: buyer.email,
          intendedUse: input.intendedUse,
          requestedVolumeKg: input.requestedVolumeKg,
          destinationCountry: input.destinationCountry,
          maxBudgetPerKg: input.maxBudgetPerKg ?? null,
          budgetCurrency: 'USD',
        }),
      );
    } else {
      logger.warn('FOUNDER_EMAIL not configured — skipping founder notification email');
    }
  } catch (err) {
    next(err);
  }
});
