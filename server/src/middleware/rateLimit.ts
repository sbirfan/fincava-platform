import rateLimit from 'express-rate-limit';

// General public-form submission limit per execution-spec §9: 10/hour/IP.
// Applies to verification requests now (Phase 1) and to RFQ/sample/sourcing
// forms when Phase 3 adds them — same limiter, same rule everywhere.
export const formSubmissionRateLimiter = rateLimit({
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
