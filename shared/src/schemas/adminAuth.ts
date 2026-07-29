import { z } from 'zod';

export const adminLoginInputSchema = z
  .object({
    password: z.string().min(1, 'Password is required').max(500),
  })
  .strict();

export type AdminLoginInput = z.infer<typeof adminLoginInputSchema>;
