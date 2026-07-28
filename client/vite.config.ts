import path from 'node:path';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';

// Loads the repo-root .env (not client/.env — there isn't one) so the dev
// proxy's target port follows the same PORT the server actually reads
// (server/src/env.ts), rather than needing a second variable kept in sync
// by hand. API_PORT is still an explicit override for the rare case you
// want the client pointed at a backend running on a different port than
// what's in .env (e.g. two servers side by side).
dotenv.config({ path: path.resolve(import.meta.dirname, '../.env') });
const apiPort = process.env.API_PORT ?? process.env.PORT ?? '5000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5000,
    host: '0.0.0.0',
    allowedHosts: true,
    proxy: {
      '/api': {
        target: `http://localhost:${apiPort}`,
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
