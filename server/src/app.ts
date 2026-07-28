import path from 'node:path';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './env.js';
import { logger } from './logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { lotsRouter } from './routes/lots.js';
import { verificationRequestsRouter } from './routes/verificationRequests.js';

export function createApp(): Express {
  const app = express();

  // Replit (and most PaaS hosts) sit behind a reverse proxy — without this,
  // express-rate-limit sees the proxy's IP for every request (one shared
  // bucket for all users) and req.secure/cookie handling can't trust
  // X-Forwarded-* headers. `1` trusts exactly one hop, matching a single
  // reverse proxy in front of the app.
  if (env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(helmet());
  app.use(express.json());
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/lots', lotsRouter);
  app.use('/api/verification-requests', verificationRequestsRouter);

  // Remaining API routers (auth, buyers, rfqs/samples/sourcing, admin) mount
  // here as they land in later phases.

  if (env.NODE_ENV === 'production') {
    const clientDist = path.resolve(import.meta.dirname, '../../client/dist');
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        next();
        return;
      }
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}
