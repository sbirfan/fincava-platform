import { z } from 'zod';

// `website` is a honeypot — same pattern as the verification form (see
// schemas/verificationRequest.ts). Real users never see or fill it.
export const otpRequestInputSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Enter a valid email').max(320),
    website: z.string().max(500).optional(),
  })
  .strict();

export type OtpRequestInput = z.infer<typeof otpRequestInputSchema>;

export const otpVerifyInputSchema = z
  .object({
    email: z.string().trim().toLowerCase().email('Enter a valid email').max(320),
    code: z
      .string()
      .trim()
      .regex(/^\d{6}$/, 'Enter the 6-digit code'),
  })
  .strict();

export type OtpVerifyInput = z.infer<typeof otpVerifyInputSchema>;
