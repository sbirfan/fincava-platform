import { z } from 'zod';

// Auth-required, lot-linked (addressed by lotCode, same reasoning as
// rfq.ts), and only offered when the lot's sampleAvailable is true —
// enforced server-side, not just hidden client-side.
export const sampleRequestInputSchema = z
  .object({
    lotCode: z.string().trim().min(1).max(50),
    sampleDestination: z.string().trim().min(1).max(300),
    courierAccount: z.string().trim().max(200).optional(),
    evaluationTimeline: z.string().trim().max(200).optional(),
    message: z.string().trim().max(4000).optional(),
    website: z.string().max(500).optional(),
  })
  .strict();

export type SampleRequestInput = z.infer<typeof sampleRequestInputSchema>;
