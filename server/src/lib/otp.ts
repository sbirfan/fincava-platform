import crypto from 'node:crypto';
import { lt } from 'drizzle-orm';
import { getDb } from '../db/index.js';
import { otpCodes } from '../db/schema.js';
import { requireEnv } from '../env.js';

const OTP_LENGTH = 6;
export const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_MAX_ATTEMPTS = 5;

export function generateOtpCode(): string {
  // crypto.randomInt is uniform over [0, 1_000_000) — no modulo bias.
  return crypto
    .randomInt(0, 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, '0');
}

// HMAC-SHA256 keyed with OTP_HASH_SECRET — this is "sha256 with server
// secret" done the standard way (plain sha256(secret + data) is vulnerable
// to length-extension; HMAC is the construction actually designed for this).
// The email is bound into the MAC so a hash leaked for one address can't be
// replayed against another.
export function hashOtpCode(email: string, code: string): string {
  const secret = requireEnv('OTP_HASH_SECRET');
  return crypto.createHmac('sha256', secret).update(`${email}:${code}`).digest('hex');
}

// Constant-time comparison — same rationale as the admin password check in
// §9: response timing must not leak how close a guess was. Buffers are
// fixed-length (both always 64 hex chars for sha256), so comparing lengths
// first leaks nothing an attacker doesn't already know.
export function verifyOtpHash(email: string, candidateCode: string, storedHash: string): boolean {
  const candidateHash = hashOtpCode(email, candidateCode);
  const a = Buffer.from(candidateHash, 'hex');
  const b = Buffer.from(storedHash, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

// Opportunistic cleanup — called from the OTP request path per §4's "no
// cron jobs" rule. Deletes any otp_codes row past its expiry, regardless of
// whose request triggered the sweep.
export async function purgeExpiredOtpCodes(): Promise<void> {
  const db = getDb();
  await db.delete(otpCodes).where(lt(otpCodes.expiresAt, new Date()));
}
