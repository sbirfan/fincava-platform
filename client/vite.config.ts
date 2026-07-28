import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Backend defaults to port 5000 in dev (see server/src/env.ts); proxy /api
// so the client can call same-origin paths in both dev and the production
// build, where the single Express server serves both API and built
// frontend. Reads API_PORT so dev works even when 5000 is taken locally
// (e.g. macOS AirPlay Receiver binds it by default on some machines).
const apiPort = process.env.API_PORT ?? '5000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
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
