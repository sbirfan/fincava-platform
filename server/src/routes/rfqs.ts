import { rfqInputSchema } from '@fincava/shared';
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { getDb } from '../db/index.js';
import { buyerProfiles, greenCoffeeLots, rfqs } from '../db/schema.js';
import { env } from '../env.js';
import { rfqBuyerConfirmationEmail, rfqFounderNotificationEmail } from '../email/templates/rfq.js';
import { sendEmail } from '../email/send.js';
import { logger } from '../logger.js';
import { currentBuyerProfileId } from '../lib/authContext.js';
import { HttpError } from '../middleware/errorHandler.js';
import { buyerFormRateLimiter } from '../middleware/rateLimit.js';
import { requireBuyerAuth } from '../middleware/requireBuyerAuth.js';

export const rfqsRouter = Router();

rfqsRouter.use(requireBuyerAuth);

rfqsRouter.post('/', buyerFormRateLimiter, async (req, res, next) => {
  try {
    const parsed = rfqInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }
    const input = parsed.data;

    // Honeypot — silent no-op, same pattern as every other public form.
    if (input.website && input.website.trim() !== '') {
      logger.warn({ ip: req.ip }, 'rfq honeypot triggered — dropped silently');
      res.status(201).json({ status: 'received' });
      return;
    }

    const buyerProfileId = currentBuyerProfileId(req)!;
    const db = getDb();

    const [lot] = await db
      .select({ id: greenCoffeeLots.id, lotCode: greenCoffeeLots.lotCode })
      .from(greenCoffeeLots)
      .where(eq(greenCoffeeLots.lotCode, input.lotCode))
      .limit(1);
    if (!lot) {
      throw new HttpError(404, 'Lot not found');
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
      .insert(rfqs)
      .values({
        buyerProfileId,
        lotId: lot.id,
        requestedVolumeKg: String(input.requestedVolumeKg),
        destinationCountry: input.destinationCountry,
        preferredIncoterm: input.preferredIncoterm ?? null,
        requiredCertifications: input.requiredCertifications ?? [],
        targetDeliveryTimeline: input.targetDeliveryTimeline ?? null,
        message: input.message ?? null,
      })
      .returning({ id: rfqs.id });

    res.status(201).json({ status: 'received' });

    if (!record) return;

    void sendEmail(rfqBuyerConfirmationEmail({ buyerEmail: buyer.email, lotCode: lot.lotCode }));

    if (env.FOUNDER_EMAIL) {
      void sendEmail(
        rfqFounderNotificationEmail({
          founderEmail: env.FOUNDER_EMAIL,
          requestId: record.id,
          buyerName: buyer.name,
          buyerCompany: buyer.company,
          buyerEmail: buyer.email,
          lotCode: lot.lotCode,
          requestedVolumeKg: input.requestedVolumeKg,
          destinationCountry: input.destinationCountry,
        }),
      );
    } else {
      logger.warn('FOUNDER_EMAIL not configured — skipping founder notification email');
    }
  } catch (err) {
    next(err);
  }
});
