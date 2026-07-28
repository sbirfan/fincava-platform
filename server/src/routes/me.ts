import { buyerProfileUpdateSchema } from '@fincava/shared';
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { getDb } from '../db/index.js';
import { buyerProfiles } from '../db/schema.js';
import { currentBuyerProfileId } from '../lib/authContext.js';
import { HttpError } from '../middleware/errorHandler.js';
import { requireBuyerAuth } from '../middleware/requireBuyerAuth.js';

export const meRouter = Router();

meRouter.use(requireBuyerAuth);

// Fields a buyer may see about their own profile. internalNotes is
// admin-only and never included here, authenticated or not.
const SAFE_COLUMNS = {
  id: buyerProfiles.id,
  email: buyerProfiles.email,
  emailVerifiedAt: buyerProfiles.emailVerifiedAt,
  name: buyerProfiles.name,
  company: buyerProfiles.company,
  phone: buyerProfiles.phone,
  country: buyerProfiles.country,
  buyerType: buyerProfiles.buyerType,
  website: buyerProfiles.website,
  preferredContactMethod: buyerProfiles.preferredContactMethod,
  preferredVarieties: buyerProfiles.preferredVarieties,
  preferredProcesses: buyerProfiles.preferredProcesses,
  preferredScoreMin: buyerProfiles.preferredScoreMin,
  preferredScoreMax: buyerProfiles.preferredScoreMax,
  preferredVolumeMinKg: buyerProfiles.preferredVolumeMinKg,
  preferredVolumeMaxKg: buyerProfiles.preferredVolumeMaxKg,
  targetOrigins: buyerProfiles.targetOrigins,
  certificationsNeeded: buyerProfiles.certificationsNeeded,
  destinationCountries: buyerProfiles.destinationCountries,
  alertOptIn: buyerProfiles.alertOptIn,
  alertCompetitionLots: buyerProfiles.alertCompetitionLots,
  marketingOptIn: buyerProfiles.marketingOptIn,
  consentTimestamp: buyerProfiles.consentTimestamp,
  lastLoginAt: buyerProfiles.lastLoginAt,
  createdAt: buyerProfiles.createdAt,
} as const;

const OPT_IN_FIELDS = ['alertOptIn', 'alertCompetitionLots', 'marketingOptIn'] as const;

meRouter.get('/', async (req, res, next) => {
  try {
    const buyerProfileId = currentBuyerProfileId(req);
    const db = getDb();
    const [profile] = await db
      .select(SAFE_COLUMNS)
      .from(buyerProfiles)
      .where(eq(buyerProfiles.id, buyerProfileId!))
      .limit(1);

    if (!profile) throw new HttpError(404, 'Profile not found');
    res.json(profile);
  } catch (err) {
    next(err);
  }
});

meRouter.patch('/', async (req, res, next) => {
  try {
    const parsed = buyerProfileUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request' });
      return;
    }
    const input = parsed.data;
    const buyerProfileId = currentBuyerProfileId(req);
    const db = getDb();

    const [current] = await db
      .select({
        alertOptIn: buyerProfiles.alertOptIn,
        alertCompetitionLots: buyerProfiles.alertCompetitionLots,
        marketingOptIn: buyerProfiles.marketingOptIn,
      })
      .from(buyerProfiles)
      .where(eq(buyerProfiles.id, buyerProfileId!))
      .limit(1);

    if (!current) throw new HttpError(404, 'Profile not found');

    // consentTimestamp is set whenever any opt-in toggle actually changes
    // value — not on every PATCH, only when consent state moves.
    const optInChanged = OPT_IN_FIELDS.some(
      (field) => field in input && input[field] !== current[field],
    );

    const updateValues: Record<string, unknown> = { ...input };
    if (optInChanged) {
      updateValues.consentTimestamp = new Date();
    }

    await db.update(buyerProfiles).set(updateValues).where(eq(buyerProfiles.id, buyerProfileId!));

    const [updated] = await db
      .select(SAFE_COLUMNS)
      .from(buyerProfiles)
      .where(eq(buyerProfiles.id, buyerProfileId!))
      .limit(1);

    res.json(updated);
  } catch (err) {
    next(err);
  }
});
