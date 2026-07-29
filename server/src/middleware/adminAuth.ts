import type { NextFunction, Request, Response } from 'express';
import { isAdminAuthenticated } from '../lib/authContext.js';

// Admin session gate — 404, not 401, so an unauthenticated caller can't
// even tell the /api/admin/* surface exists (execution-spec §4/§9). Applies
// uniformly to every admin route; there is no "just this one is public"
// exception on the admin surface.
export function requireAdminSession(req: Request, res: Response, next: NextFunction): void {
  if (!isAdminAuthenticated(req)) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  next();
}
