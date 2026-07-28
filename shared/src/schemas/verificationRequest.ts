import { z } from 'zod';

// Public, unauthenticated write endpoint — the only one on the site (see
// docs/FINCAVA_PLATFORM_ADDENDUM_VERIFICATION.md). `.strict()` rejects any
// field not listed here, same discipline as every other endpoint per
// execution-spec §9.
//
// `website` is a honeypot: a form field real visitors never see or fill
// (hidden via CSS on the client), but that spam bots often auto-fill. The
// server treats any non-empty value here as a bot submission and silently
// no-ops it rather than rejecting with an error that would help a bot learn.
export const verificationRequestInputSchema = z
  .object({
    requesterName: z.string().trim().min(1, 'Name is required').max(200),
    requesterEmail: z.string().trim().email('Enter a valid email').max(320),
    requesterCompany: z.string().trim().min(1, 'Company is required').max(200),
    requesterPhone: z.string().trim().max(50).optional(),
    country: z.string().trim().max(100).optional(),
    farmOrLotOfInterest: z.string().trim().max(300).optional(),
    regionOfInterest: z.string().trim().max(200).optional(),
    message: z.string().trim().max(4000).optional(),
    website: z.string().max(500).optional(),
  })
  .strict();

export type VerificationRequestInput = z.infer<typeof verificationRequestInputSchema>;
