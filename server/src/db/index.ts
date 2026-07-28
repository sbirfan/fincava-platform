import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../env.js';
import * as schema from './schema.js';

let poolInstance: Pool | undefined;
let dbInstance: NodePgDatabase<typeof schema> | undefined;

// Lazy singleton: the pool is only opened the first time a route actually
// needs the database, so the server can boot in Phase 0 before DATABASE_URL
// exists (see requireEnv in env.ts for the fail-loud-at-call-site behavior).
export function getDb(): NodePgDatabase<typeof schema> {
  if (!dbInstance) {
    if (!env.DATABASE_URL) {
      throw new Error(
        'DATABASE_URL is not set. Configure it in .env once the Neon project is ready.',
      );
    }
    poolInstance = new Pool({
      connectionString: env.DATABASE_URL,
      ssl: { rejectUnauthorized: true },
    });
    dbInstance = drizzle(poolInstance, { schema });
  }
  return dbInstance;
}

export { schema };
