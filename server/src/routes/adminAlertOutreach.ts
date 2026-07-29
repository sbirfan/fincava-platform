import { alertOutreachFilterSchema } from '@fincava/shared';
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { getDb } from '../db/index.js';
import { buyerProfiles } from '../db/schema.js';
import { HttpError } from '../middleware/errorHandler.js';

export const adminAlertOutreachRouter = Router();

type BuyerRow = typeof buyerProfiles.$inferSelect;

// Every filter is optional and independently narrowing — an omitted
// criterion doesn't restrict the match. alertOptIn=true is always required
// (enforced by the caller's base query, not here).
function matchesFilter(
  buyer: BuyerRow,
  filter: ReturnType<typeof alertOutreachFilterSchema.parse>,
): boolean {
  if (
    filter.variety &&
    !buyer.preferredVarieties.some((v) => v.toLowerCase() === filter.variety!.toLowerCase())
  ) {
    return false;
  }
  if (
    filter.process &&
    !buyer.preferredProcesses.some((p) => p.toLowerCase() === filter.process!.toLowerCase())
  ) {
    return false;
  }
  if (
    filter.certification &&
    !buyer.certificationsNeeded.some((c) => c.toLowerCase() === filter.certification!.toLowerCase())
  ) {
    return false;
  }
  if (
    filter.region &&
    !buyer.targetOrigins.some((r) => r.toLowerCase() === filter.region!.toLowerCase())
  ) {
    return false;
  }
  if (filter.scoreMin !== undefined || filter.scoreMax !== undefined) {
    const buyerMin = buyer.preferredScoreMin !== null ? Number(buyer.preferredScoreMin) : null;
    const buyerMax = buyer.preferredScoreMax !== null ? Number(buyer.preferredScoreMax) : null;
    // No preference on file — treat as non-restrictive rather than excluding
    // the buyer outright (an unopinionated buyer still wants alerts).
    if (buyerMin !== null && filter.scoreMax !== undefined && buyerMin > filter.scoreMax)
      return false;
    if (buyerMax !== null && filter.scoreMin !== undefined && buyerMax < filter.scoreMin)
      return false;
  }
  return true;
}

async function getMatchingBuyers(
  query: unknown,
): Promise<{ filter: ReturnType<typeof alertOutreachFilterSchema.parse>; buyers: BuyerRow[] }> {
  const parsed = alertOutreachFilterSchema.safeParse(query);
  if (!parsed.success) {
    throw new HttpError(400, 'Invalid filter parameters');
  }
  const filter = parsed.data;

  const db = getDb();
  const optedIn = await db.select().from(buyerProfiles).where(eq(buyerProfiles.alertOptIn, true));
  const buyers = optedIn.filter((b) => matchesFilter(b, filter));
  return { filter, buyers };
}

// ---------------------------------------------------------------------------
// GET /api/admin/alert-outreach?variety=&process=&scoreMin=&scoreMax=&certification=&region=
// ---------------------------------------------------------------------------
adminAlertOutreachRouter.get('/', async (req, res, next) => {
  try {
    const { filter, buyers } = await getMatchingBuyers(req.query);
    res.json({
      filter,
      count: buyers.length,
      buyers: buyers.map((b) => ({
        id: b.id,
        email: b.email,
        name: b.name,
        company: b.company,
        buyerType: b.buyerType,
        country: b.country,
        preferredVarieties: b.preferredVarieties,
        preferredProcesses: b.preferredProcesses,
        preferredScoreMin: b.preferredScoreMin,
        preferredScoreMax: b.preferredScoreMax,
        targetOrigins: b.targetOrigins,
        certificationsNeeded: b.certificationsNeeded,
      })),
    });
  } catch (err) {
    next(err);
  }
});

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

// ---------------------------------------------------------------------------
// GET /api/admin/alert-outreach/export.csv?same filters as above
// Reuses the exact same matching function as the JSON listing above, so the
// export can never drift from what the filtered list shows.
// ---------------------------------------------------------------------------
adminAlertOutreachRouter.get('/export.csv', async (req, res, next) => {
  try {
    const { buyers } = await getMatchingBuyers(req.query);

    const header = [
      'email',
      'name',
      'company',
      'buyerType',
      'country',
      'preferredVarieties',
      'preferredProcesses',
      'targetOrigins',
      'certificationsNeeded',
    ];
    const lines = [header.join(',')];
    for (const b of buyers) {
      lines.push(
        [
          b.email,
          b.name ?? '',
          b.company ?? '',
          b.buyerType ?? '',
          b.country ?? '',
          b.preferredVarieties.join('; '),
          b.preferredProcesses.join('; '),
          b.targetOrigins.join('; '),
          b.certificationsNeeded.join('; '),
        ]
          .map((v) => csvEscape(String(v)))
          .join(','),
      );
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="alert-outreach.csv"');
    res.send(lines.join('\n'));
  } catch (err) {
    next(err);
  }
});
