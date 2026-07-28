import type { Request } from 'express';

// Phase 2 replaces this with a real session-cookie lookup against the
// `sessions` table. Until then, every request is anonymous — routes built
// in this phase call this so the switchover in Phase 2 touches one place.
export function isBuyerAuthenticated(_req: Request): boolean {
  return false;
}
