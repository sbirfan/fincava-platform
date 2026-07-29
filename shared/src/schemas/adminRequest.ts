import { z } from 'zod';
import { REQUEST_STATUS, SOURCING_STATUS, VERIFICATION_STATUS } from '../enums.js';

const internalNotes = () =>
  z
    .string()
    .trim()
    .max(4000)
    .nullish()
    .transform((v) => (v === undefined || v === '' ? null : v));

// RFQs and sample requests share request_status — same update shape for both.
export const adminRequestStatusUpdateInputSchema = z
  .object({
    status: z.enum(REQUEST_STATUS).optional(),
    internalNotes: internalNotes(),
  })
  .strict();
export type AdminRequestStatusUpdateInput = z.infer<typeof adminRequestStatusUpdateInputSchema>;

export const adminSourcingRequestUpdateInputSchema = z
  .object({
    status: z.enum(SOURCING_STATUS).optional(),
    internalNotes: internalNotes(),
    // Explicit null clears the link; undefined leaves it untouched.
    matchedLotId: z.string().uuid().nullish(),
  })
  .strict();
export type AdminSourcingRequestUpdateInput = z.infer<typeof adminSourcingRequestUpdateInputSchema>;

export const adminVerificationRequestUpdateInputSchema = z
  .object({
    status: z.enum(VERIFICATION_STATUS).optional(),
    internalNotes: internalNotes(),
    linkedLotId: z.string().uuid().nullish(),
  })
  .strict();
export type AdminVerificationRequestUpdateInput = z.infer<
  typeof adminVerificationRequestUpdateInputSchema
>;
