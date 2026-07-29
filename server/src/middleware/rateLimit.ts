import rateLimit from 'express-rate-limit';

// §9: 10/hour/IP, for the one endpoint on the site with no auth wall in
// front of it. Kept in its own bucket, separate from the buyer-authenticated
// forms below — otherwise an anonymous actor hammering this endpoint from an
// IP (shared office network, corporate NAT) could exhaust the same quota a
// legitimate signed-in buyer behind that IP needs for RFQ/sample/sourcing.
export const verificationRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions from this address. Please try again later.' },
});

// §9: 10/hour/IP, shared across the three buyer-authenticated forms
// (RFQ/sample/sourcing) — separate instance from verificationRateLimiter
// above so the two buckets never share a counter.
export const buyerFormRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many submissions from this address. Please try again later.' },
});

function normalizeEmailForRateLimit(req: { body?: unknown }): string {
  const body = req.body as { email?: unknown } | undefined;
  const email = typeof body?.email === 'string' ? body.email : '';
  return email.trim().toLowerCase();
}

// §4: max 3 OTP requests per email per 15 min. Keyed by the normalized
// email in the request body, independent of the per-IP limiter below.
export const otpEmailRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `otp-email:${normalizeEmailForRateLimit(req)}`,
  message: { error: 'Too many code requests for this email. Please try again later.' },
});

// §4: max 10 OTP requests per IP per 15 min (default IP-based keying).
export const otpIpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this address. Please try again later.' },
});
