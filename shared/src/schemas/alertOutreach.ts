import { z } from 'zod';

// Query-param filter for the alert-outreach matching list. Every field is
// optional — an omitted filter doesn't restrict results. alertOptIn=true is
// always required server-side regardless of what's passed here.
export const alertOutreachFilterSchema = z
  .object({
    variety: z.string().trim().min(1).max(100).optional(),
    process: z.string().trim().min(1).max(100).optional(),
    scoreMin: z.coerce.number().min(0).max(100).optional(),
    scoreMax: z.coerce.number().min(0).max(100).optional(),
    certification: z.string().trim().min(1).max(100).optional(),
    region: z.string().trim().min(1).max(100).optional(),
  })
  .strict();

export type AlertOutreachFilter = z.infer<typeof alertOutreachFilterSchema>;
