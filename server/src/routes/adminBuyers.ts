import { adminBuyerUpdateInputSchema } from '@fincava/shared';
import { desc, eq } from 'drizzle-orm';
import { Router } from 'express';
import { getDb } from '../db/index.js';
import {
  buyerProfiles,
  greenCoffeeLots,
  rfqs,
  sampleRequests,
  sourcingRequests,
} from '../db/schema.js';
import { HttpError } from '../middleware/errorHandler.js';

export const adminBuyersRouter = Router();

// ---------------------------------------------------------------------------
// GET /api/admin/buyers
// ---------------------------------------------------------------------------
adminBuyersRouter.get('/', async (_req, res, next) => {
  try {
    const db = getDb();
    const rows = await db.select().from(buyerProfiles).orderBy(desc(buyerProfiles.createdAt));
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// GET /api/admin/buyers/:id
// Profile + request history across RFQ/sample/sourcing (the three types
// actually tied to a buyerProfileId). Verification requests are NOT
// included here — per the verification addendum's deliberate design they
// carry no buyerProfileId (public, unauthenticated by design), so there is
// no reliable FK to join on; matching by email would be an inference the
// addendum explicitly says not to build.
// ---------------------------------------------------------------------------
adminBuyersRouter.get('/:id', async (req, res, next) => {
  try {
    const db = getDb();
    const buyerId = req.params['id'] as string;

    const [buyer] = await db
      .select()
      .from(buyerProfiles)
      .where(eq(buyerProfiles.id, buyerId))
      .limit(1);
    if (!buyer) throw new HttpError(404, 'Buyer not found');

    const [rfqRows, sampleRows, sourcingRows] = await Promise.all([
      db
        .select({
          id: rfqs.id,
          lotCode: greenCoffeeLots.lotCode,
          lotTitle: greenCoffeeLots.title,
          requestedVolumeKg: rfqs.requestedVolumeKg,
          destinationCountry: rfqs.destinationCountry,
          status: rfqs.status,
          internalNotes: rfqs.internalNotes,
          createdAt: rfqs.createdAt,
        })
        .from(rfqs)
        .innerJoin(greenCoffeeLots, eq(rfqs.lotId, greenCoffeeLots.id))
        .where(eq(rfqs.buyerProfileId, buyerId))
        .orderBy(desc(rfqs.createdAt)),
      db
        .select({
          id: sampleRequests.id,
          lotCode: greenCoffeeLots.lotCode,
          lotTitle: greenCoffeeLots.title,
          sampleDestination: sampleRequests.sampleDestination,
          status: sampleRequests.status,
          internalNotes: sampleRequests.internalNotes,
          createdAt: sampleRequests.createdAt,
        })
        .from(sampleRequests)
        .innerJoin(greenCoffeeLots, eq(sampleRequests.lotId, greenCoffeeLots.id))
        .where(eq(sampleRequests.buyerProfileId, buyerId))
        .orderBy(desc(sampleRequests.createdAt)),
      db
        .select()
        .from(sourcingRequests)
        .where(eq(sourcingRequests.buyerProfileId, buyerId))
        .orderBy(desc(sourcingRequests.createdAt)),
    ]);

    res.json({
      ...buyer,
      rfqs: rfqRows,
      sampleRequests: sampleRows,
      sourcingRequests: sourcingRows,
    });
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/admin/buyers/:id
// ---------------------------------------------------------------------------
adminBuyersRouter.patch('/:id', async (req, res, next) => {
  try {
    const parsed = adminBuyerUpdateInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }

    const db = getDb();
    const buyerId = req.params['id'] as string;
    const [buyer] = await db
      .select({ id: buyerProfiles.id })
      .from(buyerProfiles)
      .where(eq(buyerProfiles.id, buyerId))
      .limit(1);
    if (!buyer) throw new HttpError(404, 'Buyer not found');

    const [updated] = await db
      .update(buyerProfiles)
      .set({ internalNotes: parsed.data.internalNotes, updatedAt: new Date() })
      .where(eq(buyerProfiles.id, buyerId))
      .returning();

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/buyers/:id
// Hard-deletes the buyer profile. FK onDelete: 'cascade' on rfqs,
// sampleRequests, sourcingRequests, and sessions (all reference
// buyerProfileId) means Postgres cascades the delete to all four — no
// manual multi-table delete needed. Verification requests are untouched:
// they carry no buyerProfileId per the addendum's deliberate design.
// ---------------------------------------------------------------------------
adminBuyersRouter.delete('/:id', async (req, res, next) => {
  try {
    const db = getDb();
    const buyerId = req.params['id'] as string;
    const [buyer] = await db
      .select({ id: buyerProfiles.id })
      .from(buyerProfiles)
      .where(eq(buyerProfiles.id, buyerId))
      .limit(1);
    if (!buyer) throw new HttpError(404, 'Buyer not found');

    await db.delete(buyerProfiles).where(eq(buyerProfiles.id, buyerId));
    res.json({ deleted: buyerId });
  } catch (err) {
    next(err);
  }
});
