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
