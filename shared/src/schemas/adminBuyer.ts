import { z } from 'zod';

// Admin editing of a buyer profile is scoped to internalNotes per
// execution-spec §7 — buyer-editable fields already have their own path
// (buyer's own PATCH /api/me), so this stays narrow rather than duplicating it.
export const adminBuyerUpdateInputSchema = z
  .object({
    internalNotes: z
      .string()
      .trim()
      .max(4000)
      .nullish()
      .transform((v) => (v === undefined || v === '' ? null : v)),
  })
  .strict();

export type AdminBuyerUpdateInput = z.infer<typeof adminBuyerUpdateInputSchema>;
