import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Resolve .env relative to this file rather than process.cwd() — npm sets
// cwd to the workspace directory for `--workspace server` scripts (e.g.
// `npm run seed --workspace server`), which would otherwise miss the .env
// that lives at the repo root.
dotenv.config({ path: path.resolve(import.meta.dirname, '../../.env') });

// .env.example lists every var with a blank value ("KEY="), which dotenv
// loads as an empty string, not undefined — so optional vars need to treat
// "" the same as unset.
const optionalString = () =>
  z.preprocess((val) => (val === '' ? undefined : val), z.string().min(1).optional());

// Every var here is documented in .env.example. Vars needed for features not
// yet wired up (Resend, Cloudinary, admin password) are optional at the
// schema level so the server can boot before those accounts exist — code
// that depends on them (email, uploads, admin auth) fails loudly at the call
// site, not at process startup, until the feature phase that uses it lands.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(5000),

  DATABASE_URL: optionalString(),
  SESSION_SECRET: optionalString(),
  OTP_HASH_SECRET: optionalString(),
  ADMIN_PASSWORD: optionalString(),

  RESEND_API_KEY: optionalString(),
  EMAIL_FROM: optionalString(),
  FOUNDER_EMAIL: optionalString(),

  CLOUDINARY_CLOUD_NAME: optionalString(),
  CLOUDINARY_API_KEY: optionalString(),
  CLOUDINARY_API_SECRET: optionalString(),
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
