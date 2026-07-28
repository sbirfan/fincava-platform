import type { SessionRow } from '../lib/session.js';

declare global {
  namespace Express {
    interface Request {
      // Populated by middleware/attachSession.ts on every request; null when
      // there's no valid session cookie. Named authSession (not `session`)
      // to avoid any collision with the unrelated express-session package.
      authSession: SessionRow | null;
    }
  }
}

export {};
