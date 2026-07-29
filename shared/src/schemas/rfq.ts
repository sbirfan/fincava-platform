import { z } from 'zod';

// Auth-required, lot-linked — buyerProfileId comes from the session, not
// the body. Addressed by lotCode (not the internal lot id/UUID), matching
// every other lot-facing surface in the app — the public lot API never
// exposes the UUID. `website` is the same honeypot pattern used everywhere.
export const rfqInputSchema = z
  .object({
    lotCode: z.string().trim().min(1).max(50),
    requestedVolumeKg: z.number().positive(),
    destinationCountry: z.string().trim().min(1).max(100),
    preferredIncoterm: z.string().trim().max(50).optional(),
    requiredCertifications: z.array(z.string().trim().max(100)).max(20).optional(),
    targetDeliveryTimeline: z.string().trim().max(200).optional(),
    message: z.string().trim().max(4000).optional(),
    website: z.string().max(500).optional(),
  })
  .strict();

export type RfqInput = z.infer<typeof rfqInputSchema>;
