import 'dotenv/config';
import { z } from 'zod';

// Every var here is documented in .env.example. Vars needed for features not
// yet wired up (DATABASE_URL, Resend, Cloudinary) are optional at the schema
// level so the server can boot during Phase 0 before those accounts exist —
// code that depends on them (db, email, uploads) fails loudly at the call
// site, not at process startup, until the feature phase that uses it lands.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(1).optional(),
  OTP_HASH_SECRET: z.string().min(1).optional(),
  ADMIN_PASSWORD: z.string().min(1).optional(),

  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  FOUNDER_EMAIL: z.string().min(1).optional(),

  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export function requireEnv<K extends keyof typeof env>(key: K): NonNullable<(typeof env)[K]> {
  const value = env[key];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value as NonNullable<(typeof env)[K]>;
}
