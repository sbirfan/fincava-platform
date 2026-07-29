import { readFile } from 'node:fs/promises';
import path from 'node:path';
import cookieParser from 'cookie-parser';
import { eq } from 'drizzle-orm';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { getDb } from './db/index.js';
import { greenCoffeeLots } from './db/schema.js';
import { env, requireEnv } from './env.js';
import { injectLotMeta, type LotMetaInput } from './lib/lotMetaHtml.js';
import { logger } from './logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { requireAdminSession } from './middleware/adminAuth.js';
import { attachSession } from './middleware/attachSession.js';
import { globalRateLimiter } from './middleware/rateLimit.js';
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
  app.use(globalRateLimiter);
  app.use(express.json());
  // Signed cookies — §9 "session secret from env". Sessions are opaque
  // server-side references (looked up in the sessions table on every
  // request), so a forged/tampered value can never grant access on its
  // own; signing adds a cheap first check that rejects a tampered cookie
  // before it ever reaches the DB. Required, not optional, now that it's
  // actually used — fails loudly at startup, not per-request, if missing.
  app.use(cookieParser(requireEnv('SESSION_SECRET')));
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
    const indexHtmlPath = path.join(clientDist, 'index.html');

    app.use(express.static(clientDist));

    // Per-lot OpenGraph/Twitter meta injected server-side — most link
    // unfurlers (Slack, WhatsApp, X, LinkedIn) don't execute client JS, so
    // the client-side <title> update (usePageTitle.ts) never reaches them.
    // Falls through to the generic index.html for an invisible/missing lot
    // (client-side "not found" handling in LotPassport.tsx still applies).
    app.get('/lots/:lotCode', async (req, res, next) => {
      try {
        const db = getDb();
        const [lot] = await db
          .select({
            lotCode: greenCoffeeLots.lotCode,
            title: greenCoffeeLots.title,
            tastingNotes: greenCoffeeLots.tastingNotes,
            region: greenCoffeeLots.region,
            variety: greenCoffeeLots.variety,
            visible: greenCoffeeLots.visible,
            images: greenCoffeeLots.images,
          })
          .from(greenCoffeeLots)
          .where(eq(greenCoffeeLots.lotCode, req.params['lotCode'] as string))
          .limit(1);

        if (!lot || !lot.visible) {
          res.sendFile(indexHtmlPath);
          return;
        }

        const images = lot.images as Array<{ url: string }>;
        const lotMeta: LotMetaInput = {
          lotCode: lot.lotCode,
          title: lot.title,
          tastingNotes: lot.tastingNotes,
          region: lot.region,
          variety: lot.variety,
          imageUrl: images[0]?.url ?? null,
        };

        const html = await readFile(indexHtmlPath, 'utf8');
        res.send(injectLotMeta(html, lotMeta));
      } catch (err) {
        next(err);
      }
    });

    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        next();
        return;
      }
      res.sendFile(indexHtmlPath);
    });
  }

  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}
