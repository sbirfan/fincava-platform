import path from 'node:path';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './env.js';
import { logger } from './logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requireAdmin } from './middleware/adminAuth.js';
import { attachSession } from './middleware/attachSession.js';
import { adminRouter } from './routes/admin.js';
import { adminLotsRouter } from './routes/adminLots.js';
import { authRouter } from './routes/auth.js';
import { lotsRouter } from './routes/lots.js';
import { meRouter } from './routes/me.js';
import { rfqsRouter } from './routes/rfqs.js';
import { sampleRequestsRouter } from './routes/sampleRequests.js';
import { sourcingRequestsRouter } from './routes/sourcingRequests.js';
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
  app.use(attachSession);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/me', meRouter);
  app.use('/api/lots', lotsRouter);
  app.use('/api/rfqs', rfqsRouter);
  app.use('/api/sample-requests', sampleRequestsRouter);
  app.use('/api/sourcing-requests', sourcingRequestsRouter);
  app.use('/api/verification-requests', verificationRequestsRouter);
  // Mount /api/admin/lots before /api/admin so the more-specific prefix wins.
  // adminLotsRouter handles image CRUD; adminRouter handles smoke-email etc.
  app.use('/api/admin/lots', requireAdmin, adminLotsRouter);
  app.use('/api/admin', adminRouter);

  // Full admin (session-cookie auth, market intelligence, alert outreach)
  // mounts here in Phase 4.

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
