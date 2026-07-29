import path from 'node:path';
import cookieParser from 'cookie-parser';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './env.js';
import { logger } from './logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requireAdminSession } from './middleware/adminAuth.js';
import { attachSession } from './middleware/attachSession.js';
import { adminRouter } from './routes/admin.js';
import { adminAlertOutreachRouter } from './routes/adminAlertOutreach.js';
import { adminAuthRouter } from './routes/adminAuth.js';
import { adminBuyersRouter } from './routes/adminBuyers.js';
import { adminDashboardRouter } from './routes/adminDashboard.js';
import { adminLotsRouter } from './routes/adminLots.js';
import { adminMarketIntelligenceRouter } from './routes/adminMarketIntelligence.js';
import { adminRequestsRouter } from './routes/adminRequests.js';
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

  // Admin login/logout (/api/admin/login, /api/admin/logout) are
  // unauthenticated by definition — mounted first so they resolve before
  // the session gate below. Every other /api/admin/* route requires a
  // valid admin session, gated uniformly by requireAdminSession (404, not
  // 401 — see adminAuth.ts).
  app.use('/api/admin', adminAuthRouter);
  app.use('/api/admin/dashboard', requireAdminSession, adminDashboardRouter);
  app.use('/api/admin/lots', requireAdminSession, adminLotsRouter);
  app.use('/api/admin/buyers', requireAdminSession, adminBuyersRouter);
  app.use('/api/admin/requests', requireAdminSession, adminRequestsRouter);
  app.use('/api/admin/market-intelligence', requireAdminSession, adminMarketIntelligenceRouter);
  app.use('/api/admin/alert-outreach', requireAdminSession, adminAlertOutreachRouter);
  app.use('/api/admin', requireAdminSession, adminRouter);

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
