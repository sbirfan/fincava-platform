import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { getDb } from '../db/index.js';
import { greenCoffeeLots } from '../db/schema.js';
import { isBuyerAuthenticated } from '../lib/authContext.js';
import { serializeLot } from '../lib/lotGating.js';
import { HttpError } from '../middleware/errorHandler.js';

export const lotsRouter = Router();

// Public list — visible=false lots (including hidden INVITE_ONLY ones) must
// never appear here, authenticated or not.
lotsRouter.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const rows = await db.select().from(greenCoffeeLots).where(eq(greenCoffeeLots.visible, true));
    const isAuthenticated = isBuyerAuthenticated(req);
    res.json(rows.map((lot) => serializeLot(lot, isAuthenticated)));
  } catch (err) {
    next(err);
  }
});

lotsRouter.get('/:lotCode', async (req, res, next) => {
  try {
    const db = getDb();
    const [lot] = await db
      .select()
      .from(greenCoffeeLots)
      .where(eq(greenCoffeeLots.lotCode, req.params.lotCode))
      .limit(1);

    if (!lot || !lot.visible) {
      throw new HttpError(404, 'Lot not found');
    }

    const isAuthenticated = isBuyerAuthenticated(req);
    res.json(serializeLot(lot, isAuthenticated));
  } catch (err) {
    next(err);
  }
});
