import { z } from 'zod';
import { BUYER_TYPE, CONTACT_METHOD } from '../enums.js';

const shortString = (max: number) => z.string().trim().min(1).max(max);
const stringArray = (max: number) => z.array(z.string().trim().min(1).max(100)).max(max);

// Partial update — every field optional so PATCH /api/me can send just the
// fields that changed. `.strict()` still rejects any field not listed here.
export const buyerProfileUpdateSchema = z
  .object({
    name: shortString(200).optional(),
    company: shortString(200).optional(),
    phone: z.string().trim().max(50).optional(),
    country: z.string().trim().max(100).optional(),
    buyerType: z.enum(BUYER_TYPE).optional(),
    website: z.string().trim().max(300).optional(),
    preferredContactMethod: z.enum(CONTACT_METHOD).optional(),
    preferredVarieties: stringArray(50).optional(),
    preferredProcesses: stringArray(50).optional(),
    preferredScoreMin: z.number().min(0).max(100).optional(),
    preferredScoreMax: z.number().min(0).max(100).optional(),
    preferredVolumeMinKg: z.number().min(0).optional(),
    preferredVolumeMaxKg: z.number().min(0).optional(),
    targetOrigins: stringArray(50).optional(),
    certificationsNeeded: stringArray(50).optional(),
    destinationCountries: stringArray(50).optional(),
    alertOptIn: z.boolean().optional(),
    alertCompetitionLots: z.boolean().optional(),
    marketingOptIn: z.boolean().optional(),
  })
  .strict();

export type BuyerProfileUpdateInput = z.infer<typeof buyerProfileUpdateSchema>;
