import { z } from 'zod';
import { DELIVERY_WINDOW, INTENDED_USE, VOLUME_FLEXIBILITY } from '../enums.js';

const stringArray = (max: number) => z.array(z.string().trim().min(1).max(100)).max(max);

// Auth-required, standalone — NOT lot-linked. Per execution-spec §5 UX
// guidance: structured fields for what buyers always know, free-form
// additionalNotes for everything else. Deliberately excludes screenSize,
// moisture, waterActivity, and incoterm (QC/negotiation details evaluated
// after sourcing, not sourcing criteria) and has no file upload field.
export const sourcingRequestInputSchema = z
  .object({
    intendedUse: z.enum(INTENDED_USE),
    varietyPreferences: stringArray(50).optional(),
    processPreferences: stringArray(50).optional(),
    minCupScore: z.number().min(0).max(100).optional(),
    requestedVolumeKg: z.number().positive(),
    volumeFlexibility: z.enum(VOLUME_FLEXIBILITY),
    targetDeliveryWindow: z.enum(DELIVERY_WINDOW),
    destinationCountry: z.string().trim().min(1).max(100),
    altitudePreference: z.string().trim().max(200).optional(),
    regionPreferences: stringArray(50).optional(),
    certificationsNeeded: stringArray(50).optional(),
    // Optional by design — buyers hate giving a number first. Confidential:
    // visible to the submitting buyer and admin only, never to producers.
    maxBudgetPerKg: z.number().positive().optional(),
    additionalNotes: z.string().trim().max(4000).optional(),
    website: z.string().max(500).optional(),
  })
  .strict();

export type SourcingRequestInput = z.infer<typeof sourcingRequestInputSchema>;
