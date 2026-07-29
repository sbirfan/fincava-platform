import {
  marketIntelligenceCreateInputSchema,
  marketIntelligenceUpdateInputSchema,
} from '@fincava/shared';
import { desc, eq } from 'drizzle-orm';
import { Router } from 'express';
import { getDb } from '../db/index.js';
import { marketIntelligenceNotes, greenCoffeeLots } from '../db/schema.js';
import { HttpError } from '../middleware/errorHandler.js';

export const adminMarketIntelligenceRouter = Router();

function toDbValue(v: unknown): unknown {
  if (v === undefined) return undefined;
  if (v === null) return null;
  if (typeof v === 'number') return String(v);
  return v;
}

// ---------------------------------------------------------------------------
// GET /api/admin/market-intelligence?variety=&lotId=
// ---------------------------------------------------------------------------
adminMarketIntelligenceRouter.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const variety = req.query['variety'] as string | undefined;
    const lotId = req.query['lotId'] as string | undefined;

    let rows = await db
      .select()
      .from(marketIntelligenceNotes)
      .orderBy(desc(marketIntelligenceNotes.createdAt));

    if (variety) {
      rows = rows.filter((r) => r.variety?.toLowerCase() === variety.toLowerCase());
    }
    if (lotId) {
      rows = rows.filter((r) => r.lotId === lotId);
    }

    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// POST /api/admin/market-intelligence
// ---------------------------------------------------------------------------
adminMarketIntelligenceRouter.post('/', async (req, res, next) => {
  try {
    const parsed = marketIntelligenceCreateInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
      return;
    }
    const input = parsed.data;
    const db = getDb();

    if (input.lotId) {
      const [lot] = await db
        .select({ id: greenCoffeeLots.id })
        .from(greenCoffeeLots)
        .where(eq(greenCoffeeLots.id, input.lotId))
        .limit(1);
      if (!lot) throw new HttpError(400, 'lotId does not reference an existing lot');
    }

    const [created] = await db
      .insert(marketIntelligenceNotes)
      .values({
        lotId: input.lotId ?? null,
        variety: input.variety ?? null,
        process: input.process ?? null,
        targetMarkets: input.targetMarkets ?? null,
        demandTrend: input.demandTrend ?? null,
        estimatedRateLowPerKg: toDbValue(input.estimatedRateLowPerKg) as string | null,
        estimatedRateHighPerKg: toDbValue(input.estimatedRateHighPerKg) as string | null,
        currency: input.currency,
        comparableOfferings: input.comparableOfferings ?? null,
        suggestedBuyerCategories: input.suggestedBuyerCategories ?? null,
        pricingRecommendation: input.pricingRecommendation ?? null,
        researchSource: input.researchSource ?? null,
        researchDate: input.researchDate ? new Date(input.researchDate) : null,
        internalNotes: input.internalNotes ?? null,
      })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/admin/market-intelligence/:id
// ---------------------------------------------------------------------------
adminMarketIntelligenceRouter.patch('/:id', async (req, res, next) => {
  try {
    const parsed = marketIntelligenceUpdateInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
      return;
    }
    const input = parsed.data;
    const db = getDb();
    const id = req.params['id'] as string;

    const [existing] = await db
      .select({ id: marketIntelligenceNotes.id })
      .from(marketIntelligenceNotes)
      .where(eq(marketIntelligenceNotes.id, id))
      .limit(1);
    if (!existing) throw new HttpError(404, 'Market intelligence note not found');

    if (input.lotId) {
      const [lot] = await db
        .select({ id: greenCoffeeLots.id })
        .from(greenCoffeeLots)
        .where(eq(greenCoffeeLots.id, input.lotId))
        .limit(1);
      if (!lot) throw new HttpError(400, 'lotId does not reference an existing lot');
    }

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    for (const [key, value] of Object.entries(input)) {
      if (value === undefined) continue;
      if (key === 'researchDate') {
        patch[key] = value ? new Date(value as string) : null;
        continue;
      }
      patch[key] = toDbValue(value);
    }

    const [updated] = await db
      .update(marketIntelligenceNotes)
      .set(patch)
      .where(eq(marketIntelligenceNotes.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// DELETE /api/admin/market-intelligence/:id
// ---------------------------------------------------------------------------
adminMarketIntelligenceRouter.delete('/:id', async (req, res, next) => {
  try {
    const db = getDb();
    const id = req.params['id'] as string;
    const [existing] = await db
      .select({ id: marketIntelligenceNotes.id })
      .from(marketIntelligenceNotes)
      .where(eq(marketIntelligenceNotes.id, id))
      .limit(1);
    if (!existing) throw new HttpError(404, 'Market intelligence note not found');

    await db.delete(marketIntelligenceNotes).where(eq(marketIntelligenceNotes.id, id));
    res.json({ deleted: id });
  } catch (err) {
    next(err);
  }
});
