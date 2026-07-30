import type { NextFunction, Request, Response } from 'express';
import { logger } from '../logger.js';

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// Centralized error handler — must be registered last. Never sends stack
// traces or raw error messages from unexpected (non-HttpError) failures to
// the client; those are logged server-side only.
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    logger.warn({ err, path: req.path, status: err.status }, 'request failed');
    res.status(err.status).json({ error: err.message });
    return;
  }

  logger.error({ err, path: req.path }, 'unhandled error');
  res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: 'Not found' });
}
