import type { NextFunction, Request, Response } from 'express';
import { env } from '../env.js';

// Simple single-password guard for founder-only admin routes.
// Expects:  Authorization: Bearer <ADMIN_PASSWORD>
// Returns 401 when the header is missing or wrong, 503 when ADMIN_PASSWORD
// is not configured (so the route is unreachable, not silently open).
export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  if (!env.ADMIN_PASSWORD) {
    res.status(503).json({ error: 'Admin authentication is not configured (ADMIN_PASSWORD missing)' });
    return;
  }

  const auth = req.headers.authorization ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

  if (!token || token !== env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  next();
}
