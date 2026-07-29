import {
  adminRequestStatusUpdateInputSchema,
  adminSourcingRequestUpdateInputSchema,
  adminVerificationRequestUpdateInputSchema,
} from '@fincava/shared';
import { desc, eq } from 'drizzle-orm';
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
import { HttpError } from '../middleware/errorHandler.js';

export const adminRequestsRouter = Router();

const REQUEST_TYPES = ['rfq', 'sample', 'sourcing', 'verification'] as const;
type RequestType = (typeof REQUEST_TYPES)[number];

function isRequestType(value: unknown): value is RequestType {
  return typeof value === 'string' && (REQUEST_TYPES as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// GET /api/admin/requests?type=rfq|sample|sourcing|verification
// Unified queue — one endpoint, four tabs on the client. RFQ/sample use
// request_status; sourcing uses sourcing_status; verification uses
// verification_status (each table's own `status` column already carries
// the right enum type — no cross-type validation needed here).
// ---------------------------------------------------------------------------
adminRequestsRouter.get('/', async (req, res, next) => {
  try {
    const type = req.query['type'];
    if (!isRequestType(type)) {
      throw new HttpError(400, `type must be one of: ${REQUEST_TYPES.join(', ')}`);
    }

    const db = getDb();

    if (type === 'rfq') {
      const rows = await db
        .select({
          id: rfqs.id,
          buyerProfileId: rfqs.buyerProfileId,
          buyerName: buyerProfiles.name,
          buyerCompany: buyerProfiles.company,
          buyerEmail: buyerProfiles.email,
          lotCode: greenCoffeeLots.lotCode,
          lotTitle: greenCoffeeLots.title,
          requestedVolumeKg: rfqs.requestedVolumeKg,
          destinationCountry: rfqs.destinationCountry,
          preferredIncoterm: rfqs.preferredIncoterm,
          requiredCertifications: rfqs.requiredCertifications,
          targetDeliveryTimeline: rfqs.targetDeliveryTimeline,
          message: rfqs.message,
          status: rfqs.status,
          internalNotes: rfqs.internalNotes,
          createdAt: rfqs.createdAt,
        })
        .from(rfqs)
        .innerJoin(buyerProfiles, eq(rfqs.buyerProfileId, buyerProfiles.id))
        .innerJoin(greenCoffeeLots, eq(rfqs.lotId, greenCoffeeLots.id))
        .orderBy(desc(rfqs.createdAt));
      res.json(rows);
      return;
    }

    if (type === 'sample') {
      const rows = await db
        .select({
          id: sampleRequests.id,
          buyerProfileId: sampleRequests.buyerProfileId,
          buyerName: buyerProfiles.name,
          buyerCompany: buyerProfiles.company,
          buyerEmail: buyerProfiles.email,
          lotCode: greenCoffeeLots.lotCode,
          lotTitle: greenCoffeeLots.title,
          sampleDestination: sampleRequests.sampleDestination,
          courierAccount: sampleRequests.courierAccount,
          evaluationTimeline: sampleRequests.evaluationTimeline,
          message: sampleRequests.message,
          status: sampleRequests.status,
          internalNotes: sampleRequests.internalNotes,
          createdAt: sampleRequests.createdAt,
        })
        .from(sampleRequests)
        .innerJoin(buyerProfiles, eq(sampleRequests.buyerProfileId, buyerProfiles.id))
        .innerJoin(greenCoffeeLots, eq(sampleRequests.lotId, greenCoffeeLots.id))
        .orderBy(desc(sampleRequests.createdAt));
      res.json(rows);
      return;
    }

    if (type === 'sourcing') {
      const rows = await db
        .select({
          id: sourcingRequests.id,
          buyerProfileId: sourcingRequests.buyerProfileId,
          buyerName: buyerProfiles.name,
          buyerCompany: buyerProfiles.company,
          buyerEmail: buyerProfiles.email,
          intendedUse: sourcingRequests.intendedUse,
          varietyPreferences: sourcingRequests.varietyPreferences,
          processPreferences: sourcingRequests.processPreferences,
          minCupScore: sourcingRequests.minCupScore,
          requestedVolumeKg: sourcingRequests.requestedVolumeKg,
          volumeFlexibility: sourcingRequests.volumeFlexibility,
          targetDeliveryWindow: sourcingRequests.targetDeliveryWindow,
          destinationCountry: sourcingRequests.destinationCountry,
          altitudePreference: sourcingRequests.altitudePreference,
          regionPreferences: sourcingRequests.regionPreferences,
          certificationsNeeded: sourcingRequests.certificationsNeeded,
          maxBudgetPerKg: sourcingRequests.maxBudgetPerKg,
          budgetCurrency: sourcingRequests.budgetCurrency,
          additionalNotes: sourcingRequests.additionalNotes,
          status: sourcingRequests.status,
          matchedLotId: sourcingRequests.matchedLotId,
          internalNotes: sourcingRequests.internalNotes,
          createdAt: sourcingRequests.createdAt,
        })
        .from(sourcingRequests)
        .innerJoin(buyerProfiles, eq(sourcingRequests.buyerProfileId, buyerProfiles.id))
        .orderBy(desc(sourcingRequests.createdAt));
      res.json(rows);
      return;
    }

    // verification — public/unauthenticated, no buyerProfileId join possible.
    const rows = await db
      .select()
      .from(verificationRequests)
      .orderBy(desc(verificationRequests.createdAt));
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ---------------------------------------------------------------------------
// PATCH /api/admin/requests/:type/:id
// ---------------------------------------------------------------------------
adminRequestsRouter.patch('/:type/:id', async (req, res, next) => {
  try {
    const { type, id } = req.params;
    if (!isRequestType(type)) {
      throw new HttpError(400, `type must be one of: ${REQUEST_TYPES.join(', ')}`);
    }

    const db = getDb();

    if (type === 'rfq' || type === 'sample') {
      const parsed = adminRequestStatusUpdateInputSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request' });
        return;
      }
      const table = type === 'rfq' ? rfqs : sampleRequests;
      const [existing] = await db
        .select({ id: table.id })
        .from(table)
        .where(eq(table.id, id as string))
        .limit(1);
      if (!existing) throw new HttpError(404, 'Request not found');

      const patch: Record<string, unknown> = { updatedAt: new Date() };
      if (parsed.data.status !== undefined) patch['status'] = parsed.data.status;
      if (parsed.data.internalNotes !== undefined)
        patch['internalNotes'] = parsed.data.internalNotes;

      const [updated] = await db
        .update(table)
        .set(patch)
        .where(eq(table.id, id as string))
        .returning();
      res.json(updated);
      return;
    }

    if (type === 'sourcing') {
      const parsed = adminSourcingRequestUpdateInputSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid request' });
        return;
      }
      const [existing] = await db
        .select({ id: sourcingRequests.id })
        .from(sourcingRequests)
        .where(eq(sourcingRequests.id, id as string))
        .limit(1);
      if (!existing) throw new HttpError(404, 'Request not found');

      if (parsed.data.matchedLotId) {
        const [lot] = await db
          .select({ id: greenCoffeeLots.id })
          .from(greenCoffeeLots)
          .where(eq(greenCoffeeLots.id, parsed.data.matchedLotId))
          .limit(1);
        if (!lot) throw new HttpError(400, 'matchedLotId does not reference an existing lot');
      }

      const patch: Record<string, unknown> = { updatedAt: new Date() };
      if (parsed.data.status !== undefined) patch['status'] = parsed.data.status;
      if (parsed.data.internalNotes !== undefined)
        patch['internalNotes'] = parsed.data.internalNotes;
      if (parsed.data.matchedLotId !== undefined) patch['matchedLotId'] = parsed.data.matchedLotId;

      const [updated] = await db
        .update(sourcingRequests)
        .set(patch)
        .where(eq(sourcingRequests.id, id as string))
        .returning();
      res.json(updated);
      return;
    }

    // verification
    const parsed = adminVerificationRequestUpdateInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }
    const [existing] = await db
      .select({ id: verificationRequests.id })
      .from(verificationRequests)
      .where(eq(verificationRequests.id, id as string))
      .limit(1);
    if (!existing) throw new HttpError(404, 'Request not found');

    if (parsed.data.linkedLotId) {
      const [lot] = await db
        .select({ id: greenCoffeeLots.id })
        .from(greenCoffeeLots)
        .where(eq(greenCoffeeLots.id, parsed.data.linkedLotId))
        .limit(1);
      if (!lot) throw new HttpError(400, 'linkedLotId does not reference an existing lot');
    }

    const patch: Record<string, unknown> = { updatedAt: new Date() };
    if (parsed.data.status !== undefined) patch['status'] = parsed.data.status;
    if (parsed.data.internalNotes !== undefined) patch['internalNotes'] = parsed.data.internalNotes;
    if (parsed.data.linkedLotId !== undefined) patch['linkedLotId'] = parsed.data.linkedLotId;
    if (parsed.data.status === 'REPORT_DELIVERED') patch['reportDeliveredAt'] = new Date();

    const [updated] = await db
      .update(verificationRequests)
      .set(patch)
      .where(eq(verificationRequests.id, id as string))
      .returning();
    res.json(updated);
  } catch (err) {
    next(err);
  }
});
