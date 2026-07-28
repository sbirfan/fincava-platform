import type { NextFunction, Request, Response } from 'express';
import { isBuyerAuthenticated } from '../lib/authContext.js';
import { HttpError } from './errorHandler.js';

// Buyer-facing auth gate — plain 401, unlike admin routes' 404. There's no
// "don't advertise the surface" requirement for buyer endpoints; only the
// admin surface needs that per spec §4.
export function requireBuyerAuth(req: Request, _res: Response, next: NextFunction): void {
  if (!isBuyerAuthenticated(req)) {
    throw new HttpError(401, 'Sign in required');
  }
  next();
}
