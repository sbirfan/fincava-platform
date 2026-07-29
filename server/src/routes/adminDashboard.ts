import { count, gte } from 'drizzle-orm';
import { Router } from 'express';
import { getDb } from '../db/index.js';
import {
  buyerProfiles,
  greenCoffeeLots,
  rfqs,
  sampleRequests,
  sourcingRequests,
  verificationRequests,
} from '../db/schema.js';

export const adminDashboardRouter = Router();

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

adminDashboardRouter.get('/', async (_req, res, next) => {
  try {
    const db = getDb();
    const since = new Date(Date.now() - SEVEN_DAYS_MS);

    const [
      [newRfqs],
      [newSampleRequests],
      [newSourcingRequests],
      [newVerificationRequests],
      [newRegistrations],
      lotsByStatus,
    ] = await Promise.all([
      db.select({ count: count() }).from(rfqs).where(gte(rfqs.createdAt, since)),
      db
        .select({ count: count() })
        .from(sampleRequests)
        .where(gte(sampleRequests.createdAt, since)),
      db
        .select({ count: count() })
        .from(sourcingRequests)
        .where(gte(sourcingRequests.createdAt, since)),
      db
        .select({ count: count() })
        .from(verificationRequests)
        .where(gte(verificationRequests.createdAt, since)),
      db.select({ count: count() }).from(buyerProfiles).where(gte(buyerProfiles.createdAt, since)),
      db
        .select({ status: greenCoffeeLots.status, count: count() })
        .from(greenCoffeeLots)
        .groupBy(greenCoffeeLots.status),
    ]);

    res.json({
      windowDays: 7,
      newRfqs: newRfqs?.count ?? 0,
      newSampleRequests: newSampleRequests?.count ?? 0,
      newSourcingRequests: newSourcingRequests?.count ?? 0,
      newVerificationRequests: newVerificationRequests?.count ?? 0,
      newRegistrations: newRegistrations?.count ?? 0,
      lotsByStatus: lotsByStatus.map((row) => ({ status: row.status, count: row.count })),
    });
  } catch (err) {
    next(err);
  }
});
