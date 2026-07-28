import type { Request } from 'express';

// A valid, non-admin session with a buyerProfileId attached. Requires
// middleware/attachSession.ts to have run first (mounted globally in
// app.ts) so req.authSession is populated.
export function isBuyerAuthenticated(req: Request): boolean {
  return !!req.authSession && !req.authSession.isAdmin && !!req.authSession.buyerProfileId;
}

export function currentBuyerProfileId(req: Request): string | null {
  return isBuyerAuthenticated(req) ? (req.authSession!.buyerProfileId as string) : null;
}
