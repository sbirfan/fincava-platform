import type { NextFunction, Request, Response } from 'express';
import { env, requireEnv } from '../env.js';
import { HttpError } from './errorHandler.js';

// ── adminAuth ───────────────────────────────────────────────────────────────
// Direct-response variant used by routes/admin.ts (smoke-email).
// Sends JSON directly so callers don't need to catch a thrown error.
//
// Expects:  Authorization: Bearer <ADMIN_PASSWORD>
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

// ── requireAdmin ────────────────────────────────────────────────────────────
// HttpError-throwing variant used by routes/adminLots.ts (image uploads).
// Phase 4 replaces both with session-cookie admin auth — one swap point.
//
// Expects:  Authorization: Bearer <ADMIN_PASSWORD>
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Admin authentication required');
  }

  let adminPassword: string;
  try {
    adminPassword = requireEnv('ADMIN_PASSWORD');
  } catch {
    throw new HttpError(503, 'Admin authentication is not configured');
  }

  const token = authHeader.slice('Bearer '.length);
  if (token !== adminPassword) {
    throw new HttpError(401, 'Invalid admin credentials');
  }

  next();
}
