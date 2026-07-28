import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// `drizzle-kit generate` only diffs the schema file against migration
// history — it does not need a live connection. `drizzle-kit migrate` does,
// and will read DATABASE_URL from the environment when it's provided.
export default defineConfig({
  schema: './server/src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ?? 'postgresql://placeholder:placeholder@localhost:5432/placeholder',
  },
});
